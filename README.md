# AI "码"年挥春小摊

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen?logo=github)](https://jesspig.github.io/ai-spring-couplet-stalls-2026/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 项目简介

AI "码"年挥春小摊是一款基于 AI 的智能春联生成器，采用多阶段工作流设计，输入主题即可生成定制化的春联、横批和挥春。

### 设计理念

- **零技术债务**：代码结构与命名自解释，无临时代码残留
- **最小抽象**：仅提升可读性或复用性时抽象，避免过度设计
- **隐私优先**：纯前端应用，所有数据仅存储在浏览器本地
- **多模型兼容**：支持 OpenAI API 格式，兼容多种 AI 服务

### 项目背景

本项目旨在将传统春联文化与现代 AI 技术结合，让用户能够快速生成符合主题、对仗工整的春联。通过智能重试和选举机制，确保生成质量，同时提供灵活的布局配置和 SVG 导出功能。

## 在线体验

🔗 **在线体验**: <https://jesspig.github.io/ai-spring-couplet-stalls-2026/>

### 功能演示

1. 输入主题（如：马年、科技、家庭、事业等）
2. 选择字数配置（5字、7字、9字）
3. 调整布局选项（对联顺序、横批方向、福字方向）
4. AI 自动生成并实时展示进度
5. 导出高清 PNG 图片用于打印张贴

## 核心特性

### 智能生成

- **多阶段工作流**：主题分析 → 上联生成 → 下联生成 → 挥春创作 → 横批点睛
- **智能重试机制**：每个阶段独立重试，确保输出质量
- **选举机制**：多次尝试未果时，从历史候选中选举最佳对联
- **字数验证**：自动验证生成结果是否符合字数要求

### 灵活配置

- **字数可选**：支持 5字、7字、9字 三种春联规格
- **布局可调**：
  - 对联顺序：左上右下 / 右上左下
  - 横批方向：左到右 / 右到左
  - 福字方向：正贴 / 倒贴
- **实时预览**：生成完成后可调整布局并实时预览

### 数据管理

- **历史记录**：使用 IndexedDB 本地存储生成历史，随时查看过往作品
- **隐私保护**：纯前端应用，无后端服务器，所有数据仅存储在浏览器本地
- **导出功能**：一键下载高清 PNG 图片，方便打印张贴

### 多模型支持

- **OpenAI 兼容**：支持 OpenAI API 格式
- **自定义端点**：可配置自定义 API 端点和模型
- **本地模型**：支持 Ollama 等本地模型（`http://localhost:11434/v1`）

## 技术栈

### 前端框架

- **React 18**：采用函数式组件和 Hooks，构建响应式用户界面
- **TypeScript 5.9**：提供类型安全和更好的开发体验
- **Vite 6**：快速构建工具，支持热模块替换（HMR）
- **React Router DOM 7**：客户端路由管理

### 样式方案

- **SCSS**：模块化样式管理，支持变量、混合和嵌套
- **CSS Modules**：组件级样式隔离
- **SVG 渲染**：使用原生 SVG 组件实现春联渲染

### 数据存储

- **IndexedDB**：持久化存储生成历史记录
- **localStorage**：存储 API 配置、模型列表、用户偏好设置
- **sessionStorage**：存储当前生成会话的临时数据

### 开发工具

- **Yarn 4 (PnP)**：零安装的包管理器，提升安装速度
- **TypeScript**：严格类型检查，编译时错误检测
- **ESLint**：代码质量检查（需配置）

### 部署方案

- **GitHub Pages**：静态网站托管
- **GitHub Actions**：自动化 CI/CD 流程

## 快速开始

### 环境要求

- **Node.js** >= 20
- **Yarn** >= 4（启用 Corepack）

### 安装依赖

```bash
# 启用 Corepack
corepack enable

# 安装依赖
yarn install
```

### 开发模式

```bash
# 启动开发服务器
yarn dev

# 访问 http://localhost:5173
```

### 构建生产版本

```bash
# 构建生产版本
yarn build

# 预览生产构建
yarn preview
```

### 代码检查

```bash
# 类型检查
npx tsc --noEmit

# 代码格式化（需配置 Prettier）
npx prettier --write "src/**/*.{ts,tsx,scss}"
```

## 使用指南

### 配置 API

首次使用需点击右上角设置按钮，配置 AI 服务的 API URL 和 API Key。

#### 配置步骤

1. 点击右上角设置按钮
2. 输入 API URL 和 API Key
3. 选择或输入模型名称
4. 点击保存

### 生成春联

1. **输入主题**：在输入框中填写春联主题（如：马年、科技、家庭、事业等）

2. **选择配置**：
   - **字数**：5字、7字、9字
   - **对联顺序**：左上右下 / 右上左下
   - **横批方向**：左到右 / 右到左
   - **福字方向**：正贴 / 倒贴

3. **开始设计**：点击按钮，AI 将依次完成：
   - 主题分析
   - 对联生成（支持重试）
   - 挥春创作（支持重试）
   - 横批点睛

4. **查看结果**：生成完成后可在展示页面预览春联效果，支持调整布局后重新导出

### 导出图片

1. 在展示页面调整布局配置
2. 点击下载按钮
3. 选择保存位置
4. 获得高清 PNG 图片

## 项目结构

```plaintext
src/
├── components/              # UI 组件
│   ├── SpringFestivalSVG.tsx   # 春联 SVG 渲染组件
│   ├── Couplet.tsx             # 对联组件
│   ├── HorizontalScroll.tsx    # 横批组件
│   ├── SpringScrolls.tsx       # 挥春组件
│   ├── FuCharacter.tsx         # 福字组件
│   ├── HistoryModal.tsx        # 历史记录弹窗
│   ├── ApiConfigButton.tsx     # API 配置按钮
│   ├── ApiConfigModal.tsx      # API 配置弹窗
│   ├── StepList.tsx            # 生成步骤列表
│   ├── ProgressBar.tsx         # 进度条组件
│   └── ActionButtons.tsx       # 操作按钮组
├── pages/                   # 页面组件
│   ├── DesignInput.tsx      # 主输入页（首页）
│   ├── LoadingPage.tsx      # 生成进度页
│   └── DisplayPage.tsx      # 结果展示页
├── services/                # 业务服务
│   ├── spring-workflow.service.ts    # 春联生成工作流
│   ├── history-db.service.ts         # 历史记录数据库
│   ├── llm/
│   │   └── api.service.ts            # LLM API 服务
│   └── generation/                   # 生成器服务
│       ├── topic-analyzer.service.ts      # 主题分析
│       ├── couplet-generator.service.ts   # 对联生成
│       ├── spring-scrolls-generator.service.ts  # 挥春生成
│       ├── horizontal-scroll-generator.service.ts # 横批生成
│       └── election.service.ts            # 选举机制
├── config/prompts/          # AI Prompt 配置
│   ├── analysis.prompt.ts        # 主题分析
│   ├── upper-couplet.prompt.ts   # 上联生成
│   ├── lower-couplet.prompt.ts   # 下联生成
│   ├── spring-scrolls.prompt.ts  # 挥春生成
│   ├── horizontal-scroll.prompt.ts # 横批生成
│   ├── election.prompt.ts        # 选举机制
│   └── format-review.prompt.ts   # 格式校验
├── types/                   # TypeScript 类型定义
│   ├── spring.types.ts      # 春联相关类型
│   └── model.types.ts       # 模型相关类型
├── utils/                   # 工具函数
│   ├── storage.util.ts      # 存储工具（localStorage/IndexedDB）
│   ├── svg.util.ts          # SVG 渲染工具
│   ├── layout-config.util.ts # 布局配置转换
│   ├── json-parser.util.ts  # JSON 解析工具
│   ├── formatter.util.ts    # 格式化工具
│   └── uuid.util.ts         # UUID 生成工具
├── styles/                  # 样式文件
│   ├── main.scss            # 主样式入口
│   ├── abstracts/           # SCSS 变量和混合
│   ├── base/                # 基础样式
│   ├── components/          # 组件样式
│   ├── pages/               # 页面样式
│   └── layout/              # 布局样式
├── App.tsx                  # 根组件
├── routes.tsx               # 路由配置
└── main.tsx                 # 应用入口
```

### 核心文件说明

| 文件 | 说明 |
| ---- | ---- |
| [spring-workflow.service.ts](src/services/spring-workflow.service.ts) | 春联生成工作流核心服务，管理完整的生成流程 |
| [api.service.ts](src/services/llm/api.service.ts) | LLM API 服务，处理与 AI 模型的交互 |
| [SpringFestivalSVG.tsx](src/components/SpringFestivalSVG.tsx) | 春联 SVG 渲染组件，负责将春联渲染为 SVG |
| [history-db.service.ts](src/services/history-db.service.ts) | 历史记录数据库服务，使用 IndexedDB 存储生成历史 |

## 生成工作流

AI 生成春联采用多阶段工作流，每个阶段独立重试，确保输出质量：

### 工作流阶段

1. **主题分析**
   - 分析主题内涵，提取关键元素和意象
   - 为后续生成提供上下文信息

2. **生成上联**
   - 创作上联，奠定基调
   - 支持重试机制（最多 5 次）
   - 自动验证字数是否符合要求

3. **生成下联**
   - 对仗下联，呼应上联
   - 支持重试机制（最多 5 次）
   - 自动验证字数是否符合要求

4. **选举机制**
   - 若多次尝试未果，从历史候选中选举最佳对联
   - 使用 AI 模型评估候选对联质量
   - 选择最佳上联和下联组合

5. **生成挥春**
   - 创作 6 个四字挥春
   - 支持重试机制（最多 5 次）
   - 失败时使用默认挥春

6. **生成横批**
   - 点睛横批，统揽全联
   - 基于主题分析和对联内容生成

### 提示词配置说明

| 提示词文件 | 说明 |
| ---------- | ---- |
| [analysis.prompt.ts](src/config/prompts/analysis.prompt.ts) | 主题分析提示词 |
| [upper-couplet.prompt.ts](src/config/prompts/upper-couplet.prompt.ts) | 上联生成提示词 |
| [lower-couplet.prompt.ts](src/config/prompts/lower-couplet.prompt.ts) | 下联生成提示词 |
| [spring-scrolls.prompt.ts](src/config/prompts/spring-scrolls.prompt.ts) | 挥春生成提示词 |
| [horizontal-scroll.prompt.ts](src/config/prompts/horizontal-scroll.prompt.ts) | 横批生成提示词 |
| [election.prompt.ts](src/config/prompts/election.prompt.ts) | 选举机制提示词 |
| [format-review.prompt.ts](src/config/prompts/format-review.prompt.ts) | 格式校验提示词 |

### 重试策略

- **独立重试**：每个阶段独立重试，互不影响
- **最大尝试次数**：对联和挥春最多重试 5 次
- **失败处理**：
  - 对联：触发选举机制，从历史候选中选择最佳
  - 挥春：使用默认挥春（万事如意、前程似锦、阖家欢乐、马到成功、身体健康、财源广进）

### 进度跟踪

- 实时显示生成进度
- 每个阶段都有开始、进行中、完成、失败状态
- 支持用户手动中止生成过程

## 数据存储

### 存储方案

| 存储方式 | 用途 | 数据类型 |
| -------- | ---- | -------- |
| **localStorage** | API 配置、模型列表、用户偏好设置 | JSON 字符串 |
| **sessionStorage** | 当前生成会话的临时数据 | JSON 字符串 |
| **IndexedDB** | 生成历史记录 | 结构化数据 |

### IndexedDB 数据结构

```typescript
interface GenerationRecord {
  id: string;                    // 记录 ID
  topic: string;                 // 主题
  wordCount: string;             // 字数
  formData: FormData;            // 表单配置
  status: 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
  result?: WorkflowResponse;     // 生成结果
  steps: WorkflowStep[];         // 生成步骤
  createdAt: number;            // 创建时间
  updatedAt: number;            // 更新时间
}

interface WorkflowStep {
  id: string;                    // 步骤 ID
  name: string;                  // 步骤名称
  description: string;           // 步骤描述
  status: 'pending' | 'running' | 'completed' | 'failed';
  output?: string;               // 输出结果
  error?: string;                // 错误信息
  startTime: number;             // 开始时间
  endTime?: number;             // 结束时间
}
```

### 隐私保护

- **纯前端应用**：无后端服务器，所有数据仅存储在浏览器本地
- **API Key 安全**：API Key 仅保存在用户本地，不会上传到任何服务器
- **离线使用**：可克隆项目到本地并搭配 Ollama 本地模型运行

## 部署

### GitHub Pages 自动部署

项目使用 GitHub Actions 自动部署到 GitHub Pages：

```yaml
# .github/workflows/deploy.yml
```

**部署流程**：

1. 推送代码到 `master` 分支
2. GitHub Actions 自动触发构建
3. 构建完成后自动部署到 GitHub Pages
4. 访问 <https://jesspig.github.io/ai-spring-couplet-stalls-2026/>

### 手动部署

```bash
# 构建生产版本
yarn build

# 将 dist 目录内容推送到 gh-pages 分支
git add dist
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

### 自定义部署

修改 [vite.config.ts](vite.config.ts) 中的 `base` 配置：

```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/your-custom-path/' : '/',
  // ...
}));
```

## 开发指南

### 代码规范

- **函数长度**：不超过 25 行，单一职责
- **嵌套层级**：最大 3 层嵌套
- **命名规范**：代码结构与命名必须自解释
- **注释要求**：
  - 类和方法需使用 XML 文档注释并注明参数返回值
  - 字段和属性必须添加行间用途说明
  - 方法内仅复杂逻辑需添加行间注释

### 提交规范

```plaintext
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）**：

- `feat`：新功能
- `fix`：修复 bug
- `docs`：文档更新
- `style`：代码格式调整
- `refactor`：重构
- `test`：测试相关
- `chore`：构建过程或辅助工具的变动

### 分支策略

- `master`：主分支，稳定版本
- `develop`：开发分支
- `feature/*`：功能分支
- `bugfix/*`：修复分支

## 常见问题

### Q: 生成失败怎么办？

A: 请检查以下几点：

1. API 配置是否正确
2. API Key 是否有效
3. 网络连接是否正常
4. 模型是否支持

### Q: 如何使用本地模型？

A: 配置 Ollama 后，将 API URL 设置为 `http://localhost:11434/v1`，选择对应的模型即可。

### Q: 生成的春联质量如何提升？

A: 可以尝试：

1. 使用更强大的模型（如 Qwen3-Max）
2. 调整主题描述，提供更多上下文
3. 多次生成，选择最佳结果

### Q: 如何清除历史记录？

A: 在历史记录弹窗中点击清除按钮，或清除浏览器 IndexedDB 数据。

### Q: 支持哪些浏览器？

A: 支持所有现代浏览器（Chrome、Firefox、Safari、Edge）的最新版本。

## 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 报告问题

请在 GitHub Issues 中报告问题，并提供以下信息：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息（浏览器、操作系统等）

## 开源协议

[MIT License](LICENSE)

Copyright (c) 2026 JessPig
