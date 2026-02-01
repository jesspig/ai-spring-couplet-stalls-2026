import { useState, useEffect } from 'react';
import type { Model } from '../types/model.types';

/**
 * 设置弹窗组件属性
 */
interface SettingsModalProps {
  /** 是否显示弹窗 */
  isOpen: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 模型列表更新回调 */
  onModelsUpdate?: (models: Model[]) => void;
}

/**
 * 设置弹窗组件
 * 用于配置 API URL 和 API Key，并测试连接
 */
export default function SettingsModal({ isOpen, onClose, onModelsUpdate }: SettingsModalProps) {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [models, setModels] = useState<Model[]>([]);

  // 从 localStorage 加载保存的设置
  useEffect(() => {
    const savedUrl = localStorage.getItem('apiUrl');
    const savedKey = localStorage.getItem('apiKey');
    if (savedUrl) setApiUrl(savedUrl);
    if (savedKey) setApiKey(savedKey);
  }, []);

  // 保存设置到 localStorage
  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl);
    localStorage.setItem('apiKey', apiKey);
    // 如果有获取到模型列表，传递给父组件更新下拉菜单
    if (models.length > 0 && onModelsUpdate) {
      onModelsUpdate(models);
    }
    onClose();
  };

  // 测试连接
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
    setTestMessage('正在测试连接...');
    setModels([]);

    try {
      const baseUrl = apiUrl.replace(/\/$/, '');
      const response = await fetch(`${baseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.data) {
        setTestStatus('success');
        setTestMessage(`连接成功！获取到 ${data.data.length} 个模型`);
        setModels(data.data);
      } else {
        setTestStatus('error');
        setTestMessage(data.error?.message || '连接失败');
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : '请求失败');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h2>API 设置</h2>
          <button className="settings-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-modal-body">
          <div className="settings-form-group">
            <label htmlFor="api-url">API URL</label>
            <input
              id="api-url"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.openai.com"
            />
          </div>

          <div className="settings-form-group">
            <label htmlFor="api-key">API Key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>

          <div className="settings-test-section">
            <button
              className="settings-test-button"
              onClick={handleTest}
              disabled={testStatus === 'testing'}
            >
              {testStatus === 'testing' ? '测试中...' : '测试连接'}
            </button>

            {testStatus !== 'idle' && testStatus !== 'testing' && (
              <div className={`settings-test-message ${testStatus}`}>
                {testMessage}
              </div>
            )}

            {models.length > 0 && (
              <div className="settings-models-list">
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

        <div className="settings-modal-footer">
          <button className="settings-button-secondary" onClick={onClose}>
            取消
          </button>
          <button className="settings-button-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}