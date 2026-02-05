import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GenerationRecord } from '../types/spring.types';
import { historyDB } from '../services/history-db.service';


interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const navigate = useNavigate();
  const [records, setRecords] = useState<GenerationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const allRecords = await historyDB.getAllRecords();
      setRecords(allRecords);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSteps = (uuid: string) => {
    onClose();
    navigate(`/loading/${uuid}`);
  };

  const handleViewResult = (uuid: string) => {
    onClose();
    navigate(`/display/${uuid}`);
  };

  const handleDelete = async (uuid: string) => {
    try {
      await historyDB.deleteRecord(uuid);
      await loadRecords();
    } catch (error) {
      console.error('删除记录失败:', error);
    }
  };

  const handleClearAll = async () => {
    if (confirm('确定要清空所有历史记录吗？')) {
      try {
        await historyDB.clearAllRecords();
        await loadRecords();
      } catch (error) {
        console.error('清空记录失败:', error);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge status-completed">成功</span>;
      case 'failed':
        return <span className="status-badge status-failed">失败</span>;
      case 'aborted':
        return <span className="status-badge status-aborted">中止</span>;
      default:
        return <span className="status-badge status-pending">进行中</span>;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="history-modal-overlay" onClick={onClose}>
      <div className="history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="history-modal-header">
          <h2 className="history-modal-title">历史记录</h2>
          <button className="history-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="history-modal-content">
          {loading ? (
            <div className="history-loading">加载中...</div>
          ) : records.length === 0 ? (
            <div className="history-empty">暂无历史记录</div>
          ) : (
            <div className="history-list">
              {records.map((record) => (
                <div key={record.id} className="history-item">
                  <div className="history-item-header">
                    <div className="history-item-info">
                      <span className="history-item-topic">{record.topic}</span>
                      <span className="history-item-meta">
                        {record.wordCount}字 · {formatDate(record.createdAt)}
                      </span>
                    </div>
                    <div className="history-item-status">
                      {getStatusBadge(record.status)}
                    </div>
                  </div>
                  <div className="history-item-actions">
                    <button
                      className="history-action-btn view-steps-btn"
                      onClick={() => handleViewSteps(record.id)}
                    >
                      查看步骤
                    </button>
                    {record.status === 'completed' && (
                      <button
                        className="history-action-btn view-result-btn"
                        onClick={() => handleViewResult(record.id)}
                      >
                        查看结果
                      </button>
                    )}
                    <button
                      className="history-action-btn delete-btn"
                      onClick={() => handleDelete(record.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {records.length > 0 && (
          <div className="history-modal-footer">
            <button className="history-clear-btn" onClick={handleClearAll}>
              清空所有记录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}