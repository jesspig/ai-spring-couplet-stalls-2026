import { useState, useEffect } from 'react';
import type { Model } from '../types/model.types';

/**
 * API配置弹窗组件属性
 */
interface ApiConfigModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 模型列表更新回调 */
  onModelsUpdate?: (models: Model[]) => void;
}

/**
 * API配置弹窗组件
 * 用于配置 API URL 和 API Key，并测试连接
 */
export default function ApiConfigModal({ isOpen, onClose, onModelsUpdate }: ApiConfigModalProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [models, setModels] = useState<Model[]>([]);

  // 从 localStorage 加载保存的API配置
  useEffect(() => {
    const savedUrl = localStorage.getItem('apiUrl');
    const savedKey = localStorage.getItem('apiKey');
    if (savedUrl) setApiUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
  }, []);

  // 保存API配置到 localStorage 并刷新模型列表
  const handleSave = () => {
    if (!apiUrl.trim() || !apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('请先填写 API URL 和 API Key');
      return;
    }

    // 检查是否已通过测试获取到模型列表
    if (models.length === 0) {
      setTestStatus('error');
      setTestMessage('请先点击"测试连接"验证配置');
      return;
    }

    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('apiKey', apiKey);

    // 将测试获取的模型列表传递到下拉菜单
    if (onModelsUpdate) {
      onModelsUpdate(models);
    }

    onClose();
  };

  // 测试连接并获取模型列表
  const handleTest = async () => {
    if (!apiUrl.trim()) {
      setTestStatus('error');
      setTestMessage('请输入 API URL');
      return;
    }
    if (!apiKey.trim()) {
      setTestStatus('error');
      setTestMessage('请输入 API Key');
      return;
    }

    setTestStatus('testing');
    setTestMessage('正在获取模型列表...');

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setTestStatus('success');
        setTestMessage(`连接成功！获取到 ${data.data.length} 个模型，点击"保存"按钮保存配置`);
        setModels(data.data);
      } else {
        setTestStatus('error');
        setTestMessage(data.error?.message || '获取模型列表失败');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : '请求失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="api-config-modal-overlay">
      <div className="api-config-modal">
        <div className="api-config-modal-header">
          <h2>API 配置</h2>
          <button className="api-config-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="api-config-modal-body">
          <div className="api-config-form-group">
            <label htmlFor="api-url">API URL</label>
            <input
              id="api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.openai.com"
            />
          </div>

          <div className="api-config-form-group">
            <label htmlFor="api-key">API Key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="api-config-test-section">
            <button
              className="api-config-test-button"
              onClick={handleTest}
              disabled={testStatus === 'testing'}
            >
              {testStatus === 'testing' ? '测试中...' : '测试连接'}
            </button>

            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <div className={`api-config-test-message ${testStatus}`}>
                {testMessage}
              </div>
            )}

            {models.length > 0 && (
              <div className="api-config-models-list">
                <h4>可用模型：</h4>
                <ul>
                  {models.map((model) => (
                    <li key={model.id}>{model.id}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="api-config-modal-footer">
          <button className="api-config-button-secondary" onClick={onClose}>
            取消
          </button>
          <button className="api-config-button-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
