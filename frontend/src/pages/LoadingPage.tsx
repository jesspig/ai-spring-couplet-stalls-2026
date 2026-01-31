import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoadingPage.css';

const loadingMessages = [
  '正在挥毫泼墨...',
  '构思吉祥寓意...',
  '斟酌对仗工整...',
  '润色文字意境...',
  '即将呈现佳作...'
];

export default function LoadingPage() {
  const navigate = useNavigate();
  const [messageIndex, setMessageIndex] = useState(0);
  const [topic, setTopic] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedTopic = sessionStorage.getItem('topic');
    const selectedModel = sessionStorage.getItem('selectedModel');
    const wordCount = sessionStorage.getItem('wordCount') || '7';
    const coupletOrder = sessionStorage.getItem('coupletOrder') || 'leftUpper';
    const horizontalDirection = sessionStorage.getItem('horizontalDirection') || 'leftToRight';
    const fuOrientation = sessionStorage.getItem('fuOrientation') || 'upright';

    if (!storedTopic || !selectedModel) {
      navigate('/');
      return;
    }

    setTopic(storedTopic);

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);

    const generateSpringFestival = async () => {
      const apiUrl = localStorage.getItem('apiUrl') || '';
      const apiKey = localStorage.getItem('apiKey') || '';

      try {
        const response = await fetch('/v1/spring-festival/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            topic: storedTopic,
            model: selectedModel,
            apiUrl,
            apiKey,
            wordCount,
            coupletOrder,
            horizontalDirection,
            fuOrientation
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || '生成失败');
        }

        sessionStorage.setItem('generatedData', JSON.stringify(data));

        setTimeout(() => {
          navigate('/display');
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败，请重试';
        setError(message);
        setTimeout(() => {
          alert(message);
          navigate('/');
        }, 1500);
      }
    };

    generateSpringFestival();

    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="loading-page">
      <div className="loading-content">
        <div className="loading-spinner" />
        <h2 className="loading-title">
          {error ? '生成失败' : '正在为您创作春联'}
        </h2>
        <p className="loading-topic">主题：{topic}</p>
        <p className="loading-message">
          {error || loadingMessages[messageIndex]}
        </p>

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
