import { useState } from 'react';
import DesignInput from './DesignInput';
import LoadingPage from './pages/LoadingPage';
import DisplayPage, { type SpringFestivalData } from './pages/DisplayPage';
import './App.css';

type PageState = 'input' | 'loading' | 'display';

export default function App() {
  const [pageState, setPageState] = useState<PageState>('input');
  const [topic, setTopic] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [generatedData, setGeneratedData] = useState<SpringFestivalData | null>(null);
  const [error, setError] = useState('');

  const handleStartDesign = async (designTopic: string, model: string) => {
    setTopic(designTopic);
    setSelectedModel(model);
    setPageState('loading');
    setError('');

    try {
      const apiUrl = localStorage.getItem('apiUrl') || '';
      const apiKey = localStorage.getItem('apiKey') || '';

      const response = await fetch('/v1/spring-festival/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: designTopic,
          model: model,
          apiUrl,
          apiKey
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || '生成失败');
      }

      setGeneratedData(data);
      setPageState('display');
    } catch (err) {
      const message = err instanceof Error ? err.message : '生成失败，请重试';
      setError(message);
      setPageState('input');
      alert(message);
    }
  };

  const handleReset = () => {
    setPageState('input');
    setGeneratedData(null);
    setError('');
  };

  return (
    <div className="app">
      {pageState === 'input' && (
        <DesignInput 
          onStartDesign={handleStartDesign}
          initialTopic={topic}
          initialModel={selectedModel}
        />
      )}
      {pageState === 'loading' && <LoadingPage topic={topic} />}
      {pageState === 'display' && generatedData && (
        <DisplayPage 
          data={generatedData}
          topic={topic}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
