# AI "码"年挥春小摊 - 项目说明文档

## 项目概述

这是一个基于 React + TypeScript + Vite 构建的单页应用（SPA），用于使用 AI 生成个性化春节春联。用户可以输入主题、选择字数和布局配置，系统将通过 LLM API 生成上联、下联、横批和挥春，并以 SVG 格式展示和下载。

### 技术栈

- **前端框架**: React 18.3.1 + TypeScript 5.9.3
- **构建工具**: Vite 6.0.7
- **路由**: React Router DOM 7.13.0
- **包管理器**: Yarn (支持 PnP 模式)
- **部署平台**: GitHub Pages

### 核心功能

1. **主题输入**: 用户输入自定义主题（如"马年"、"科技"、"家庭"等）
2. **布局配置**:
   - 字数选择（5字、7字、9字）
   - 对联顺序（左上右下 / 右上左下）
   - 横批方向（左到右 / 右到左）
   - 福字方向（正贴 / 倒贴）
3. **AI 生成**: 通过 LLM API 分步骤生成春联内容
4. **实时进度**: 展示生成过程各步骤的状态
5. **SVG 展示**: 以精美的 SVG 格式展示春联
6. **图片下载**: 将 SVG 导出为 PNG 图片

### 项目结构

```plaintext
src/
├── components/          # React 组件
│   ├── SettingsButton.tsx    # 设置按钮
│   ├── SettingsModal.tsx     # 设置弹窗
│   └── SpringFestivalSVG.tsx # 春联 SVG 渲染组件
├── config/              # 配置文件
│   └── prompts/              # LLM 提示词配置
│       ├── analysis.prompt.ts      # 主题分析提示词
│       ├── upper-couplet.prompt.ts # 上联生成提示词
│       ├── lower-couplet.prompt.ts # 下联生成提示词
│       ├── spring-scrolls.prompt.ts # 挥春生成提示词
│       ├── horizontal-scroll.prompt.ts # 横批生成提示词
│       ├── election.prompt.ts       # 候选选举提示词
│       ├── format-review.prompt.ts  # 格式审查提示词
│       └── index.ts                 # 统一导出
├── pages/               # 页面组件
│   ├── DesignInput.tsx         # 首页（输入页面）
│   ├── LoadingPage.tsx         # 加载页面（生成进度）
│   └── DisplayPage.tsx         # 展示页面（结果展示）
├── services/            # 服务层
│   └── spring-workflow.service.ts # 春联生成工作流服务
├── types/               # 类型定义
│   ├── model.types.ts         # 模型相关类型
│   └── spring.types.ts        # 春联相关类型
├── utils/               # 工具函数
│   └── json-parser.util.ts    # JSON 解析工具
├── App.tsx              # 应用根组件
├── DesignInput.tsx      # 设计输入页面（入口）
├── main.tsx             # 应用入口
├── routes.tsx           # 路由配置
└── style.css            # 全局样式
```

## 构建和运行

### 开发模式

```bash
yarn dev
```

启动 Vite 开发服务器，通常在 `http://localhost:5173` 访问。

### 生产构建

```bash
yarn build
```

构建产物输出到 `dist/` 目录。

### 预览生产构建

```bash
yarn preview
```

预览生产构建版本。

### GitHub Pages 部署

项目配置了 GitHub Actions 自动部署到 GitHub Pages。配置文件位于 `.github/workflows/deploy.yml`。

- 部署路径: `/ai-spring-couplet-stalls-2026/`
- 构建命令: `yarn build`
- 输出目录: `dist/`

## 开发规范

### 代码风格

- **TypeScript**: 所有代码使用 TypeScript 编写，严格类型检查
- **函数组件**: 使用 React Hooks 和函数式组件
- **命名约定**:
  - 组件: PascalCase (如 `SpringFestivalSVG`)
  - 函数/变量: camelCase (如 `handleDownload`)
  - 类型/接口: PascalCase (如 `SpringFestivalData`)
  - 常量: UPPER_SNAKE_CASE (如 `TOPIC_ANALYSIS_SYSTEM_PROMPT`)

### 文件组织

- 每个组件配套一个 CSS 文件（如 `SpringFestivalSVG.tsx` + `SpringFestivalSVG.css`）
- 类型定义集中放在 `types/` 目录
- 提示词配置放在 `config/prompts/` 目录
- 业务逻辑封装在 `services/` 的服务类中

### 状态管理

- 使用 React 内置 `useState`、`useEffect` 管理本地状态
- 使用 `localStorage` 持久化用户配置（API 配置、模型选择等）
- 使用 `sessionStorage` 临时存储生成流程数据（主题、生成的春联内容等）
- 使用 React Router 的 `location.state` 传递页面间数据

### 工作流服务

`SpringWorkflowService` 类负责春联生成的核心工作流：

1. **主题分析**: 分析主题内涵，提取关键元素
2. **上联生成**: 创作上联，奠定基调
3. **下联生成**: 对仗下联，呼应上联
4. **挥春生成**: 创作四字挥春
5. **横批生成**: 点睛横批，统揽全联
6. **候选选举**: 当多次尝试失败时，从历史候选中选择最佳结果

工作流特性：

- 最多重试 5 次
- 实时进度回调
- 支持中止操作
- 字数验证（严格）
- 进度事件系统

### 配置要求

用户需要在设置中配置以下信息才能使用：

- **API URL**: LLM 服务的 API 地址
- **API Key**: 访问密钥
- **模型**: 选择可用的 LLM 模型

配置保存在 `localStorage` 中，模型列表会缓存到本地以减少 API 调用。

### 路由结构

- `/`: 设计输入页面
- `/loading`: 生成进度页面
- `/display`: 结果展示页面

所有路由使用 `basename` 配置以支持 GitHub Pages 部署。

### 浏览器兼容性

- 使用现代浏览器 API（ES6+）
- 依赖 SVG、Canvas 等现代特性
- 建议使用最新版 Chrome、Edge、Firefox、Safari

### 提示词工程

提示词位于 `src/config/prompts/` 目录，按功能模块分离：

- 每个提示词文件包含系统提示词和用户提示词构建函数
- 使用 TypeScript 类型确保提示词参数正确
- 支持动态插入变量（主题、字数、分析结果等）

### 错误处理

- 网络请求失败时显示友好的错误提示
- 生成失败时允许返回首页重试
- 使用 TypeScript 类型确保错误信息的安全传递
- 关键操作（如 API 调用）包含 try-catch 保护

### 性能优化

- 使用 Vite 的优化依赖预构建功能
- 模型列表缓存减少重复 API 调用
- 组件按需加载（通过 React Router 的路由分割）
- 使用 React.memo 和 useCallback 减少不必要的重渲染

### Git 提交规范

项目使用 Conventional Commits 规范（虽然未强制执行）：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 代码审查要点

在修改代码时，请确保：

1. TypeScript 类型定义完整，无 `any` 类型
2. 函数添加 JSDoc 注释说明参数和返回值
3. 遵循现有代码风格和命名约定
4. 测试关键路径（特别是 API 调用和状态管理）
5. 运行 `yarn build` 确保无编译错误
6. 检查控制台是否有警告或错误

## 常见问题

### Q: 如何更换 LLM 提供商？

A: 在设置中修改 "API URL" 和 "API Key"，确保格式兼容 OpenAI API 标准。

### Q: 为什么生成失败？

A: 可能原因：

- API 配置错误
- 网络连接问题
- 模型不支持
- 主题过于复杂导致多次重试失败

### Q: 如何自定义提示词？

A: 修改 `src/config/prompts/` 目录下的提示词文件，无需重新构建应用。

### Q: SVG 图片如何自定义样式？

A: 修改 `src/components/SpringFestivalSVG.tsx` 中的颜色配置和渲染逻辑。

### Q: 如何添加新的字数选项？

A: 修改 `src/pages/DesignInput.tsx` 的字数选项，并在 `SpringFestivalSVG.tsx` 中添加相应的自适应参数计算逻辑。
