# AI "码"年挥春小摊 - 项目文档

## 项目概述

**AI "码"年挥春小摊**是一个基于 React + TypeScript 的现代化 Web 应用，利用大语言模型（LLM）为用户生成定制化的春联作品。该项目融合了传统文化与现代 AI 技术，为用户提供创意春联生成服务。

### 核心功能

- **智能春联生成**：基于用户输入的主题，生成符合平仄、对仗规则的春联
- **三阶段工作流**：主题分析 → 春联生成 → 质量审查，确保生成质量
- **布局自定义**：支持调整对联顺序、横批方向、福字方向等
- **传统设计风格**：采用中文传统节日设计语言，包含优雅的配色和排版

### 技术栈

- **前端框架**：React 18.3.1 + TypeScript
- **构建工具**：Vite 6.0.7
- **路由**：React Router DOM 7.13.0
- **样式**：原生 CSS + Google Fonts（Noto Serif TC + Noto Sans TC）
- **设计系统**：自定义中文传统设计规范

## 项目结构

```plaintext
src/
├── components/          # React 组件
│   ├── SettingsButton.tsx    # 设置按钮组件
│   └── SettingsModal.tsx     # 设置弹窗组件
├── config/             # 配置文件
│   └── prompts/        # LLM 提示词配置
│       ├── analysis.prompt.ts     # 主题分析提示词
│       ├── generation.prompt.ts   # 春联生成提示词
│       ├── review.prompt.ts       # 质量审查提示词
│       └── election.prompt.ts     # 选举机制提示词
├── pages/              # 页面组件
│   ├── DisplayPage.tsx    # 显示页面
│   ├── LoadingPage.tsx    # 加载页面
│   └── DisplayPage.css    # 显示页面样式
├── services/           # 服务层
│   └── spring-workflow.service.ts  # 春联工作流服务
├── types/              # TypeScript 类型定义
│   ├── model.types.ts     # 模型类型
│   └── spring.types.ts    # 春联相关类型
├── utils/              # 工具函数
│   └── json-parser.util.ts # JSON 解析工具
├── App.tsx             # 根组件
├── DesignInput.tsx     # 设计输入页面
├── main.tsx            # 应用入口
└── routes.tsx          # 路由配置
```

## 构建和运行

### 环境要求

- Node.js 18+
- Yarn 包管理器

### 开发命令

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 构建生产版本
yarn build

# 预览构建结果
yarn preview

# GitHub Pages 部署（构建并预览）
yarn dev:gh
```

### 开发服务器

开发服务器默认运行在 `http://localhost:5173`

## 开发约定

### 代码风格

- **函数长度**：不超过 25 行，单一职责，最大 3 层嵌套
- **类型安全**：所有函数和方法必须有完整的 TypeScript 类型定义
- **注释规范**：
  - 类和方法必须使用 XML 文档注释
  - 字段和属性必须添加行间用途说明
  - 方法内仅复杂逻辑需添加行间注释
- **文件命名**：使用 PascalCase 命名组件文件，camelCase 命名其他文件

### 设计系统

项目遵循自定义的中文传统设计规范（详见 `design-system/ai-码年挥春小摊/MASTER.md`）：

- **配色方案**：深蓝 (#0F172A) + 金色 (#CA8A04) + 浅灰 (#F8FAFC)
- **字体**：Noto Serif TC（标题）+ Noto Sans TC（正文）
- **间距**：基于 4px 基础单位的系统（--space-xs 到 --space-3xl）
- **阴影**：--shadow-sm 到 --shadow-xl 五级阴影系统
- **设计风格**：夸张极简主义（Bold Minimalism）

### API 集成

项目通过 `spring-workflow.service.ts` 与 LLM API 集成：

- **工作流**：三阶段（分析 → 生成 → 审查）
- **容错机制**：最大 5 次重试，失败时自动选举最优候选
- **参数配置**：支持温度参数、最大 token 数等 LLM 参数
- **错误分类**：格式错误、平仄不合规、对仗不工整、内容问题等

### 状态管理

- **SessionStorage**：存储生成数据、表单数据和用户偏好
- **React Router**：管理页面路由和状态传递
- **表单恢复**：支持从失败状态恢复用户输入

## 部署说明

### GitHub Pages 部署

项目配置了 GitHub Actions 自动部署工作流：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建并部署到 GitHub Pages
3. 构建产物输出到 `dist/` 目录

### 环境配置

应用需要配置以下环境变量：

- `apiUrl`：LLM API 服务地址
- `apiKey`：LLM API 访问密钥
- `cachedModels`：本地缓存的模型列表
- `cachedSelectedModel`：用户上次选择的模型

## 关键文件说明

### 1. `src/services/spring-workflow.service.ts`

春联生成的核心服务，实现三阶段工作流：

- **analyzeTopic()**：主题分析和结构化提示词生成
- **generateSpringFestival()**：基于分析结果生成春联
- **reviewSpringFestival()**：质量审查和错误检测
- **executeWorkflow()**：完整的三阶段工作流执行

### 2. `src/config/prompts/`

包含所有 LLM 提示词的配置文件：

- **analysis.prompt.ts**：主题分析系统提示词
- **generation.prompt.ts**：春联生成系统提示词
- **review.prompt.ts**：质量审查系统提示词
- **election.prompt.ts**：候选选举系统提示词

### 3. `src/types/spring.types.ts`

定义所有类型安全的接口：

- **TopicAnalysisResult**：主题分析结果结构
- **SpringFestivalResponse**：春联生成响应结构
- **WorkflowResponse**：完整工作流响应结构
- **ReviewResult**：审查结果结构

### 4. `design-system/ai-码年挥春小摊/MASTER.md`

设计系统主文件，定义：

- 配色方案和 CSS 变量
- 字体规范和 Google Fonts 引用
- 间距系统和阴影规范
- 组件规范（按钮、卡片、输入框、模态框）
- 设计风格和最佳实践
- 禁止使用的模式和反模式

## 使用指南

### 用户操作流程

1. **输入主题**：在 `DesignInput` 页面输入主题（如"马年"、"科技"等）
2. **选择配置**：
   - 字数：5字、7字或9字
   - 对联顺序：左上右下或右上左下
   - 横批方向：左到右或右到左
   - 福字方向：正贴或倒贴
3. **选择模型**：从下拉菜单选择可用的 LLM 模型
4. **开始生成**：点击"开始设计"进入加载页面
5. **查看结果**：在显示页面查看生成的春联和挥春
6. **自定义调整**：在显示页面调整布局设置
7. **重新生成**：点击"再写一副"回到输入页面

### 设置配置

点击右上角的设置按钮可以：

- 更新可用的 LLM 模型列表
- 配置 API 服务地址和密钥
- 清除缓存数据

## 注意事项

1. **API 配置**：首次使用前必须在设置中配置 LLM API 服务
2. **字数限制**：建议使用 5、7、9 字的春联，更易生成符合平仄规则的作品
3. **主题质量**：提供清晰、具体的主题描述有助于生成更好的春联
4. **浏览器兼容性**：项目使用现代 CSS 特性，建议使用最新版本的 Chrome、Firefox、Safari 等现代浏览器

## 开发建议

1. **新增功能**：遵循现有的设计系统和代码风格
2. **错误处理**：在 `spring-workflow.service.ts` 中添加新的错误分类
3. **提示词优化**：在 `src/config/prompts/` 中修改提示词时，先备份原版本
4. **测试**：使用 React Testing Library 或 Cypress 进行组件测试
5. **性能优化**：对于大型组件，考虑使用 React.memo 或 useMemo 优化性能

## 许可证

本项目采用 MIT 许可证，详见项目根目录的 LICENSE 文件。
