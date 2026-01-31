import { useState, useEffect } from 'react';
import SettingsButton from './components/SettingsButton';

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
  const [topic, setTopic] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/v1/models')
      .then(res => res.json())
      .then((data: ModelsResponse) => {
        setModels(data.data || []);
        if (data.data && data.data.length > 0) {
          setSelectedModel(data.data[0].id);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // 处理模型列表更新
  const handleModelsUpdate = (newModels: Model[]) => {
    setModels(newModels);
    setError(false);
    // 如果当前选中的模型不在新列表中，选择第一个
    if (newModels.length > 0) {
      const currentExists = newModels.some(m => m.id === selectedModel);
      if (!currentExists) {
        setSelectedModel(newModels[0].id);
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
    console.log('主题:', topic, '模型:', selectedModel);
    // TODO: 开始设计逻辑
  };

  return (
    <div className="design-container">
      <div className="design-header">
        <h1 className="design-title">iFlow 码年挥春小摊</h1>
        <SettingsButton onModelsUpdate={handleModelsUpdate} />
      </div>
      <textarea
        className="design-textarea"
        placeholder="请输入一个主题"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
      />
      <div className="design-footer">
        <div className="model-selector">
          {loading ? (
            <span>加载中...</span>
          ) : error || models.length === 0 ? (
            <span>暂未配置模型</span>
          ) : (
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
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
        <button className="design-button" onClick={handleStartDesign}>
          开始设计
        </button>
      </div>
    </div>
  );
}