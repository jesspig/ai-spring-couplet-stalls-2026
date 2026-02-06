import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SpringWorkflowService } from '../services/spring-workflow.service';
import { historyDB } from '../services/history-db.service';
import StepList from '../components/StepList';
import ProgressBar from '../components/ProgressBar';
import ActionButtons from '../components/ActionButtons';
import type { ProgressEvent, ProgressEventType, GenerationRecord, WorkflowStep } from '../types/spring.types';
import { sessionStorageService, getApiConfig } from '../utils/storage.util';
import { layoutConfigToFormData } from '../utils/layout-config.util';


/**
 * UI步骤状态
 */
type UIStepStatus = 'pending' | 'running' | 'completed' | 'failed';

/**
 * UI步骤
 */
interface UIStep {
  /** 步骤唯一标识 */
  id: string;
  /** 步骤名称 */
  name: string;
  /** 步骤描述 */
  description: string;
  /** 当前状态 */
  status: UIStepStatus;
  /** 输出内容 */
  output?: string;
  /** 错误信息 */
  error?: string;
  /** 是否是重试步骤 */
  isRetry?: boolean;
}

/**
 * 根据事件类型获取状态
 */
function getStatusFromEventType(eventType: ProgressEventType): UIStepStatus {
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

export default function LoadingPage() {
  const navigate = useNavigate();
  const { uuid: recordId } = useParams<{ uuid?: string }>();
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<UIStep[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAborted, setIsAborted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const stepIdCounterRef = useRef(0);
  const workflowServiceRef = useRef<SpringWorkflowService | null>(null);
  const historyLoadedRef = useRef(false);

  // 生成唯一步骤ID
  const generateStepId = useCallback(() => {
    stepIdCounterRef.current += 1;
    return `step_${stepIdCounterRef.current}`;
  }, []);

  // 切换步骤展开/折叠状态
  const toggleStepExpand = useCallback((stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  // 中止生成
  const handleAbort = useCallback(() => {
    if (workflowServiceRef.current && !isCompleted) {
      workflowServiceRef.current.abort();
      setIsAborted(true);
      setError('生成已中止');
    }
  }, [isCompleted]);

  // 跳转到展示页面
  const handleViewResult = useCallback(() => {
    navigate(recordId ? `/display/${recordId}` : '/display');
  }, [navigate, recordId]);

  // 返回首页
  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // 处理进度事件
  const handleProgressEvent = useCallback((event: ProgressEvent) => {
    const status = getStatusFromEventType(event.type);

    setSteps(prevSteps => {
      const existingRunningIndex = prevSteps.findIndex(
        s => s.name === event.stepName && s.status === 'running'
      );

      if (existingRunningIndex !== -1) {
        return updateStep(prevSteps, existingRunningIndex, status, event);
      }

      return addNewStep(prevSteps, event, status);
    });

    if (status === 'running') {
      expandLatestRunningStep();
    }

    handleWorkflowEvents(event);
  }, [generateStepId]);

  /**
   * 更新现有步骤
   */
  const updateStep = (
    steps: UIStep[],
    index: number,
    status: UIStepStatus,
    event: ProgressEvent
  ): UIStep[] => {
    const newSteps = [...steps];
    newSteps[index] = {
      ...newSteps[index],
      status,
      output: event.output,
      error: event.error
    };
    return newSteps;
  };

  /**
   * 添加新步骤
   */
  const addNewStep = (
    steps: UIStep[],
    event: ProgressEvent,
    status: UIStepStatus
  ): UIStep[] => {
    const newStep: UIStep = {
      id: generateStepId(),
      name: event.stepName,
      description: event.stepDescription,
      status: event.type.includes('_start') ? 'running' : status,
      output: event.output,
      error: event.error,
      isRetry: event.isRetry
    };
    return [...steps, newStep];
  };

  /**
   * 展开最新的运行中步骤
   */
  const expandLatestRunningStep = (): void => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      setSteps(currentSteps => {
        const lastStep = currentSteps[currentSteps.length - 1];
        if (lastStep && lastStep.status === 'running') {
          newSet.add(lastStep.id);
        }
        return currentSteps;
      });
      return newSet;
    });
  };

  /**
   * 处理工作流级别的事件
   */
  const handleWorkflowEvents = (event: ProgressEvent): void => {
    if (event.type === 'workflow_complete') {
      setIsCompleted(true);
      return;
    }

    if (event.type === 'workflow_failed') {
      setIsFailed(true);
      setError(event.error || '生成失败');
      return;
    }

    if (event.type === 'workflow_aborted') {
      setIsAborted(true);
      setError('生成已中止');
    }
  };

  useEffect(() => {
    const loadFromHistory = async (id: string): Promise<boolean> => {
      try {
        setIsLoadingHistory(true);
        const record = await historyDB.getRecord(id);

        if (!record) {
          return false;
        }

        setTopic(record.topic);
        setSteps(deduplicateSteps(record.steps));
        updatePageStateFromRecord(record);

        return true;
      } catch (err) {
        console.error('加载历史记录失败:', err);
        return false;
      } finally {
        setIsLoadingHistory(false);
        historyLoadedRef.current = true;
      }
    };

    /**
     * 对步骤进行去重，保留最新状态
     */
    const deduplicateSteps = (steps: WorkflowStep[]): UIStep[] => {
      const stepMap = new Map<string, WorkflowStep>();
      const statusPriority = { completed: 3, running: 2, failed: 1, pending: 0 };

      for (const step of steps) {
        const existing = stepMap.get(step.name);
        if (!existing || statusPriority[step.status] >= statusPriority[existing.status]) {
          stepMap.set(step.name, step);
        }
      }

      const uniqueSteps = steps
        .filter((step, index, arr) => arr.findIndex(s => s.name === step.name) === index)
        .map(step => stepMap.get(step.name)!);

      return uniqueSteps.map((step: WorkflowStep) => ({
        id: step.id,
        name: step.name,
        description: step.description,
        status: step.status,
        output: step.output,
        error: step.error,
        isRetry: false
      }));
    };

    /**
     * 根据记录状态更新页面状态
     */
    const updatePageStateFromRecord = (record: GenerationRecord): void => {
      if (record.status === 'completed') {
        setIsCompleted(true);
        if (record.result) {
          sessionStorageService.setObject('generatedData', record.result);
        }
        return;
      }

      if (record.status === 'failed') {
        setIsFailed(true);
        setError(record.error || '生成失败');
        return;
      }

      if (record.status === 'aborted') {
        setIsAborted(true);
        setError(record.error || '生成已中止');
      }
    };

    const startNewGeneration = async () => {
      const sessionData = loadSessionData();

      if (!validateSessionData(sessionData)) {
        navigate('/');
        return;
      }

      setTopic(sessionData.topic);
      await generateSpringFestival(sessionData);
    };

    /**
     * 加载会话数据
     */
    const loadSessionData = () => ({
      topic: sessionStorageService.getString('topic'),
      selectedModel: sessionStorageService.getString('selectedModel'),
      recordId: sessionStorageService.getString('recordId'),
      wordCount: sessionStorageService.getString('wordCount') || '7',
      coupletOrder: sessionStorageService.getString('coupletOrder') || 'leftUpper',
      horizontalDirection: sessionStorageService.getString('horizontalDirection') || 'leftToRight',
      fuOrientation: sessionStorageService.getString('fuOrientation') || 'upright'
    });

    /**
     * 验证会话数据
     */
    const validateSessionData = (data: ReturnType<typeof loadSessionData>): boolean => {
      return !!(data.topic && data.selectedModel);
    };

    /**
     * 生成春联
     */
    const generateSpringFestival = async (sessionData: ReturnType<typeof loadSessionData>): Promise<void> => {
      const { apiUrl, apiKey } = getApiConfig();

      if (!validateApiConfig(apiUrl, apiKey)) {
        return;
      }

      try {
        const result = await executeWorkflow(sessionData, apiUrl, apiKey);
        handleWorkflowResult(result);
      } catch (err) {
        handleWorkflowError(err);
      }
    };

    /**
     * 验证 API 配置
     */
    const validateApiConfig = (apiUrl: string, apiKey: string): boolean => {
      if (!apiUrl || !apiKey) {
        setError('请先在设置中配置 API');
        setIsFailed(true);
        return false;
      }
      return true;
    };

    /**
     * 执行工作流
     */
    const executeWorkflow = async (
      sessionData: ReturnType<typeof loadSessionData>,
      apiUrl: string,
      apiKey: string
    ): Promise<any> => {
      console.log('\n=== 开始春联生成工作流 ===');
      console.log(`主题：${sessionData.topic}`);
      console.log(`字数：${sessionData.wordCount}字`);

      const workflowService = new SpringWorkflowService(
        apiUrl,
        apiKey,
        sessionData.selectedModel,
        sessionData.recordId || undefined
      );
      workflowServiceRef.current = workflowService;
      workflowService.setProgressCallback(handleProgressEvent);

      const formData = layoutConfigToFormData(
        sessionData.topic,
        sessionData.wordCount,
        {
          wordCount: sessionData.wordCount,
          coupletOrder: sessionData.coupletOrder as any,
          horizontalDirection: sessionData.horizontalDirection as any,
          fuOrientation: sessionData.fuOrientation as any
        }
      );

      return await workflowService.executeWorkflow(
        sessionData.topic,
        sessionData.wordCount,
        false,
        formData
      );
    };

    /**
     * 处理工作流结果
     */
    const handleWorkflowResult = (result: any): void => {
      if (result.aborted) {
        setIsAborted(true);
        setError('生成已中止');
        return;
      }

      if (result.shouldReturnToHome && !result.upperCouplet) {
        console.log('\n=== 回退到首页 ===');
        console.log('原因：', result.errorMessage);
        setError(result.errorMessage || '生成失败');
        setIsFailed(true);
        return;
      }

      sessionStorageService.setObject('generatedData', result);
      console.log('\n=== 春联生成成功 ===');
      setIsCompleted(true);
    };

    /**
     * 处理工作流错误
     */
    const handleWorkflowError = (err: unknown): void => {
      const message = err instanceof Error ? err.message : '生成失败，请重试';

      if (message === 'WORKFLOW_ABORTED') {
        setIsAborted(true);
        setError('生成已中止');
      } else {
        setError(message);
        setIsFailed(true);
        console.error('春联生成失败：', message);
      }
    };

    const initPage = async () => {
      if (recordId && !historyLoadedRef.current) {
        const loaded = await loadFromHistory(recordId);
        if (!loaded) {
          startNewGeneration();
        }
        return;
      }

      if (!recordId) {
        startNewGeneration();
      }
    };

    initPage();

    return () => {
      // 清理：如果组件卸载时工作流仍在运行，中止它
      if (workflowServiceRef.current && !isCompleted && !isAborted && !isFailed) {
        workflowServiceRef.current.abort();
      }
    };
  }, [navigate, handleProgressEvent, recordId]);

  // 计算进度百分比
  const progressPercent = isCompleted
    ? 100
    : steps.length > 0
      ? Math.round((steps.filter(s => s.status === 'completed').length / steps.length) * 100)
      : 0;

  return (
    <div className="loading-page">
      <div className="loading-content">
        {/* 标题区域 */}
        <h2 className={`loading-title ${isFailed ? 'failed' : ''} ${isAborted ? 'aborted' : ''}`}>
          {isFailed ? '生成失败' : isAborted ? '生成已中止' : isCompleted ? '生成完成' : '正在为您创作春联'}
        </h2>
        <p className="loading-topic">主题：{topic}</p>

        {/* 进度条 */}
        {!isFailed && !isAborted && (
          <ProgressBar progress={progressPercent} />
        )}

        {/* 步骤列表 */}
        <StepList
          steps={steps}
          expandedSteps={expandedSteps}
          onToggleExpand={toggleStepExpand}
        />

        {/* 操作按钮区域 */}
        <ActionButtons
          isCompleted={isCompleted}
          isFailed={isFailed}
          isAborted={isAborted}
          onAbort={handleAbort}
          onViewResult={handleViewResult}
          onBackToHome={handleBackToHome}
        />

        {/* 装饰元素 */}
        <div className="loading-decorations">
          <span className="fu-decoration">福</span>
          <span className="fu-decoration">春</span>
          <span className="fu-decoration">吉</span>
          <span className="fu-decoration">祥</span>
        </div>
      </div>
    </div>
  );
}
