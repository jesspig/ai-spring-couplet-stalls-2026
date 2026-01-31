import { useEffect } from 'react';
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
  const coupletOrder = sessionStorage.getItem('coupletOrder') || 'leftUpper';
  const horizontalDirection = sessionStorage.getItem('horizontalDirection') || 'leftToRight';
  const fuOrientation = sessionStorage.getItem('fuOrientation') || 'upright';

  const handleReset = () => {
    sessionStorage.removeItem('generatedData');
    sessionStorage.removeItem('topic');
    sessionStorage.removeItem('selectedModel');
    sessionStorage.removeItem('wordCount');
    sessionStorage.removeItem('coupletOrder');
    sessionStorage.removeItem('horizontalDirection');
    sessionStorage.removeItem('fuOrientation');
    navigate('/');
  };

  return (
    <div className="display-page">
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
            flexDirection: coupletOrder === 'leftUpper' ? 'row-reverse' : 'row'
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

        <div className="display-footer">
          <p className="display-topic">主题：{topic}</p>
          <button className="btn-primary" onClick={handleReset}>
            再写一副
          </button>
        </div>
      </div>
    </div>
  );
}