import {
  TOPIC_ANALYSIS_SYSTEM_PROMPT,
  buildTopicAnalysisPrompt,
  UPPER_COUPLET_SYSTEM_PROMPT,
  buildUpperCoupletPrompt,
  LOWER_COUPLET_SYSTEM_PROMPT,
  buildLowerCoupletPrompt,
  SPRING_SCROLLS_SYSTEM_PROMPT,
  buildSpringScrollsPrompt,
  ELECTION_SYSTEM_PROMPT,
  buildElectionPrompt,
  HORIZONTAL_SCROLL_SYSTEM_PROMPT,
  buildHorizontalScrollPrompt
} from "../config/prompts";
import { parseLLMJson } from "../utils/json-parser.util";
import { historyDB } from "./history-db.service";
import type {
  TopicAnalysisResult,
  WorkflowResponse,
  GenerationHistory,
  ProgressCallback,
  ProgressEvent,
  WorkflowStep
} from "../types/spring.types";

interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 验证字数
 */
function validateWordCount(text: string, expected: number): string | null {
  if (text.length !== expected) {
    return `字数错误：要求${expected}字，实际${text.length}字"${text}"`;
  }
  return null;
}

export class SpringWorkflowService {
  private config: LLMConfig;
  private abortController: AbortController | null = null;
  private progressCallback: ProgressCallback | null = null;
  private recordId: string | null = null;
  private syncPromise: Promise<void> = Promise.resolve();

  constructor(baseUrl: string, apiKey: string, model: string, recordId?: string) {
    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ""),
      apiKey,
      model
    };
    this.recordId = recordId || null;
  }

  /**
   * 设置进度回调
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * 发送进度事件
   */
  private emit(event: ProgressEvent): void {
    if (this.progressCallback) {
      this.progressCallback(event);
    }

    // 同步到 IndexedDB（异步操作，不阻塞主流程，但保证顺序执行）
    if (this.recordId) {
      this.syncPromise = this.syncPromise.then(() => this.syncStepToDB(event));
    }
  }

  /**
   * 同步步骤到 IndexedDB
   */
  private async syncStepToDB(event: ProgressEvent): Promise<void> {
    if (!this.recordId) return;

    try {
      // 创建 WorkflowStep 对象
      const step: WorkflowStep = {
        id: `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: event.stepName,
        description: event.stepDescription,
        status: this.getStatusFromEventType(event.type),
        output: event.output,
        error: event.error,
        startTime: event.timestamp,
        endTime: this.isCompleteEventType(event.type) ? event.timestamp : undefined
      };

      await historyDB.addStep(this.recordId, step);
    } catch (error) {
      console.error('同步步骤到 IndexedDB 失败:', error);
    }
  }

  /**
   * 从事件类型获取状态
   */
  private getStatusFromEventType(eventType: ProgressEventType): 'pending' | 'running' | 'completed' | 'failed' {
    if (eventType.includes('_start')) {
      return 'running';
    }
    if (eventType.includes('_complete')) {
      return 'completed';
    }
    if (eventType.includes('_failed')) {
      return 'failed';
    }
    return 'pending';
  }

  /**
   * 判断是否是完成类型的事件
   */
  private isCompleteEventType(eventType: ProgressEventType): boolean {
    return eventType.includes('_complete') || eventType.includes('_failed') || 
           eventType === 'workflow_complete' || eventType === 'workflow_failed' || 
           eventType === 'workflow_aborted';
  }

  /**
   * 检查是否已中止
   */
  private checkAborted(): void {
    if (this.abortController?.signal.aborted) {
      throw new Error('WORKFLOW_ABORTED');
    }
  }

  /**
   * 中止工作流
   */
  abort(): void {
    this.abortController?.abort();
  }

  async executeWorkflow(
    topic: string,
    wordCount: string,
    includeAnalysis = false,
    formData?: { coupletOrder: 'upper-lower' | 'lower-upper'; horizontalDirection: 'left-right' | 'right-left'; fuDirection: 'upright' | 'rotated' }
  ): Promise<WorkflowResponse> {
    this.abortController = new AbortController();

    const maxAttempts = 5;
    const history: GenerationHistory[] = [];
    const expectedCount = parseInt(wordCount, 10);
    let upperRetryCount = 0;
    let scrollsRetryCount = 0;

    console.log(`\n=== 开始春联生成工作流 ===`);
    console.log(`主题：${topic}`);
    console.log(`字数：${wordCount}字`);
    console.log(`最大尝试次数：${maxAttempts}`);

    // 如果有 recordId，初始化 IndexedDB 并创建记录
    if (this.recordId) {
      try {
        await historyDB.init();
        await historyDB.createRecord(
          this.recordId,
          topic,
          wordCount,
          formData || {
            coupletOrder: 'upper-lower',
            horizontalDirection: 'left-right',
            fuDirection: 'upright'
          }
        );
        console.log(`✓ 已创建生成记录: ${this.recordId}`);
      } catch (error) {
        console.error('创建 IndexedDB 记录失败:', error);
      }
    }

    try {
      this.checkAborted();
      console.log(`\n--- 阶段1：主题分析 ---`);
      
      // 发送主题分析开始事件
      this.emit({
        type: 'analysis_start',
        timestamp: Date.now(),
        stepName: '主题分析',
        stepDescription: '分析主题内涵，提取关键元素'
      });

      const analysis = await this.analyzeTopic(topic, wordCount);
      
      // 发送主题分析完成事件
      this.emit({
        type: 'analysis_complete',
        timestamp: Date.now(),
        stepName: '主题分析',
        stepDescription: '分析主题内涵，提取关键元素',
        output: analysis.substring(0, 200)
      });
      
      console.log(`✓ 主题分析完成`);
      console.log(`  分析结果：${analysis.substring(0, 100)}${analysis.length > 100 ? '...' : ''}`);

      // 第一步：生成上联和下联
      let upperCouplet = '';
      let lowerCouplet = '';
      let coupletSuccess = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        this.checkAborted();
        console.log(`\n--- 对联尝试 ${attempt}/${maxAttempts} ---`);

        try {
          this.checkAborted();
          console.log(`\n  [步骤1] 生成上联`);
          
          // 发送上联生成开始事件
          this.emit({
            type: 'upper_couplet_start',
            timestamp: Date.now(),
            stepName: upperRetryCount > 0 ? `重试生成上联 (${upperRetryCount + 1})` : '生成上联',
            stepDescription: upperRetryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
            isRetry: upperRetryCount > 0,
            retryCount: upperRetryCount
          });

          upperCouplet = await this.generateUpperCouplet(topic, wordCount, analysis);
          console.log(`   上联生成：${upperCouplet}`);
          console.log(`  上联字数：${upperCouplet.length}字`);
          
          const upperWordError = validateWordCount(upperCouplet, expectedCount);
          if (upperWordError) {
            console.log(`  ✗ 上联验证失败：${upperWordError}`);
            
            // 发送上联生成失败事件
            this.emit({
              type: 'upper_couplet_failed',
              timestamp: Date.now(),
              stepName: upperRetryCount > 0 ? `重试生成上联 (${upperRetryCount + 1})` : '生成上联',
              stepDescription: upperRetryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
              error: upperWordError,
              isRetry: upperRetryCount > 0,
              retryCount: upperRetryCount
            });
            
            upperRetryCount++;
            continue;
          }
          
          console.log(`  ✓ 上联字数验证通过`);
          
          // 发送上联生成完成事件
          this.emit({
            type: 'upper_couplet_complete',
            timestamp: Date.now(),
            stepName: upperRetryCount > 0 ? `重试生成上联 (${upperRetryCount + 1})` : '生成上联',
            stepDescription: upperRetryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
            output: upperCouplet,
            isRetry: upperRetryCount > 0,
            retryCount: upperRetryCount
          });

          this.checkAborted();
          console.log(`\n  [步骤2] 生成下联`);
          
          // 发送下联生成开始事件
          this.emit({
            type: 'lower_couplet_start',
            timestamp: Date.now(),
            stepName: '生成下联',
            stepDescription: '对仗下联，呼应上联'
          });

          lowerCouplet = await this.generateLowerCouplet(topic, wordCount, upperCouplet, analysis);
          console.log(`  下联生成：${lowerCouplet}`);
          console.log(`  下联字数：${lowerCouplet.length}字`);
          
          const lowerWordError = validateWordCount(lowerCouplet, expectedCount);
          if (lowerWordError) {
            console.log(`  ✗ 下联验证失败：${lowerWordError}`);
            
            // 发送下联生成失败事件
            this.emit({
              type: 'lower_couplet_failed',
              timestamp: Date.now(),
              stepName: '生成下联',
              stepDescription: '对仗下联，呼应上联',
              error: lowerWordError
            });
            
            // 下联失败需要重试上联
            upperRetryCount++;
            continue;
          }
          
          console.log(`  ✓ 下联字数验证通过`);
          
          // 发送下联生成完成事件
          this.emit({
            type: 'lower_couplet_complete',
            timestamp: Date.now(),
            stepName: '生成下联',
            stepDescription: '对仗下联，呼应上联',
            output: lowerCouplet
          });

          history.push({
            attempt,
            upperCouplet,
            lowerCouplet
          });

          coupletSuccess = true;
          break;

        } catch (error) {
          console.error(`  ✗ 第${attempt}次对联尝试失败：`, error);
          if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
            throw error;
          }
        }
      }

      // 如果对联生成失败，尝试选举
      if (!coupletSuccess && history.length > 0) {
        this.checkAborted();
        console.log(`\n=== 触发选举机制 ===`);
        console.log(`候选数量：${history.length}个`);
        console.log(`字数要求：${wordCount}字`);
        
        const best = await this.electBestCandidate(history, wordCount);
        console.log(`✓ 选举完成，选中第${best.selectedIndex + 1}个候选`);
        console.log(`  选择理由：${best.reason}`);
        
        upperCouplet = best.upperCouplet;
        lowerCouplet = best.lowerCouplet;

        // 发送上联最终完成事件（选举结果）
        this.emit({
          type: 'upper_couplet_complete',
          timestamp: Date.now(),
          stepName: '生成上联（选举）',
          stepDescription: '从候选中选择最佳上联',
          output: upperCouplet
        });

        // 发送下联最终完成事件（选举结果）
        this.emit({
          type: 'lower_couplet_complete',
          timestamp: Date.now(),
          stepName: '生成下联（选举）',
          stepDescription: '从候选中选择最佳下联',
          output: lowerCouplet
        });

        coupletSuccess = true;
      }

      // 对联生成完全失败
      if (!coupletSuccess) {
        console.log(`\n=== 春联生成失败 ===`);
        console.log(`尝试次数：${maxAttempts}次`);
        console.log(`失败原因：所有尝试均未通过字数验证`);
        
        // 发送工作流失败事件
        this.emit({
          type: 'workflow_failed',
          timestamp: Date.now(),
          stepName: '生成失败',
          stepDescription: '未能生成符合要求的春联',
          error: '所有尝试均未通过字数验证'
        });
        
        const result: WorkflowResponse = {
          upperCouplet: '',
          lowerCouplet: '',
          horizontalScroll: '',
          springScrolls: [],
          shouldReturnToHome: true,
          formData: {
            topic,
            wordCount,
            coupletOrder: formData?.coupletOrder || 'upper-lower',
            horizontalDirection: formData?.horizontalDirection || 'left-right',
            fuDirection: formData?.fuDirection || 'upright'
          },
          errorMessage: '未能生成符合要求的春联，请调整主题后重试。'
        };

        // 更新 IndexedDB 记录状态为失败
        if (this.recordId) {
          try {
            await historyDB.updateRecordStatus(this.recordId, 'failed', undefined, result.errorMessage);
            console.log(`✓ 已更新生成记录状态: failed`);
          } catch (error) {
            console.error('更新 IndexedDB 记录失败:', error);
          }
        }

        return result;
      }

      // 第二步：生成挥春（独立重试循环）
      let springScrolls: string[] = [];
      let scrollsSuccess = false;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        this.checkAborted();
        console.log(`\n--- 挥春尝试 ${attempt}/${maxAttempts} ---`);

        try {
          // 发送挥春生成开始事件
          this.emit({
            type: 'spring_scrolls_start',
            timestamp: Date.now(),
            stepName: scrollsRetryCount > 0 ? `重试生成挥春 (${scrollsRetryCount + 1})` : '生成挥春',
            stepDescription: scrollsRetryCount > 0 ? '重新创作挥春' : '创作四字挥春',
            isRetry: scrollsRetryCount > 0,
            retryCount: scrollsRetryCount
          });

          springScrolls = await this.generateSpringScrolls(topic, upperCouplet, lowerCouplet, analysis);
          console.log(`  挥春生成：${springScrolls.join('、')}`);
          
          const scrollErrors = springScrolls.map(s => validateWordCount(s, 4)).filter(e => e);
          if (scrollErrors.length > 0) {
            console.log(`  ✗ 挥春验证失败：${scrollErrors.join('; ')}`);
            
            // 发送挥春生成失败事件
            this.emit({
              type: 'spring_scrolls_failed',
              timestamp: Date.now(),
              stepName: scrollsRetryCount > 0 ? `重试生成挥春 (${scrollsRetryCount + 1})` : '生成挥春',
              stepDescription: scrollsRetryCount > 0 ? '重新创作挥春' : '创作四字挥春',
              error: scrollErrors.join('; '),
              isRetry: scrollsRetryCount > 0,
              retryCount: scrollsRetryCount
            });
            
            scrollsRetryCount++;
            continue;
          }
          
          console.log(`  ✓ 挥春字数验证通过`);
          
          // 发送挥春生成完成事件
          this.emit({
            type: 'spring_scrolls_complete',
            timestamp: Date.now(),
            stepName: scrollsRetryCount > 0 ? `重试生成挥春 (${scrollsRetryCount + 1})` : '生成挥春',
            stepDescription: scrollsRetryCount > 0 ? '重新创作挥春' : '创作四字挥春',
            output: springScrolls.join('、'),
            isRetry: scrollsRetryCount > 0,
            retryCount: scrollsRetryCount
          });

          scrollsSuccess = true;
          break;

        } catch (error) {
          console.error(`  ✗ 第${attempt}次挥春尝试失败：`, error);
          if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
            throw error;
          }
          scrollsRetryCount++;
        }
      }

      // 如果挥春生成失败，使用默认挥春
      if (!scrollsSuccess) {
        springScrolls = ['万事如意', '前程似锦', '阖家欢乐', '马到成功', '身体健康', '财源广进'];
        console.log(`  使用默认挥春：${springScrolls.join('、')}`);
        
        // 发送挥春生成完成事件（默认）
        this.emit({
          type: 'spring_scrolls_complete',
          timestamp: Date.now(),
          stepName: '生成挥春（默认）',
          stepDescription: '使用默认挥春',
          output: springScrolls.join('、')
        });
      }

      // 第三步：生成横批
      this.checkAborted();
      console.log(`\n  [步骤4] 生成横批`);

      // 发送横批生成开始事件
      this.emit({
        type: 'horizontal_scroll_start',
        timestamp: Date.now(),
        stepName: '生成横批',
        stepDescription: '点睛横批，统揽全联'
      });

      const horizontalScroll = await this.generateHorizontalScroll(topic, upperCouplet, lowerCouplet, analysis);
      console.log(`  横批生成：${horizontalScroll}`);

      // 发送横批生成完成事件
      this.emit({
        type: 'horizontal_scroll_complete',
        timestamp: Date.now(),
        stepName: '生成横批',
        stepDescription: '点睛横批，统揽全联',
        output: horizontalScroll
      });

      // 发送工作流完成事件
      this.emit({
        type: 'workflow_complete',
        timestamp: Date.now(),
        stepName: '生成完成',
        stepDescription: '春联生成成功'
      });

      console.log(`\n✓ 春联生成成功`);
      console.log(`  完整春联：`);
      console.log(`    上联：${upperCouplet}`);
      console.log(`    下联：${lowerCouplet}`);
      console.log(`    横批：${horizontalScroll}`);
      console.log(`    挥春：${springScrolls.join('、')}`);
      
      const result: WorkflowResponse = {
        upperCouplet,
        lowerCouplet,
        horizontalScroll,
        springScrolls
      };

      if (includeAnalysis) {
        result.analysis = analysis;
      }

      // 更新 IndexedDB 记录状态为已完成
      if (this.recordId) {
        try {
          await historyDB.updateRecordStatus(this.recordId, 'completed', result);
          console.log(`✓ 已更新生成记录状态: completed`);
        } catch (error) {
          console.error('更新 IndexedDB 记录失败:', error);
        }
      }

      return result;

    } catch (error) {
      if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
        // 发送工作中止事件
        this.emit({
          type: 'workflow_aborted',
          timestamp: Date.now(),
          stepName: '生成中止',
          stepDescription: '用户手动中止生成'
        });
        
        const abortedResult = {
          upperCouplet: '',
          lowerCouplet: '',
          horizontalScroll: '',
          springScrolls: [],
          aborted: true,
          shouldReturnToHome: true,
          formData: {
            topic,
            wordCount,
            coupletOrder: formData?.coupletOrder || 'upper-lower',
            horizontalDirection: formData?.horizontalDirection || 'left-right',
            fuDirection: formData?.fuDirection || 'upright'
          },
          errorMessage: '生成已中止'
        };

        // 更新 IndexedDB 记录状态为中止
        if (this.recordId) {
          try {
            await historyDB.updateRecordStatus(this.recordId, 'aborted', undefined, abortedResult.errorMessage);
            console.log(`✓ 已更新生成记录状态: aborted`);
          } catch (error) {
            console.error('更新 IndexedDB 记录失败:', error);
          }
        }

        return abortedResult;
      }
      throw error;
    }
  }

  private async analyzeTopic(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    console.log(`  调用LLM：主题分析`);
    const userPrompt = buildTopicAnalysisPrompt(topic, wordCount);
    const content = await this.callLLM(TOPIC_ANALYSIS_SYSTEM_PROMPT, userPrompt, 0.7);
    return content.trim();
  }

  private async generateUpperCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：上联生成`);
    const userPrompt = buildUpperCoupletPrompt(topic, wordCount, analysis);
    const content = await this.callLLM(UPPER_COUPLET_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ upperCouplet: string }>(content);
    return result.upperCouplet;
  }

  private async generateLowerCouplet(
    topic: string,
    wordCount: string,
    upperCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：下联生成`);
    const userPrompt = buildLowerCoupletPrompt(topic, wordCount, upperCouplet, analysis);
    const content = await this.callLLM(LOWER_COUPLET_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ lowerCouplet: string }>(content);
    return result.lowerCouplet;
  }

  private async generateSpringScrolls(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string[]> {
    console.log(`  调用LLM：挥春生成`);
    const userPrompt = buildSpringScrollsPrompt(topic, upperCouplet, lowerCouplet, analysis);
    const content = await this.callLLM(SPRING_SCROLLS_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ springScrolls: string[] }>(content);
    return result.springScrolls;
  }

  private async generateHorizontalScroll(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    console.log(`  调用LLM：横批生成`);
    const userPrompt = buildHorizontalScrollPrompt(topic, upperCouplet, lowerCouplet, analysis);
    const content = await this.callLLM(HORIZONTAL_SCROLL_SYSTEM_PROMPT, userPrompt, 0.8);
    const result = parseLLMJson<{ horizontalScroll: string }>(content);
    return result.horizontalScroll;
  }

  private async electBestCandidate(
    history: GenerationHistory[],
    wordCount: string
  ): Promise<{ upperCouplet: string; lowerCouplet: string; selectedIndex: number; reason: string }> {
    const candidates = history.filter(h => h.upperCouplet.length === parseInt(wordCount) && h.lowerCouplet.length === parseInt(wordCount));
    
    if (candidates.length === 0) {
      return { 
        upperCouplet: history[0].upperCouplet, 
        lowerCouplet: history[0].lowerCouplet,
        selectedIndex: 0,
        reason: '无符合字数要求的候选，选择第一个'
      };
    }

    const userPrompt = buildElectionPrompt(candidates, wordCount);
    const content = await this.callLLM(ELECTION_SYSTEM_PROMPT, userPrompt, 0.3);
    const result = JSON.parse(content) as { selectedIndex: number; reason: string };

    const selected = candidates[result.selectedIndex] || candidates[0];
    return { 
      upperCouplet: selected.upperCouplet, 
      lowerCouplet: selected.lowerCouplet,
      selectedIndex: result.selectedIndex,
      reason: result.reason
    };
  }

  private async callLLM(
    systemPrompt: string,
    userPrompt: string,
    temperature: number
  ): Promise<string> {
    const url = `${this.config.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`LLM请求失败: ${response.status}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("LLM返回内容为空");
    }

    return content;
  }
}
