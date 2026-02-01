# AGENTS.md - 项目说明文档

## 项目概述

**AI "码"年挥春小摊** - 基于 AI 的春联创作平台

这是一个纯前端实现的春联生成应用，利用大语言模型通过三阶段工作流自动创作符合中国传统文化规范的春联（上联、下联、横批）和挥春。项目采用 React + Vite + TypeScript 技术栈，支持多种 OpenAI 兼容 API 服务，可直接部署到 GitHub Pages 等静态托管平台。

### 核心功能

- **三阶段工作流**：主题分析 → 春联生成 → 质量审查，确保生成质量
- **春联生成**：根据主题自动创作符合平仄对仗规则的春联
- **挥春创作**：生成四个与主题相关的吉祥挥春
- **多模型支持**：支持 OpenAI 及其他兼容的 API 服务
- **灵活配置**：支持字数（5/7/9字）、对联顺序、横批方向、福字方向等配置
- **自动审查**：内置质量审查机制，最多重试 3 次
- **精美展示**：传统风格的春联展示界面，支持实时布局调整
- **详细日志**：控制台输出完整的生成过程日志

### 核心技术栈

**前端应用**

- **框架**: React 18
- **构建工具**: Vite 6.x
- **路由管理**: React Router v7
- **语言**: TypeScript (ES2022)
- **包管理器**: Yarn 4.x
- **部署**: GitHub Pages 等静态托管平台

**设计风格**

- **UI 风格**: 夸张极简主义（Exaggerated Minimalism）
- **字体**: Noto Serif TC + Noto Sans TC
- **配色**: 中国新年红金主题

### 架构特点

- 纯前端架构，无需后端服务器
- 三阶段工作流确保春联质量
- 直接调用 OpenAI 兼容 API
- 完整的 TypeScript 类型支持
- 模块化架构，组件、服务、配置分离
- 支持灵活的配置选项
- 可部署到任何静态托管平台

## 项目结构

```
trae_demo_04/
├── src/
│   ├── components/               # React 组件
│   │   ├── SettingsButton.tsx    # 设置按钮组件
│   │   ├── SettingsModal.tsx     # 设置弹窗组件
│   │   └── Settings.css          # 设置样式
│   ├── pages/                    # 页面组件
│   │   ├── DisplayPage.tsx       # 春联展示页面（含实时控制面板）
│   │   ├── DisplayPage.css       # 展示页面样式
│   │   ├── LoadingPage.tsx       # 加载页面（执行工作流）
│   │   └── LoadingPage.css       # 加载页面样式
│   ├── config/
│   │   └── prompts.config.ts     # 三阶段工作流提示词配置
│   ├── services/
│   │   └── spring-workflow.service.ts  # 春联生成工作流服务
│   ├── App.tsx                   # 主应用组件
│   ├── App.css                   # 应用样式
│   ├── DesignInput.tsx           # 主设计输入组件
│   ├── DesignInput.css           # 设计输入样式
│   ├── main.tsx                  # React 入口
│   ├── routes.tsx                # 路由配置
│   └── style.css                 # 全局样式
├── public/
│   ├── 404.html                  # GitHub Pages SPA 路由支持
│   └── vite.svg                  # Vite 图标
├── design-system/                # 设计系统
│   └── ai-码年挥春小摊/
│       └── MASTER.md             # 设计系统主文档
├── index.html                    # HTML 模板
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── vite.config.ts                # Vite 配置（支持双环境）
├── .editorconfig                 # 编辑器统一配置
└── README.md                     # 项目说明
```

## 构建和运行

### 依赖安装

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

服务将运行在 <http://localhost:5173>

### 构建生产版本

```bash
yarn build
```

编译输出到 `dist/` 目录。

### 预览构建结果

```bash
yarn preview
```

### 预览 GitHub Pages 部署效果

```bash
yarn dev:gh
```

此命令会构建项目并使用正确的仓库名路径预览，用于本地验证 GitHub Pages 部署效果。

## 使用指南

### 通过 Web 界面

1. 启动开发服务器：`yarn dev`
2. 访问 <http://localhost:5173>
3. 点击设置按钮配置 API URL 和 API Key
4. 输入主题（如：马年、科技、家庭、事业等）
5. 选择字数（5字、7字、9字）
6. 选择对联顺序（左上右下、右上左下）
7. 选择横批方向（左到右、右到左）
8. 选择福字方向（正贴、倒贴）
9. 选择模型
10. 点击"开始设计"

### 展示页面实时调整

春联生成后，在展示页面可以通过左侧控制面板实时调整：

- **对联顺序**：切换左上右下 / 右上左下布局
- **横批方向**：切换左到右 / 右到左显示
- **福字方向**：切换正贴 / 倒贴显示
- 点击"再写一副"返回重新设计

移动端控制面板自动调整为顶部横向布局。

### 控制台日志

生成过程中，控制台会输出详细的日志：

```
=== 开始春联生成工作流 ===
主题：马年
字数：7字

=== 尝试 1/3 ===
  调用 LLM: gpt-4 (temperature: 0.7)
✓ 主题分析完成
  调用 LLM: gpt-4 (temperature: 0.8)
✓ 春联生成完成
  上联：龙腾盛世千家喜
  下联：春满神州万象新
  调用 LLM: gpt-4 (temperature: 0.3)
✓ 质量审查完成
✓ 审查通过！

=== 春联生成成功 ===
```

## 工作流说明

春联生成采用三阶段工作流，确保生成质量：

### 阶段1：主题分析（temperature: 0.7）

- 深入分析用户主题
- 提取文化意象、关键词汇
- 规划对仗方向和挥春主题
- 生成结构化的创作提示词

### 阶段2：春联生成（temperature: 0.8）

- 基于主题分析结果生成春联
- 严格遵循字数、平仄、对仗规则
- 生成上联、下联、横批和四个挥春
- 如有审查错误，会传入改进建议

### 阶段3：质量审查（temperature: 0.3）

- 审查字数是否正确
- 检查平仄格式（上仄下平）
- 验证对仗工整程度
- 检查意义相关性和用词规范
- 最多重试 3 次，直到通过审查

## 春联生成规则

系统根据以下规则生成春联：

- **字数选择**：支持 5 字、7 字、9 字春联
- **上联**：指定字数，仄声结尾（三声、四声）
- **下联**：与上联字数相等，平声结尾（一声、二声）
- **横批**：4 个字，概括主题
- **挥春**：4 个，每个 4 字，内容吉利喜庆
- 上下联必须对仗工整，意境相符
- 内容贴合用户主题，寓意吉祥如意
- 可适当融入马年元素或程序员元素（以不破坏通顺和工整为前提）

## 设计系统

### 配色方案

| 角色 | Hex | CSS 变量 |
|------|-----|----------|
| Primary | `#DC2626` | `--color-primary` |
| Primary Dark | `#991B1B` | `--color-primary-dark` |
| Primary Light | `#FEE2E2` | `--color-primary-light` |
| Gold | `#CA8A04` | `--color-gold` |
| Gold Light | `#FDE68A` | `--color-gold-light` |
| Gold Dark | `#92400E` | `--color-gold-dark` |
| Background | `#FEF2F2` | `--color-bg` |
| Paper | `#FFF8F0` | `--color-paper` |
| Text | `#450A0A` | `--color-text` |
| Text Light | `#7F1D1D` | `--color-text-light` |

### 字体

- **标题字体**: Noto Serif TC
- **正文字体**: Noto Sans TC
- **风格**: 传统、优雅、文化、多语言

### 设计风格

**风格**: 夸张极简主义（Exaggerated Minimalism）

**关键词**: 粗犷极简、超大排版、高对比度、负空间、响亮极简、宣言式设计

**适用场景**: 时尚、建筑、作品集、落地页、奢侈品、编辑风格

### 组件规范

详细的设计规范请参考 `design-system/ai-码年挥春小摊/MASTER.md`

## 开发规范

### 代码风格

- **缩进**: 2 空格（Editorconfig 配置）
- **换行符**: LF
- **字符编码**: UTF-8
- **文件结尾**: 必须包含换行符

### TypeScript 配置

- **目标**: ES2022
- **模块**: ESNext
- **严格模式**: 启用
- **模块解析**: bundler
- **输出目录**: `dist/`

### 命名约定

- **文件名**: 小写，使用短横线分隔（如 `loading-page.css`）
- **类名**: 大驼峰（如 `SpringWorkflowService`）
- **接口/类型**: 大驼峰（如 `SpringFestivalResponse`）
- **函数/变量**: 小驼峰（如 `generateSpringFestival`）

### 注释规范

- 使用中文注释
- 公共 API 必须添加 JSDoc 注释
- 复杂逻辑添加行内注释说明

### 项目约定

- 代码即文档：结构与命名必须自解释
- 零技术债务：立即清除临时代码和调试残留
- 最小抽象：≤3 行代码不创建函数
- 禁止过度设计、抽象和优化
- 函数不超过 25 行，单一职责
- 所有回复、注释及文档必须使用中文

## 常见任务

### 修改春联生成提示词

编辑 `src/config/prompts.config.ts` 文件，修改以下常量：
- `TOPIC_ANALYSIS_SYSTEM_PROMPT` - 主题分析系统提示词
- `SPRING_GENERATION_SYSTEM_PROMPT` - 春联生成系统提示词
- `REVIEW_SYSTEM_PROMPT` - 质量审查系统提示词

### 修改工作流逻辑

编辑 `src/services/spring-workflow.service.ts` 文件，修改 `SpringWorkflowService` 类：
- `executeWorkflow()` - 主工作流执行逻辑
- `analyzeTopic()` - 主题分析阶段
- `generateSpringFestival()` - 春联生成阶段
- `reviewSpringFestival()` - 质量审查阶段

### 添加新的前端组件

1. 在 `src/components/` 创建组件文件
2. 使用 TypeScript + React 编写组件
3. 遵循设计系统规范（参考 `design-system/`）
4. 在需要的地方导入使用

### 添加新的页面

1. 在 `src/pages/` 创建页面组件文件
2. 更新 `src/routes.tsx` 添加新路由
3. 遵循设计系统规范

### 修改样式

全局样式：编辑 `src/style.css`
组件样式：编辑对应的 `.css` 文件
设计系统：更新 `design-system/ai-码年挥春小摊/MASTER.md`

## 部署到 GitHub Pages

项目已配置支持 GitHub Pages 部署，采用双环境配置策略：

### 环境配置

`vite.config.ts` 已配置动态 `base` 路径：
- 开发环境：使用根路径 `/`
- 生产环境：使用仓库名路径 `/ai-spring-couplet-stalls-2026/`

### 部署步骤

1. **构建项目**

```bash
yarn build
```

2. **本地预览部署效果**

```bash
yarn dev:gh
```

3. **部署到 GitHub Pages**

将 `dist` 目录推送到 GitHub Pages，或使用 GitHub Actions 自动部署。

### SPA 路由支持

项目包含 `public/404.html` 用于 GitHub Pages 客户端路由支持，解决直接访问子路由时的 404 问题。

## 注意事项

- 这是一个纯前端项目，无需后端服务器
- API Key 存储在浏览器 localStorage 中
- 春联生成需要有效的 LLM API 配置
- 生成过程中会进行多次 API 调用（工作流）
- 建议使用具有良好中文能力的模型
- 控制台日志包含完整的生成过程，便于调试
- 设计系统变更需同步更新 `design-system/` 目录下的文档
- GitHub Pages 部署需使用 `yarn dev:gh` 验证路径配置