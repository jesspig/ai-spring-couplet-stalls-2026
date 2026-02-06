import { historyDB } from "./history-db.service";
import { ApiService } from "./llm/api.service";
import {
  TopicAnalyzerService,
  CoupletGeneratorService,
  SpringScrollsGeneratorService,
  HorizontalScrollGeneratorService,
  ElectionService,
  type GenerationHistory
} from "./generation";
import type {
  TopicAnalysisResult,
  WorkflowResponse,
  ProgressCallback,
  ProgressEvent,
  WorkflowStep,
  FormData
} from "../types/spring.types";

interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

/**
 * 验证字数
 * @param text 待验证文本
 * @param expected 期望字数
 * @returns 错误信息或 null
 */
function validateWordCount(text: string, expected: number): string | null {
  if (text.length !== expected) {
    return `字数错误：要求${expected}字，实际${text.length}字"${text}"`;
  }
  return null;
}

/**
 * 春联生成工作流服务
 * 管理完整的春联生成流程，包括主题分析、上联生成、下联生成、挥春生成和横批生成
 */
export class SpringWorkflowService {
  private config: LLMConfig;
  private abortController: AbortController | null = null;
  private progressCallback: ProgressCallback | null = null;
  private recordId: string | null = null;
  private syncPromise: Promise<void> = Promise.resolve();
  private apiService: ApiService;
  private topicAnalyzer: TopicAnalyzerService;
  private coupletGenerator: CoupletGeneratorService;
  private springScrollsGenerator: SpringScrollsGeneratorService;
  private horizontalScrollGenerator: HorizontalScrollGeneratorService;
  private electionService: ElectionService;

  constructor(baseUrl: string, apiKey: string, model: string, recordId?: string) {
    this.config = {
      baseUrl: baseUrl.replace(/\/$/, ""),
      apiKey,
      model
    };
    this.recordId = recordId || null;
    this.apiService = new ApiService({ baseUrl: this.config.baseUrl, apiKey: this.config.apiKey });
    
    // 初始化生成器服务，传入模型名称
    this.topicAnalyzer = new TopicAnalyzerService(this.apiService, this.config.model);
    this.coupletGenerator = new CoupletGeneratorService(this.apiService, this.config.model);
    this.springScrollsGenerator = new SpringScrollsGeneratorService(this.apiService, this.config.model);
    this.horizontalScrollGenerator = new HorizontalScrollGeneratorService(this.apiService, this.config.model);
    this.electionService = new ElectionService(this.apiService, this.config.model);
  }

  /**
   * 设置进度回调函数
   * @param callback 进度回调函数
   */
  setProgressCallback(callback: ProgressCallback): void {
    this.progressCallback = callback;
  }

  /**
   * 发送进度事件
   * @param event 进度事件
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
   * @param event 进度事件
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
   * @param eventType 事件类型
   * @returns 步骤状态
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
   * @param eventType 事件类型
   * @returns 是否完成
   */
  private isCompleteEventType(eventType: ProgressEventType): boolean {
    return eventType.includes('_complete') || eventType.includes('_failed') ||
           eventType === 'workflow_complete' || eventType === 'workflow_failed' ||
           eventType === 'workflow_aborted';
  }

  /**
   * 检查是否已中止，如果已中止则抛出错误
   */
  private throwIfAborted(): void {
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

  /**
   * 执行春联生成工作流
   * @param topic 主题
   * @param wordCount 字数
   * @param includeAnalysis 是否包含分析结果
   * @param formData 表单配置数据
   * @returns 工作流响应
   */
  async executeWorkflow(
    topic: string,
    wordCount: string,
    includeAnalysis = false,
    formData?: { coupletOrder: 'upper-lower' | 'lower-upper'; horizontalDirection: 'left-right' | 'right-left'; fuDirection: 'upright' | 'rotated' }
  ): Promise<WorkflowResponse> {
    this.abortController = new AbortController();

    console.log(`\n=== 开始春联生成工作流 ===`);
    console.log(`主题：${topic}`);
    console.log(`字数：${wordCount}字`);

    await this.initializeRecord(topic, wordCount, formData);

    try {
      const analysis = await this.performAnalysis(topic, wordCount);
      const coupletResult = await this.generateCouplets(topic, wordCount, analysis);
      const springScrolls = await this.generateSpringScrolls(topic, coupletResult.upperCouplet, coupletResult.lowerCouplet, analysis);
      const horizontalScroll = await this.generateHorizontalScroll(topic, coupletResult.upperCouplet, coupletResult.lowerCouplet, analysis);

      const result = this.buildSuccessResult(coupletResult, horizontalScroll, springScrolls, includeAnalysis ? analysis : undefined);
      await this.updateRecordCompleted(result);

      this.emitWorkflowComplete();
      return result;
    } catch (error) {
      return this.handleWorkflowError(error, topic, wordCount, formData);
    }
  }

  /**
   * 初始化记录
   */
  private async initializeRecord(topic: string, wordCount: string, formData?: FormData): Promise<void> {
    if (!this.recordId) return;

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

  /**
   * 执行主题分析
   */
  private async performAnalysis(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    this.throwIfAborted();
    console.log(`\n--- 阶段1：主题分析 ---`);

    this.emit({
      type: 'analysis_start',
      timestamp: Date.now(),
      stepName: '主题分析',
      stepDescription: '分析主题内涵，提取关键元素'
    });

    const analysis = await this.analyzeTopic(topic, wordCount);

    this.emit({
      type: 'analysis_complete',
      timestamp: Date.now(),
      stepName: '主题分析',
      stepDescription: '分析主题内涵，提取关键元素',
      output: analysis.substring(0, 200)
    });

    console.log(`✓ 主题分析完成`);
    console.log(`  分析结果：${analysis.substring(0, 100)}${analysis.length > 100 ? '...' : ''}`);

    return analysis;
  }

  /**
   * 生成对联
   */
  private async generateCouplets(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<{ upperCouplet: string; lowerCouplet: string; history: GenerationHistory[] }> {
    const maxAttempts = 5;
    const expectedCount = parseInt(wordCount, 10);
    const history: GenerationHistory[] = [];
    let upperRetryCount = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.throwIfAborted();
      console.log(`\n--- 对联尝试 ${attempt}/${maxAttempts} ---`);

      try {
        const result = await this.generateSingleCouplet(topic, wordCount, analysis, upperRetryCount, expectedCount);
        
        if (result.success) {
          history.push({ attempt, upperCouplet: result.upperCouplet, lowerCouplet: result.lowerCouplet });
          console.log(`\n✓ 对联生成成功`);
          return { upperCouplet: result.upperCouplet, lowerCouplet: result.lowerCouplet, history };
        }

        upperRetryCount++;
      } catch (error) {
        console.error(`  ✗ 第${attempt}次对联尝试失败：`, error);
        if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
          throw error;
        }
      }
    }

    // 尝试选举
    if (history.length > 0) {
      return await this.performElection(history, wordCount);
    }

    return this.buildFailedCoupletResult(topic, wordCount);
  }

  /**
   * 生成单副对联
   */
  private async generateSingleCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult,
    retryCount: number,
    expectedCount: number
  ): Promise<{ success: boolean; upperCouplet: string; lowerCouplet: string }> {
    const upperCouplet = await this.generateUpperCoupletWithRetry(topic, wordCount, analysis, retryCount, expectedCount);
    if (!upperCouplet) {
      return { success: false, upperCouplet: '', lowerCouplet: '' };
    }

    const lowerCouplet = await this.generateLowerCoupletWithRetry(topic, wordCount, upperCouplet, analysis, expectedCount);
    if (!lowerCouplet) {
      return { success: false, upperCouplet: '', lowerCouplet: '' };
    }

    return { success: true, upperCouplet, lowerCouplet };
  }

  /**
   * 生成上联（带重试）
   */
  private async generateUpperCoupletWithRetry(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult,
    retryCount: number,
    expectedCount: number
  ): Promise<string> {
    this.throwIfAborted();
    console.log(`\n  [步骤1] 生成上联`);

    this.emit({
      type: 'upper_couplet_start',
      timestamp: Date.now(),
      stepName: retryCount > 0 ? `重试生成上联 (${retryCount + 1})` : '生成上联',
      stepDescription: retryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
      isRetry: retryCount > 0,
      retryCount
    });

    const upperCouplet = await this.generateUpperCouplet(topic, wordCount, analysis);
    console.log(`   上联生成：${upperCouplet}`);
    console.log(`  上联字数：${upperCouplet.length}字`);

    const error = validateWordCount(upperCouplet, expectedCount);
    if (error) {
      console.log(`  ✗ 上联验证失败：${error}`);
      this.emit({
        type: 'upper_couplet_failed',
        timestamp: Date.now(),
        stepName: retryCount > 0 ? `重试生成上联 (${retryCount + 1})` : '生成上联',
        stepDescription: retryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
        error,
        isRetry: retryCount > 0,
        retryCount
      });
      return '';
    }

    console.log(`  ✓ 上联字数验证通过`);
    this.emit({
      type: 'upper_couplet_complete',
      timestamp: Date.now(),
      stepName: retryCount > 0 ? `重试生成上联 (${retryCount + 1})` : '生成上联',
      stepDescription: retryCount > 0 ? '重新创作上联' : '创作上联，奠定基调',
      output: upperCouplet,
      isRetry: retryCount > 0,
      retryCount
    });

    return upperCouplet;
  }

  /**
   * 生成下联（带重试）
   */
  private async generateLowerCoupletWithRetry(
    topic: string,
    wordCount: string,
    upperCouplet: string,
    analysis: TopicAnalysisResult,
    expectedCount: number
  ): Promise<string> {
    this.throwIfAborted();
    console.log(`\n  [步骤2] 生成下联`);

    this.emit({
      type: 'lower_couplet_start',
      timestamp: Date.now(),
      stepName: '生成下联',
      stepDescription: '对仗下联，呼应上联'
    });

    const lowerCouplet = await this.generateLowerCouplet(topic, wordCount, upperCouplet, analysis);
    console.log(`  下联生成：${lowerCouplet}`);
    console.log(`  下联字数：${lowerCouplet.length}字`);

    const error = validateWordCount(lowerCouplet, expectedCount);
    if (error) {
      console.log(`  ✗ 下联验证失败：${error}`);
      this.emit({
        type: 'lower_couplet_failed',
        timestamp: Date.now(),
        stepName: '生成下联',
        stepDescription: '对仗下联，呼应上联',
        error
      });
      return '';
    }

    console.log(`  ✓ 下联字数验证通过`);
    this.emit({
      type: 'lower_couplet_complete',
      timestamp: Date.now(),
      stepName: '生成下联',
      stepDescription: '对仗下联，呼应上联',
      output: lowerCouplet
    });

    return lowerCouplet;
  }

  /**
   * 执行选举
   */
  private async performElection(
    history: GenerationHistory[],
    wordCount: string
  ): Promise<{ upperCouplet: string; lowerCouplet: string; history: GenerationHistory[] }> {
    this.throwIfAborted();
    console.log(`\n=== 触发选举机制 ===`);
    console.log(`候选数量：${history.length}个`);
    console.log(`字数要求：${wordCount}字`);

    const best = await this.selectBestCouplet(history, wordCount);
    console.log(`✓ 选举完成，选中第${best.selectedIndex + 1}个候选`);
    console.log(`  选择理由：${best.reason}`);

    this.emit({
      type: 'upper_couplet_complete',
      timestamp: Date.now(),
      stepName: '生成上联（选举）',
      stepDescription: '从候选中选择最佳上联',
      output: best.upperCouplet
    });

    this.emit({
      type: 'lower_couplet_complete',
      timestamp: Date.now(),
      stepName: '生成下联（选举）',
      stepDescription: '从候选中选择最佳下联',
      output: best.lowerCouplet
    });

    return { upperCouplet: best.upperCouplet, lowerCouplet: best.lowerCouplet, history };
  }

  /**
   * 构建失败的对联结果
   */
  private buildFailedCoupletResult(topic: string, wordCount: string): never {
    console.log(`\n=== 春联生成失败 ===`);
    console.log(`尝试次数：5次`);
    console.log(`失败原因：所有尝试均未通过字数验证`);

    this.emit({
      type: 'workflow_failed',
      timestamp: Date.now(),
      stepName: '生成失败',
      stepDescription: '未能生成符合要求的春联',
      error: '所有尝试均未通过字数验证'
    });

    throw new Error('未能生成符合要求的春联，请调整主题后重试。');
  }

  /**
   * 生成挥春
   */
  private async generateSpringScrolls(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string[]> {
    const maxAttempts = 5;
    let scrollsRetryCount = 0;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.throwIfAborted();
      console.log(`\n--- 挥春尝试 ${attempt}/${maxAttempts} ---`);

      try {
        const result = await this.generateSpringScrollsWithRetry(topic, upperCouplet, lowerCouplet, analysis, scrollsRetryCount);
        
        if (result.success) {
          return result.scrolls;
        }

        scrollsRetryCount++;
      } catch (error) {
        console.error(`  ✗ 第${attempt}次挥春尝试失败：`, error);
        if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
          throw error;
        }
        scrollsRetryCount++;
      }
    }

    // 使用默认挥春
    return this.getDefaultSpringScrolls();
  }

  /**
   * 生成挥春（带重试）
   */
  private async generateSpringScrollsWithRetry(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult,
    retryCount: number
  ): Promise<{ success: boolean; scrolls: string[] }> {
    this.emit({
      type: 'spring_scrolls_start',
      timestamp: Date.now(),
      stepName: retryCount > 0 ? `重试生成挥春 (${retryCount + 1})` : '生成挥春',
      stepDescription: retryCount > 0 ? '重新创作挥春' : '创作四字挥春',
      isRetry: retryCount > 0,
      retryCount
    });

    const springScrolls = await this.generateSpringScrollsMethod(topic, upperCouplet, lowerCouplet, analysis);
    console.log(`  挥春生成：${springScrolls.join('、')}`);

    const errors = springScrolls.map(s => validateWordCount(s, 4)).filter(e => e);
    if (errors.length > 0) {
      console.log(`  ✗ 挥春验证失败：${errors.join('; ')}`);
      this.emit({
        type: 'spring_scrolls_failed',
        timestamp: Date.now(),
        stepName: retryCount > 0 ? `重试生成挥春 (${retryCount + 1})` : '生成挥春',
        stepDescription: retryCount > 0 ? '重新创作挥春' : '创作四字挥春',
        error: errors.join('; '),
        isRetry: retryCount > 0,
        retryCount
      });
      return { success: false, scrolls: [] };
    }

    console.log(`  ✓ 挥春字数验证通过`);
    this.emit({
      type: 'spring_scrolls_complete',
      timestamp: Date.now(),
      stepName: retryCount > 0 ? `重试生成挥春 (${retryCount + 1})` : '生成挥春',
      stepDescription: retryCount > 0 ? '重新创作挥春' : '创作四字挥春',
      output: springScrolls.join('、'),
      isRetry: retryCount > 0,
      retryCount
    });

    return { success: true, scrolls: springScrolls };
  }

  /**
   * 获取默认挥春
   */
  private getDefaultSpringScrolls(): string[] {
    const springScrolls = ['万事如意', '前程似锦', '阖家欢乐', '马到成功', '身体健康', '财源广进'];
    console.log(`  使用默认挥春：${springScrolls.join('、')}`);

    this.emit({
      type: 'spring_scrolls_complete',
      timestamp: Date.now(),
      stepName: '生成挥春（默认）',
      stepDescription: '使用默认挥春',
      output: springScrolls.join('、')
    });

    return springScrolls;
  }

  /**
   * 生成横批
   */
  private async generateHorizontalScroll(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    this.throwIfAborted();
    console.log(`\n  [步骤4] 生成横批`);

    this.emit({
      type: 'horizontal_scroll_start',
      timestamp: Date.now(),
      stepName: '生成横批',
      stepDescription: '点睛横批，统揽全联'
    });

    const horizontalScroll = await this.generateHorizontalScrollMethod(topic, upperCouplet, lowerCouplet, analysis);
    console.log(`  横批生成：${horizontalScroll}`);

    this.emit({
      type: 'horizontal_scroll_complete',
      timestamp: Date.now(),
      stepName: '生成横批',
      stepDescription: '点睛横批，统揽全联',
      output: horizontalScroll
    });

    return horizontalScroll;
  }

  /**
   * 构建成功结果
   */
  private buildSuccessResult(
    coupletResult: { upperCouplet: string; lowerCouplet: string },
    horizontalScroll: string,
    springScrolls: string[],
    analysis?: TopicAnalysisResult
  ): WorkflowResponse {
    const result: WorkflowResponse = {
      upperCouplet: coupletResult.upperCouplet,
      lowerCouplet: coupletResult.lowerCouplet,
      horizontalScroll,
      springScrolls
    };

    if (analysis) {
      result.analysis = analysis;
    }

    console.log(`\n✓ 春联生成成功`);
    console.log(`  完整春联：`);
    console.log(`    上联：${result.upperCouplet}`);
    console.log(`    下联：${result.lowerCouplet}`);
    console.log(`    横批：${result.horizontalScroll}`);
    console.log(`    挥春：${result.springScrolls.join('、')}`);

    return result;
  }

  /**
   * 更新记录状态为已完成
   */
  private async updateRecordCompleted(result: WorkflowResponse): Promise<void> {
    if (!this.recordId) return;

    try {
      await historyDB.updateRecordStatus(this.recordId, 'completed', result);
      console.log(`✓ 已更新生成记录状态: completed`);
    } catch (error) {
      console.error('更新 IndexedDB 记录失败:', error);
    }
  }

  /**
   * 发送工作流完成事件
   */
  private emitWorkflowComplete(): void {
    this.emit({
      type: 'workflow_complete',
      timestamp: Date.now(),
      stepName: '生成完成',
      stepDescription: '春联生成成功'
    });
  }

  /**
   * 处理工作流错误
   */
  private handleWorkflowError(
    error: unknown,
    topic: string,
    wordCount: string,
    formData?: FormData
  ): WorkflowResponse {
    if (error instanceof Error && error.message === 'WORKFLOW_ABORTED') {
      return this.buildAbortedResult(topic, wordCount, formData);
    }

    throw error;
  }

  /**
   * 构建中止结果
   */
  private buildAbortedResult(topic: string, wordCount: string, formData?: FormData): WorkflowResponse {
    this.emit({
      type: 'workflow_aborted',
      timestamp: Date.now(),
      stepName: '生成中止',
      stepDescription: '用户手动中止生成'
    });

    const result: WorkflowResponse = {
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

    if (this.recordId) {
      this.updateRecordAborted(result.errorMessage);
    }

    return result;
  }

  /**
   * 更新记录状态为中止
   */
  private async updateRecordAborted(errorMessage: string): Promise<void> {
    if (!this.recordId) return;

    try {
      await historyDB.updateRecordStatus(this.recordId, 'aborted', undefined, errorMessage);
      console.log(`✓ 已更新生成记录状态: aborted`);
    } catch (error) {
      console.error('更新 IndexedDB 记录失败:', error);
    }
  }

  /**
   * 分析主题
   * @param topic 主题
   * @param wordCount 字数
   * @returns 主题分析结果
   */
  private async analyzeTopic(topic: string, wordCount: string): Promise<TopicAnalysisResult> {
    return this.topicAnalyzer.analyzeTopic(topic, wordCount);
  }

  /**
   * 生成上联
   * @param topic 主题
   * @param wordCount 字数
   * @param analysis 主题分析结果
   * @returns 上联
   */
  private async generateUpperCouplet(
    topic: string,
    wordCount: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    return this.coupletGenerator.generateUpperCouplet(topic, wordCount, analysis);
  }

  /**
   * 生成下联
   * @param topic 主题
   * @param wordCount 字数
   * @param upperCouplet 上联
   * @param analysis 主题分析结果
   * @returns 下联
   */
  private async generateLowerCouplet(
    topic: string,
    wordCount: string,
    upperCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    return this.coupletGenerator.generateLowerCouplet(topic, wordCount, upperCouplet, analysis);
  }

  /**
   * 生成挥春（内部方法）
   * @param topic 主题
   * @param upperCouplet 上联
   * @param lowerCouplet 下联
   * @param analysis 主题分析结果
   * @returns 挥春列表
   */
  private async generateSpringScrollsMethod(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string[]> {
    return this.springScrollsGenerator.generateSpringScrolls(topic, upperCouplet, lowerCouplet, analysis);
  }

  /**
   * 生成横批（内部方法）
   * @param topic 主题
   * @param upperCouplet 上联
   * @param lowerCouplet 下联
   * @param analysis 主题分析结果
   * @returns 横批
   */
  private async generateHorizontalScrollMethod(
    topic: string,
    upperCouplet: string,
    lowerCouplet: string,
    analysis: TopicAnalysisResult
  ): Promise<string> {
    return this.horizontalScrollGenerator.generateHorizontalScroll(topic, upperCouplet, lowerCouplet, analysis);
  }

  /**
   * 从候选中选择最佳对联
   * @param history 生成历史记录
   * @param wordCount 字数
   * @returns 最佳对联及选择信息
   */
  private async selectBestCouplet(
    history: GenerationHistory[],
    wordCount: string
  ): Promise<{ upperCouplet: string; lowerCouplet: string; selectedIndex: number; reason: string }> {
    const result = await this.electionService.selectBestCouplet(history, wordCount);
    return {
      upperCouplet: result.upperCouplet,
      lowerCouplet: result.lowerCouplet,
      selectedIndex: result.selectedIndex,
      reason: result.reason
    };
  }
}
