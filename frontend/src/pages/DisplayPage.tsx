import './DisplayPage.css';

/**
 * 春联展示页面组件
 * 展示生成的春联、横批、福字和挥春
 */
export interface SpringFestivalData {
  upperCouplet: string;
  lowerCouplet: string;
  horizontalScroll: string;
  springScrolls: string[];
}

interface DisplayPageProps {
  data: SpringFestivalData;
  topic: string;
  onReset: () => void;
}

export default function DisplayPage({ data, topic, onReset }: DisplayPageProps) {
  return (
    <div className="display-page">
      <div className="display-container">
        {/* 顶部横批 */}
        <div className="horizontal-scroll-section">
          <div className="horizontal-scroll paper-texture">
            <span className="horizontal-text">{data.horizontalScroll}</span>
          </div>
        </div>

        {/* 中间区域：上联、福字、下联 - 传统顺序：右上左下 */}
        <div className="couplets-section">
          {/* 上联 - 右侧（传统贴法） */}
          <div className="couplet-wrapper">
            <div className="couplet paper-texture upper-couplet">
              <span className="vertical-text couplet-text">{data.upperCouplet}</span>
            </div>
            <span className="couplet-label">上联</span>
          </div>

          {/* 中间福字 */}
          <div className="fu-section">
            <div className="fu-paper paper-texture">
              <span className="fu-character inverted">福</span>
            </div>
            <div className="fu-paper paper-texture">
              <span className="fu-character inverted">福</span>
            </div>
          </div>

          {/* 下联 - 左侧（传统贴法） */}
          <div className="couplet-wrapper">
            <div className="couplet paper-texture lower-couplet">
              <span className="vertical-text couplet-text">{data.lowerCouplet}</span>
            </div>
            <span className="couplet-label">下联</span>
          </div>
        </div>

        {/* 底部挥春 */}
        <div className="spring-scrolls-section">
          {data.springScrolls.map((scroll, index) => (
            <div key={index} className="spring-scroll paper-texture">
              <span className="spring-scroll-text vertical-text">{scroll}</span>
            </div>
          ))}
        </div>

        {/* 主题和重新生成按钮 */}
        <div className="display-footer">
          <p className="display-topic">主题：{topic}</p>
          <button className="btn-primary" onClick={onReset}>
            再写一副
          </button>
        </div>
      </div>
    </div>
  );
}
