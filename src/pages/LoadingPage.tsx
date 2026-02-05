import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SpringWorkflowService } from '../services/spring-workflow.service';
import { historyDB } from '../services/history-db.service';
import type { ProgressEvent, ProgressEventType, GenerationRecord, WorkflowStep } from '../types/spring.types';


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

/**
 * 获取步骤状态图标
 */
function getStepStatusIcon(status: UIStepStatus): string {
  switch (status) {
    case 'completed':
      return '✓';
    case 'running':
      return '◌';
    case 'failed':
      return '✗';
    default:
      return '○';
  }
}

/**
 * 获取步骤状态样式类
 */
function getStepStatusClass(status: UIStepStatus): string {
  switch (status) {
    case 'completed':
      return 'step-status-completed';
    case 'running':
      return 'step-status-running';
    case 'failed':
      return 'step-status-failed';
    default:
      return 'step-status-pending';
  }
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
      // 查找是否已存在相同名称的running步骤
      const existingRunningIndex = prevSteps.findIndex(
        s => s.name === event.stepName && s.status === 'running'
      );

      if (existingRunningIndex !== -1) {
        // 更新现有步骤
        const newSteps = [...prevSteps];
        newSteps[existingRunningIndex] = {
          ...newSteps[existingRunningIndex],
          status,
          output: event.output,
          error: event.error
        };
        return newSteps;
      }

      // 如果是开始事件，添加新步骤
      if (event.type.includes('_start')) {
        const newStep: UIStep = {
          id: generateStepId(),
          name: event.stepName,
          description: event.stepDescription,
          status: 'running',
          isRetry: event.isRetry
        };
        return [...prevSteps, newStep];
      }

      // 如果是完成/失败事件但没有找到running步骤，添加新步骤
      const newStep: UIStep = {
        id: generateStepId(),
        name: event.stepName,
        description: event.stepDescription,
        status,
        output: event.output,
        error: event.error,
        isRetry: event.isRetry
      };
      return [...prevSteps, newStep];
    });

    // 自动展开进行中的步骤
    if (status === 'running') {
      setExpandedSteps(prev => {
        const newSet = new Set(prev);
        // 找到最新添加的步骤ID
        setSteps(currentSteps => {
          const lastStep = currentSteps[currentSteps.length - 1];
          if (lastStep && lastStep.status === 'running') {
            newSet.add(lastStep.id);
          }
          return currentSteps;
        });
        return newSet;
      });
    }

    // 处理工作流级别的事件
    if (event.type === 'workflow_complete') {
      setIsCompleted(true);
    } else if (event.type === 'workflow_failed') {
      setIsFailed(true);
      setError(event.error || '生成失败');
    } else if (event.type === 'workflow_aborted') {
      setIsAborted(true);
      setError('生成已中止');
    }
  }, [generateStepId]);

  useEffect(() => {
    const loadFromHistory = async (id: string): Promise<boolean> => {
      try {
        setIsLoadingHistory(true);
        const record = await historyDB.getRecord(id);

        if (!record) {
          // 找不到记录，返回 false 表示需要开始新生成
          return false;
        }

        setTopic(record.topic);

        // 对步骤进行去重：同一步骤名称只保留最新状态（completed > running > failed > pending）
        const stepMap = new Map<string, WorkflowStep>();
        const statusPriority = { completed: 3, running: 2, failed: 1, pending: 0 };

        for (const step of record.steps) {
          const existing = stepMap.get(step.name);
          if (!existing || statusPriority[step.status] >= statusPriority[existing.status]) {
            stepMap.set(step.name, step);
          }
        }

        // 转换历史步骤为 UI 步骤，保持原始顺序
        const uniqueSteps = record.steps
          .filter((step, index, arr) => arr.findIndex(s => s.name === step.name) === index)
          .map(step => stepMap.get(step.name)!);

        const uiSteps = uniqueSteps.map((step: WorkflowStep) => ({
          id: step.id,
          name: step.name,
          description: step.description,
          status: step.status,
          output: step.output,
          error: step.error,
          isRetry: false
        }));

        setSteps(uiSteps);

        // 根据记录状态设置页面状态
        if (record.status === 'completed') {
          setIsCompleted(true);
          if (record.result) {
            sessionStorage.setItem('generatedData', JSON.stringify(record.result));
          }
        } else if (record.status === 'failed') {
          setIsFailed(true);
          setError(record.error || '生成失败');
        } else if (record.status === 'aborted') {
          setIsAborted(true);
          setError(record.error || '生成已中止');
        }
        // 'pending' 状态不处理，保持初始状态

        return true; // 成功加载历史记录
      } catch (err) {
        console.error('加载历史记录失败:', err);
        return false; // 出错，返回 false 表示需要开始新生成
      } finally {
        setIsLoadingHistory(false);
        historyLoadedRef.current = true;
      }
    };

    const startNewGeneration = async () => {
      const storedTopic = sessionStorage.getItem('topic');
      const selectedModel = sessionStorage.getItem('selectedModel');
      const storedRecordId = sessionStorage.getItem('recordId');
      const wordCount = sessionStorage.getItem('wordCount') || '7';
      const coupletOrder = sessionStorage.getItem('coupletOrder') || 'leftUpper';
      const horizontalDirection = sessionStorage.getItem('horizontalDirection') || 'leftToRight';
      const fuOrientation = sessionStorage.getItem('fuOrientation') || 'upright';

      if (!storedTopic || !selectedModel) {
        navigate('/');
        return;
      }

      setTopic(storedTopic);

      const generateSpringFestival = async () => {
        const apiUrl = localStorage.getItem('apiUrl') || '';
        const apiKey = localStorage.getItem('apiKey') || '';

        if (!apiUrl || !apiKey) {
          const message = '请先在设置中配置 API';
          setError(message);
          setIsFailed(true);
          return;
        }

        try {
          console.log('\n=== 开始春联生成工作流 ===');
          console.log(`主题：${storedTopic}`);
          console.log(`字数：${wordCount}字`);

          const workflowService = new SpringWorkflowService(apiUrl, apiKey, selectedModel, storedRecordId || undefined);
          workflowServiceRef.current = workflowService;

          // 设置进度回调
          workflowService.setProgressCallback(handleProgressEvent);

          const formData = {
            coupletOrder: (coupletOrder === 'leftUpper' ? 'upper-lower' : 'lower-upper') as 'upper-lower' | 'lower-upper',
            horizontalDirection: (horizontalDirection === 'leftToRight' ? 'left-right' : 'right-left') as 'left-right' | 'right-left',
            fuDirection: (fuOrientation === 'upright' ? 'upright' : 'rotated') as 'upright' | 'rotated'
          };

          const result = await workflowService.executeWorkflow(storedTopic, wordCount, false, formData);

          // 检查是否被中止
          if (result.aborted) {
            setIsAborted(true);
            setError('生成已中止');
            return;
          }

          // 检查是否需要回退到首页
          if (result.shouldReturnToHome && !result.upperCouplet) {
            console.log('\n=== 回退到首页 ===');
            console.log('原因：', result.errorMessage);
            setError(result.errorMessage || '生成失败');
            setIsFailed(true);
            return;
          }

          sessionStorage.setItem('generatedData', JSON.stringify(result));

          console.log('\n=== 春联生成成功 ===');
          setIsCompleted(true);

        } catch (err) {
          const message = err instanceof Error ? err.message : '生成失败，请重试';
          if (message === 'WORKFLOW_ABORTED') {
            setIsAborted(true);
            setError('生成已中止');
          } else {
            setError(message);
            setIsFailed(true);
            console.error('春联生成失败：', message);
          }
        }
      };

      generateSpringFestival();
    };

    const initPage = async () => {
      // 如果有 recordId，尝试从历史记录加载
      if (recordId && !historyLoadedRef.current) {
        const loaded = await loadFromHistory(recordId);
        // 如果找不到历史记录（新生成），则开始生成
        if (!loaded) {
          startNewGeneration();
        }
      } else if (!recordId) {
        // 没有 recordId，开始新生成
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
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            <span className="progress-text">{progressPercent}%</span>
          </div>
        )}

        {/* 步骤列表 - 直接展示所有步骤 */}
        <div className="steps-container">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step-item ${getStepStatusClass(step.status)} ${expandedSteps.has(step.id) ? 'expanded' : 'compact'}`}
            >
              <div className="step-header">
                <div className="step-number">{index + 1}</div>
                <div className="step-status-icon">
                  {step.status === 'running' ? (
                    <span className="spinner-small" />
                  ) : (
                    getStepStatusIcon(step.status)
                  )}
                </div>
                <div className="step-info">
                  <div className="step-name">{step.name}</div>
                  {expandedSteps.has(step.id) && (
                    <div className="step-description">{step.description}</div>
                  )}
                </div>
                {step.output && (
                  <button
                    className="step-expand-btn"
                    onClick={() => toggleStepExpand(step.id)}
                    aria-label={expandedSteps.has(step.id) ? '折叠' : '展开'}
                  >
                    {expandedSteps.has(step.id) ? '收起' : '查看'}
                  </button>
                )}
              </div>

              {/* 展开的内容区域 */}
              {expandedSteps.has(step.id) && step.output && (
                <div className="step-output">
                  <div className="step-output-content">{step.output}</div>
                </div>
              )}

              {step.error && (
                <div className="step-error">
                  <div className="step-error-content">{step.error}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 操作按钮区域 */}
        <div className="action-buttons">
          {/* 中止按钮 - 仅在生成中显示 */}
          {!isCompleted && !isFailed && !isAborted && (
            <button className="abort-button" onClick={handleAbort}>
              终止生成
            </button>
          )}

          {/* 立即查看按钮 - 仅在完成时显示 */}
          {isCompleted && (
            <>
              <button className="view-result-button" onClick={handleViewResult}>
                立即查看
              </button>
              <button className="back-home-button" onClick={handleBackToHome}>
                返回首页
              </button>
            </>
          )}

          {/* 返回首页按钮 - 在中止或失败时显示 */}
          {(isAborted || isFailed) && (
            <button className="back-home-button" onClick={handleBackToHome}>
              返回首页
            </button>
          )}
        </div>

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
