import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SettingsButton from './components/SettingsButton';
import type { Model, ModelsResponse } from './types/model.types';
import type { FormData } from './types/spring.types';
import './DesignInput.css';

export default function DesignInput() {
  const navigate = useNavigate();
  const location = useLocation();
  const [topic, setTopic] = useState('');
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);

  const [wordCount, setWordCount] = useState('5');
  const [coupletOrder, setCoupletOrder] = useState('rightUpper');
  const [horizontalDirection, setHorizontalDirection] = useState('rightToLeft');
  const [fuOrientation, setFuOrientation] = useState('upright');

  // 从localStorage加载保存的布局配置
  useEffect(() => {
    const savedWordCount = localStorage.getItem('wordCount');
    const savedCoupletOrder = localStorage.getItem('coupletOrder');
    const savedHorizontalDirection = localStorage.getItem('horizontalDirection');
    const savedFuOrientation = localStorage.getItem('fuOrientation');

    if (savedWordCount) setWordCount(savedWordCount);
    if (savedCoupletOrder) setCoupletOrder(savedCoupletOrder);
    if (savedHorizontalDirection) setHorizontalDirection(savedHorizontalDirection);
    if (savedFuOrientation) setFuOrientation(savedFuOrientation);
  }, []);

  // 保存布局配置到localStorage
  useEffect(() => {
    localStorage.setItem('wordCount', wordCount);
  }, [wordCount]);

  useEffect(() => {
    localStorage.setItem('coupletOrder', coupletOrder);
  }, [coupletOrder]);

  useEffect(() => {
    localStorage.setItem('horizontalDirection', horizontalDirection);
  }, [horizontalDirection]);

  useEffect(() => {
    localStorage.setItem('fuOrientation', fuOrientation);
  }, [fuOrientation]);

  // 从location.state恢复表单数据（仅当从LoadingPage返回时）
  useEffect(() => {
    const state = location.state as { formData?: FormData; errorMessage?: string } | null;
    if (state?.formData) {
      setTopic(state.formData.topic);
      // 注意：不从formData恢复布局配置，保持用户之前的设置
    }
    if (state?.errorMessage) {
      setReturnError(state.errorMessage);
    }
  }, [location.state]);

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

    const baseUrl = apiUrl.replace(/\/$/, '');
    fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
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
    sessionStorage.setItem('wordCount', wordCount);
    sessionStorage.setItem('coupletOrder', coupletOrder);
    sessionStorage.setItem('horizontalDirection', horizontalDirection);
    sessionStorage.setItem('fuOrientation', fuOrientation);

    navigate('/loading');
  };

  return (
    <div className="design-container">
      {/* 装饰元素 */}
      <div className="decorations">
        <span className="deco-item"><span>春</span></span>
        <span className="deco-item"><span>节</span></span>
        <span className="deco-item"><span>快</span></span>
        <span className="deco-item"><span>乐</span></span>
      </div>

      <div className="design-card">
        <div className="design-header">
          <h1 className="design-title">AI "码"年挥春小摊</h1>
          <SettingsButton onModelsUpdate={handleModelsUpdate} />
        </div>

        {returnError && (
          <div className="error-message" style={{
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '6px',
            padding: '12px 16px',
            marginBottom: '16px',
            color: '#cf1322',
            fontSize: '14px'
          }}>
            {returnError}
          </div>
        )}

        <p className="design-subtitle">输入一个主题，AI为您创作专属春联</p>
        
        <textarea
          className="design-textarea"
          placeholder="请输入一个主题，例如：马年、科技、家庭、事业..."
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={50}
        />

        <div className="design-options">
          <div className="option-group">
            <label className="option-label">字数</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${wordCount === '5' ? 'active' : ''}`}
                onClick={() => setWordCount('5')}
              >
                5字
              </button>
              <button
                className={`option-btn ${wordCount === '7' ? 'active' : ''}`}
                onClick={() => setWordCount('7')}
              >
                7字
              </button>
              <button
                className={`option-btn ${wordCount === '9' ? 'active' : ''}`}
                onClick={() => setWordCount('9')}
              >
                9字
              </button>
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">对联顺序</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${coupletOrder === 'leftUpper' ? 'active' : ''}`}
                onClick={() => setCoupletOrder('leftUpper')}
              >
                左上右下
              </button>
              <button
                className={`option-btn ${coupletOrder === 'rightUpper' ? 'active' : ''}`}
                onClick={() => setCoupletOrder('rightUpper')}
              >
                右上左下
              </button>
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">横批方向</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${horizontalDirection === 'leftToRight' ? 'active' : ''}`}
                onClick={() => setHorizontalDirection('leftToRight')}
              >
                左到右
              </button>
              <button
                className={`option-btn ${horizontalDirection === 'rightToLeft' ? 'active' : ''}`}
                onClick={() => setHorizontalDirection('rightToLeft')}
              >
                右到左
              </button>
            </div>
          </div>

          <div className="option-group">
            <label className="option-label">福字方向</label>
            <div className="option-buttons">
              <button
                className={`option-btn ${fuOrientation === 'upright' ? 'active' : ''}`}
                onClick={() => setFuOrientation('upright')}
              >
                正贴
              </button>
              <button
                className={`option-btn ${fuOrientation === 'inverted' ? 'active' : ''}`}
                onClick={() => setFuOrientation('inverted')}
              >
                倒贴
              </button>
            </div>
          </div>
        </div>
        
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
    </div>
  );
}