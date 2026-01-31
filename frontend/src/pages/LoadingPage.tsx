import { useEffect, useState } from 'react';
import './LoadingPage.css';

/**
 * 加载页面组件
 * 展示加载动画和随机提示语
 */
interface LoadingPageProps {
  topic: string;
}

const loadingMessages = [
  '正在挥毫泼墨...',
  '构思吉祥寓意...',
  '斟酌对仗工整...',
  '润色文字意境...',
  '即将呈现佳作...'
];

export default function LoadingPage({ topic }: LoadingPageProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="loading-spinner" />
        <h2 className="loading-title">正在为您创作春联</h2>
        <p className="loading-topic">主题：{topic}</p>
        <p className="loading-message">{loadingMessages[messageIndex]}</p>
        
        {/* 装饰性福字 */}
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
