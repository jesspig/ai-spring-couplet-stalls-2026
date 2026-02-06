interface ActionButtonsProps {
  isCompleted: boolean;
  isFailed: boolean;
  isAborted: boolean;
  onAbort: () => void;
  onViewResult: () => void;
  onBackToHome: () => void;
}

export default function ActionButtons({
  isCompleted,
  isFailed,
  isAborted,
  onAbort,
  onViewResult,
  onBackToHome
}: ActionButtonsProps) {
  return (
    <div className="action-buttons">
      {!isCompleted && !isFailed && !isAborted && (
        <button className="abort-button" onClick={onAbort}>
          终止生成
        </button>
      )}

      {isCompleted && (
        <>
          <button className="view-result-button" onClick={onViewResult}>
            立即查看
          </button>
          <button className="back-home-button" onClick={onBackToHome}>
            返回首页
          </button>
        </>
      )}

      {(isAborted || isFailed) && (
        <button className="back-home-button" onClick={onBackToHome}>
          返回首页
        </button>
      )}
    </div>
  );
}