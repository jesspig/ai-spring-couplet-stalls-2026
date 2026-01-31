import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsButton from './components/SettingsButton';
import './DesignInput.css';

interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface ModelsResponse {
  object: string;
  data: Model[];
}

export default function DesignInput() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiUrl = localStorage.getItem('apiUrl') || '';
    const apiKey = localStorage.getItem('apiKey') || '';

    const cachedModels = localStorage.getItem('cachedModels');
    const cachedSelectedModel = localStorage.getItem('cachedSelectedModel');

    if (cachedModels) {
      try {
        const parsedModels = JSON.parse(cachedModels);
        setModels(parsedModels);
        if (parsedModels.length > 0 && !selectedModel) {
          setSelectedModel(cachedSelectedModel || parsedModels[0].id);
        }
        setLoading(false);
      } catch (e) {
        console.error('解析缓存的模型列表失败', e);
      }
    }

    if (!apiUrl || !apiKey) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch('/v1/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiUrl, apiKey })
    })
      .then(res => res.json())
      .then((data: ModelsResponse) => {
        const newModels = data.data || [];
        setModels(newModels);
        localStorage.setItem('cachedModels', JSON.stringify(newModels));
        if (newModels.length > 0) {
          const modelToSelect = selectedModel || cachedSelectedModel || newModels[0].id;
          setSelectedModel(modelToSelect);
          localStorage.setItem('cachedSelectedModel', modelToSelect);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cachedModels) {
          setError(true);
        }
        setLoading(false);
      });
  }, []);

  const handleModelsUpdate = (newModels: Model[]) => {
    setModels(newModels);
    localStorage.setItem('cachedModels', JSON.stringify(newModels));
    setError(false);
    if (newModels.length > 0) {
      const currentExists = newModels.some(m => m.id === selectedModel);
      if (!currentExists) {
        const newSelectedModel = newModels[0].id;
        setSelectedModel(newSelectedModel);
        localStorage.setItem('cachedSelectedModel', newSelectedModel);
      }
    }
  };

  const handleStartDesign = () => {
    if (!topic.trim()) {
      alert('请输入主题');
      return;
    }
    if (!selectedModel) {
      alert('请选择模型');
      return;
    }

    sessionStorage.setItem('topic', topic.trim());
    sessionStorage.setItem('selectedModel', selectedModel);

    navigate('/loading');
  };

  return (
    <div className="design-container">
      <div className="design-card">
        <div className="design-header">
          <h1 className="design-title">AI 码年挥春小摊</h1>
          <SettingsButton onModelsUpdate={handleModelsUpdate} />
        </div>
        
        <p className="design-subtitle">输入一个主题，AI为您创作专属春联</p>
        
        <textarea
          className="design-textarea"
          placeholder="请输入一个主题，例如：马年、科技、家庭、事业..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={50}
        />
        
        <div className="design-footer">
          <div className="model-selector">
            {loading ? (
              <span className="model-status">加载模型中...</span>
            ) : error || models.length === 0 ? (
              <span className="model-status error">暂未配置模型，请点击设置</span>
            ) : (
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  localStorage.setItem('cachedSelectedModel', e.target.value);
                }}
                className="model-select"
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.id}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button className="btn-primary" onClick={handleStartDesign}>
            开始设计
          </button>
        </div>
      </div>
      
      {/* 装饰元素 */}
      <div className="decorations">
        <span className="deco-item"><span>春</span></span>
        <span className="deco-item"><span>节</span></span>
        <span className="deco-item"><span>快</span></span>
        <span className="deco-item"><span>乐</span></span>
      </div>
    </div>
  );
}
