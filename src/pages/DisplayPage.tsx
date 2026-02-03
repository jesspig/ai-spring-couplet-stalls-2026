import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpringFestivalSVG from '../components/SpringFestivalSVG';
import { historyDB } from '../services/history-db.service';
import type { GenerationRecord } from '../types/spring.types';
import './DisplayPage.css';

export interface SpringFestivalData {
  upperCouplet: string;
  lowerCouplet: string;
  horizontalScroll: string;
  springScrolls: string[];
}

export default function DisplayPage() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid?: string }>();
  const [data, setData] = useState<SpringFestivalData>({ upperCouplet: '', lowerCouplet: '', horizontalScroll: '', springScrolls: [] });
  const [topic, setTopic] = useState('');
  const [isFailed, setIsFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFromHistory = async (recordId: string) => {
      try {
        const record = await historyDB.getRecord(recordId);
        
        if (!record) {
          navigate('/');
          return;
        }

        setTopic(record.topic);

        if (record.status === 'completed' && record.result) {
          setData({
            upperCouplet: record.result.upperCouplet,
            lowerCouplet: record.result.lowerCouplet,
            horizontalScroll: record.result.horizontalScroll,
            springScrolls: record.result.springScrolls
          });
        } else if (record.status === 'failed' || record.status === 'aborted') {
          setIsFailed(true);
          setErrorMessage(record.error || '生成失败');
        }
      } catch (err) {
        console.error('加载历史记录失败:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    const loadFromSession = () => {
      const storedData = sessionStorage.getItem('generatedData');
      const storedTopic = sessionStorage.getItem('topic');

      if (!storedData || !storedTopic) {
        navigate('/');
        return;
      }

      setData(JSON.parse(storedData));
      setTopic(storedTopic);
      setLoading(false);
    };

    if (uuid) {
      loadFromHistory(uuid);
    } else {
      loadFromSession();
    }
  }, [navigate, uuid]);

  // 使用状态管理控制面板选项，初始值从 sessionStorage 读取
  const [coupletOrder, setCoupletOrder] = useState(sessionStorage.getItem('coupletOrder') || 'leftUpper');
  const [horizontalDirection, setHorizontalDirection] = useState(sessionStorage.getItem('horizontalDirection') || 'leftToRight');
  const [fuOrientation, setFuOrientation] = useState(sessionStorage.getItem('fuOrientation') || 'upright');

  // 更新对联顺序
  const handleCoupletOrderChange = (order: string) => {
    setCoupletOrder(order);
    sessionStorage.setItem('coupletOrder', order);
  };

  // 更新横批方向
  const handleHorizontalDirectionChange = (direction: string) => {
    setHorizontalDirection(direction);
    sessionStorage.setItem('horizontalDirection', direction);
  };

  // 更新福字方向
  const handleFuOrientationChange = (orientation: string) => {
    setFuOrientation(orientation);
    sessionStorage.setItem('fuOrientation', orientation);
  };

  const handleReset = () => {
    // 保留表单信息，只移除生成的数据
    sessionStorage.removeItem('generatedData');

    // 构建表单数据用于回退时恢复
    const formData = {
      topic: topic || sessionStorage.getItem('topic') || '',
      wordCount: sessionStorage.getItem('wordCount') || '7',
      coupletOrder: (coupletOrder === 'leftUpper' ? 'upper-lower' : 'lower-upper') as 'upper-lower' | 'lower-upper',
      horizontalDirection: (horizontalDirection === 'leftToRight' ? 'left-right' : 'right-left') as 'left-right' | 'right-left',
      fuDirection: (fuOrientation === 'upright' ? 'upright' : 'rotated') as 'upright' | 'rotated'
    };

    navigate('/', { state: { formData } });
  };

  const handleViewSteps = () => {
    if (uuid) {
      navigate(`/loading/${uuid}`);
    } else {
      navigate('/loading');
    }
  };

  if (loading) {
    return <div className="display-page loading">加载中...</div>;
  }

  return (
    <div className="display-page">
      {/* 控制面板 */}
      <div className="control-panel">
        <h3 className="control-panel-title">调整布局</h3>

        <div className="control-topic">
          <label className="control-label">主题</label>
          <p className="control-topic-text">{topic}</p>
        </div>

        <div className="control-group">
          <label className="control-label">对联顺序</label>
          <div className="control-buttons">
            <button
              className={`control-btn ${coupletOrder === 'leftUpper' ? 'active' : ''}`}
              onClick={() => handleCoupletOrderChange('leftUpper')}
            >
              左上右下
            </button>
            <button
              className={`control-btn ${coupletOrder === 'rightUpper' ? 'active' : ''}`}
              onClick={() => handleCoupletOrderChange('rightUpper')}
            >
              右上左下
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">横批方向</label>
          <div className="control-buttons">
            <button
              className={`control-btn ${horizontalDirection === 'leftToRight' ? 'active' : ''}`}
              onClick={() => handleHorizontalDirectionChange('leftToRight')}
            >
              左到右
            </button>
            <button
              className={`control-btn ${horizontalDirection === 'rightToLeft' ? 'active' : ''}`}
              onClick={() => handleHorizontalDirectionChange('rightToLeft')}
            >
              右到左
            </button>
          </div>
        </div>

        <div className="control-group">
          <label className="control-label">福字方向</label>
          <div className="control-buttons">
            <button
              className={`control-btn ${fuOrientation === 'upright' ? 'active' : ''}`}
              onClick={() => handleFuOrientationChange('upright')}
            >
              正贴
            </button>
            <button
              className={`control-btn ${fuOrientation === 'inverted' ? 'active' : ''}`}
              onClick={() => handleFuOrientationChange('inverted')}
            >
              倒贴
            </button>
          </div>
        </div>

        <button className="control-reset-btn" onClick={handleReset}>
          再写一副
        </button>

        <button className="control-steps-btn" onClick={handleViewSteps}>
          查看生成步骤
        </button>
      </div>

      <div className="display-container">
        {/* SVG预览区域 */}
        <div className="svg-preview-section">
          {isFailed ? (
            <div className="generation-failed">
              <div className="generation-failed-icon">✗</div>
              <h2 className="generation-failed-title">生成失败</h2>
              <p className="generation-failed-message">{errorMessage}</p>
            </div>
          ) : (
            <SpringFestivalSVG
              data={data}
              coupletOrder={coupletOrder}
              horizontalDirection={horizontalDirection}
              fuOrientation={fuOrientation}
              topic={topic}
            />
          )}
        </div>
      </div>
    </div>
  );
}
