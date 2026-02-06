import type { UIStep } from '../pages/LoadingPage';

interface StepListProps {
  steps: UIStep[];
  expandedSteps: Set<string>;
  onToggleExpand: (stepId: string) => void;
}

function getStepStatusIcon(status: UIStep['status']): string {
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

function getStepStatusClass(status: UIStep['status']): string {
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

export default function StepList({ steps, expandedSteps, onToggleExpand }: StepListProps) {
  return (
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
                onClick={() => onToggleExpand(step.id)}
                aria-label={expandedSteps.has(step.id) ? '折叠' : '展开'}
              >
                {expandedSteps.has(step.id) ? '收起' : '查看'}
              </button>
            )}
          </div>

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
  );
}