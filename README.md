# AI "码"年挥春小摊

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://jesspig.github.io/ai-spring-couplet-stalls-2026/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

基于 AI 的智能春联生成器，输入主题即可生成定制化的春联、横批和挥春。

🔗 **在线体验**: https://jesspig.github.io/ai-spring-couplet-stalls-2026/

## 功能特性

- **智能生成**: 基于 LLM 多阶段工作流，依次生成主题分析、上联、下联、横批和挥春
- **字数可选**: 支持 5字、7字、9字 三种春联规格
- **布局可调**: 灵活配置对联顺序、横批方向、福字方向
- **历史记录**: 使用 IndexedDB 本地存储生成历史，随时查看过往作品
- **隐私保护**: 纯前端应用，无后端服务器，所有数据仅存储在浏览器本地
- **多模型支持**: 兼容 OpenAI API 格式，支持自定义 API 端点和模型

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite 6
- **路由**: React Router DOM 7
- **样式**: 原生 CSS
- **包管理**: Yarn 4 (PnP)
- **部署**: GitHub Pages

## 快速开始

### 环境要求

- Node.js >= 20
- Yarn >= 4 (启用 Corepack)

### 安装依赖

```bash
corepack enable
yarn install
```

### 开发模式

```bash
yarn dev
```

### 构建

```bash
yarn build
```

## 使用说明

1. **配置 API**: 首次使用需点击右上角设置按钮，配置 AI 服务的 API URL 和 API Key
   - 支持 OpenAI 兼容格式的 API（如 OpenAI、DeepSeek、Moonshot 等）
   - 也可使用本地模型，如 Ollama (`http://localhost:11434/v1`)

2. **输入主题**: 在输入框中填写春联主题（如：马年、科技、家庭、事业等）

3. **选择配置**:
   - 字数：5字、7字、9字
   - 对联顺序：左上右下 / 右上左下
   - 横批方向：左到右 / 右到左
   - 福字方向：正贴 / 倒贴

4. **开始设计**: 点击按钮，AI 将依次完成主题分析、对联生成、挥春创作和横批点睛

5. **查看结果**: 生成完成后可在展示页面预览春联效果，支持调整布局后重新导出

## 项目结构

```
src/
├── components/          # UI 组件
│   ├── HistoryModal.tsx     # 历史记录弹窗
│   ├── SettingsButton.tsx   # 设置按钮
│   ├── SettingsModal.tsx    # 设置弹窗
│   └── SpringFestivalSVG.tsx # 春联 SVG 渲染组件
├── config/prompts/      # AI Prompt 配置
│   ├── analysis.prompt.ts      # 主题分析
│   ├── upper-couplet.prompt.ts # 上联生成
│   ├── lower-couplet.prompt.ts # 下联生成
│   ├── spring-scrolls.prompt.ts # 挥春生成
│   ├── horizontal-scroll.prompt.ts # 横批生成
│   └── election.prompt.ts      # 选举机制
├── pages/               # 页面组件
│   ├── DisplayPage.tsx  # 结果展示页
│   └── LoadingPage.tsx  # 生成进度页
├── services/            # 业务服务
│   ├── spring-workflow.service.ts # 春联生成工作流
│   └── history-db.service.ts      # 历史记录数据库
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
├── App.tsx              # 根组件
├── DesignInput.tsx      # 主输入页
└── routes.tsx           # 路由配置
```

## 生成工作流

AI 生成春联采用多阶段工作流，每个阶段独立重试，确保输出质量：

1. **主题分析**: 分析主题内涵，提取关键元素和意象
2. **生成上联**: 创作上联，奠定基调（支持重试）
3. **生成下联**: 对仗下联，呼应上联（支持重试）
4. **选举机制**: 若多次尝试未果，从历史候选中选举最佳对联
5. **生成挥春**: 创作 6 个四字挥春（支持重试，失败使用默认值）
6. **生成横批**: 点睛横批，统揽全联

## 数据存储

- **localStorage**: 存储 API 配置、模型列表、用户偏好设置
- **sessionStorage**: 存储当前生成会话的临时数据
- **IndexedDB**: 持久化存储生成历史记录

## 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

```yaml
# .github/workflows/deploy.yml
```

推送至 `master` 分支或手动触发工作流即可完成部署。

## 隐私声明

- 本项目为纯静态前端应用，无后端服务器
- 所有数据仅存储在浏览器本地（localStorage、IndexedDB）
- API Key 仅保存在用户本地，不会上传到任何服务器
- 如需离线使用，可克隆项目到本地并搭配 Ollama 本地模型运行

## 开源协议

[MIT License](LICENSE)

Copyright (c) 2026 JessPig
