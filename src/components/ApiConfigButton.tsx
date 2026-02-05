import { useState } from 'react';
import ApiConfigModal from './ApiConfigModal';


/**
 * 模型信息
 */
interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

/**
 * API配置按钮组件属性
 */
interface ApiConfigButtonProps {
  /** 模型列表更新回调 */
  onModelsUpdate?: (models: Model[]) => void;
}

/**
 * API配置按钮组件
 * 点击后弹出API配置弹窗，用于配置API URL和API Key
 */
export default function ApiConfigButton({ onModelsUpdate }: ApiConfigButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="api-config-button"
        onClick={() => setIsOpen(true)}
        title="配置API"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="7.5" cy="15.5" r="5.5" />
          <path d="m21 2-9.6 9.6" />
          <path d="m15.5 7.5 3 3L22 7l-3-3" />
        </svg>
      </button>
      <ApiConfigModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onModelsUpdate={onModelsUpdate}
      />
    </>
  );
}
