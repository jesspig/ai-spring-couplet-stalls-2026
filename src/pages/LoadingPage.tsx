import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SpringWorkflowService } from '../services/spring-workflow.service';
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

      if (!apiUrl || !apiKey) {
        const message = '请先在设置中配置 API';
        setError(message);
        setTimeout(() => {
          alert(message);
          navigate('/');
        }, 1500);
        return;
      }

      try {
        console.log('\n=== 开始春联生成工作流 ===');
        console.log(`主题：${storedTopic}`);
        console.log(`字数：${wordCount}字`);

        const workflowService = new SpringWorkflowService(apiUrl, apiKey, selectedModel);
        const result = await workflowService.executeWorkflow(storedTopic, wordCount, false);

        sessionStorage.setItem('generatedData', JSON.stringify(result));

        console.log('\n=== 春联生成成功 ===');

        setTimeout(() => {
          navigate('/display');
        }, 1000);
      } catch (err) {
        const message = err instanceof Error ? err.message : '生成失败，请重试';
        setError(message);
        console.error('春联生成失败：', message);
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