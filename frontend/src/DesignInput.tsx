import { useState, useEffect } from 'react';

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