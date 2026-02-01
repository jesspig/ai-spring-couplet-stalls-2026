import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DisplayPage.css';

export interface SpringFestivalData {
  upperCouplet: string;
  lowerCouplet: string;
  horizontalScroll: string;
  springScrolls: string[];
}

export default function DisplayPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = sessionStorage.getItem('generatedData');
    const storedTopic = sessionStorage.getItem('topic');

    if (!storedData || !storedTopic) {
      navigate('/');
    }
  }, [navigate]);

  const data: SpringFestivalData = JSON.parse(sessionStorage.getItem('generatedData') || '{}');
  const topic = sessionStorage.getItem('topic') || '';

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
      topic: sessionStorage.getItem('topic') || '',
      wordCount: sessionStorage.getItem('wordCount') || '7',
      coupletOrder: (sessionStorage.getItem('coupletOrder') === 'leftUpper' ? 'upper-lower' : 'lower-upper') as 'upper-lower' | 'lower-upper',
      horizontalDirection: (sessionStorage.getItem('horizontalDirection') === 'leftToRight' ? 'left-right' : 'right-left') as 'left-right' | 'right-left',
      fuDirection: (sessionStorage.getItem('fuOrientation') === 'upright' ? 'upright' : 'rotated') as 'upright' | 'rotated'
    };

    navigate('/', { state: { formData } });
  };

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
      </div>

      <div className="display-container">
        <div className="horizontal-scroll-section">
          <div className="horizontal-scroll paper-texture">
            <span
              className="horizontal-text"
              style={{
                direction: horizontalDirection === 'leftToRight' ? 'ltr' : 'rtl',
                unicodeBidi: 'bidi-override'
              }}
            >
              {data.horizontalScroll}
            </span>
          </div>
        </div>

        <div
          className="couplets-section"
          style={{
            flexDirection: coupletOrder === 'leftUpper' ? 'row' : 'row-reverse'
          }}
        >
          <div className="couplet-wrapper">
            <div className="couplet paper-texture upper-couplet">
              <span className="vertical-text couplet-text">{data.upperCouplet}</span>
            </div>
            <span className="couplet-label">上联</span>
          </div>

          <div className="fu-section">
            <div className="fu-paper paper-texture">
              <span
                className={`fu-character ${fuOrientation === 'inverted' ? 'inverted' : ''}`}
              >
                福
              </span>
            </div>
            <div className="fu-paper paper-texture">
              <span
                className={`fu-character ${fuOrientation === 'inverted' ? 'inverted' : ''}`}
              >
                福
              </span>
            </div>
          </div>

          <div className="couplet-wrapper">
            <div className="couplet paper-texture lower-couplet">
              <span className="vertical-text couplet-text">{data.lowerCouplet}</span>
            </div>
            <span className="couplet-label">下联</span>
          </div>
        </div>

        <div className="spring-scrolls-section">
          {data.springScrolls?.map((scroll, index) => (
            <div key={index} className="spring-scroll paper-texture">
              <span className="spring-scroll-text vertical-text">{scroll}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
