# AGENTS.md - 项目说明文档

## 项目概述

**iFlow 码年挥春小摊** - 基于 AI 的春联创作平台

这是一个基于 **Hono** 框架实现的春联生成应用，利用大语言模型根据用户输入的主题自动创作符合中国传统文化规范的春联（上联、下联、横批）和挥春。项目采用前后端分离架构，支持多种 OpenAI 兼容 API 服务。

### 核心功能

- **春联生成**：根据主题自动创作符合平仄对仗规则的春联
- **挥春创作**：生成四个与主题相关的吉祥挥春
- **多模型支持**：支持 OpenAI 及其他兼容的 API 服务
- **灵活配置**：支持环境变量和前端设置两种配置方式
- **精美展示**：传统风格的春联展示界面

### 核心技术栈

**后端服务**

- **运行时**: Cloudflare Workers
- **框架**: Hono 4.x
- **语言**: TypeScript (ES2022)
- **包管理器**: Yarn 4.x + Workspaces
- **API 验证**: Zod + @hono/zod-openapi
- **文档**: Swagger UI、Scalar、ReDoc
- **部署**: Wrangler (Cloudflare Workers)

**前端应用**

- **框架**: React 18
- **构建工具**: Vite 6.x
- **语言**: TypeScript
- **UI 风格**: 夸张极简主义（Exaggerated Minimalism）
- **字体**: Noto Serif TC + Noto Sans TC

### 架构特点

- 基于 Cloudflare Workers 的 Serverless 架构
- Monorepo 结构，使用 Yarn Workspaces 管理前后端
- RESTful API 设计，遵循 OpenAPI 3.0 规范
- 完整的 TypeScript 类型支持
- 模块化架构，路由、服务、类型分离
- 支持请求体和环境变量两种认证方式
- 使用 c.env 管理环境变量，适配 Workers 环境
- 静态资源通过 Workers Assets 绑定提供服务

## 项目结构

```
trae_demo_04/
├── src/
│   ├── routes/
│   │   ├── openai.routes.ts      # OpenAI API 路由定义（包含春联生成）
│   │   └── test.routes.ts        # 测试 API 路由
│   ├── services/
│   │   └── openai.service.ts     # OpenAI 服务实现
│   ├── types/
│   │   └── openai.ts             # TypeScript 类型定义
│   ├── config/
│   │   └── spring-festival.config.ts  # 春联生成配置和提示词
│   ├── index.ts                  # 应用主入口（路由和中间件配置）
│   └── worker.ts                 # Cloudflare Workers 入口
├── frontend/
│   ├── src/
│   │   ├── components/           # React 组件
│   │   │   ├── SettingsButton.tsx
│   │   │   ├── SettingsModal.tsx
│   │   │   └── Settings.css
│   │   ├── pages/                # 页面组件
│   │   │   ├── DisplayPage.tsx   # 春联展示页面
│   │   │   ├── DisplayPage.css
│   │   │   ├── LoadingPage.tsx   # 加载页面
│   │   │   └── LoadingPage.css
│   │   ├── types/                # 前端类型定义
│   │   ├── App.tsx               # 主应用组件（路由状态管理）
│   │   ├── App.css
│   │   ├── main.tsx              # React 入口
│   │   ├── DesignInput.tsx       # 主设计输入组件
│   │   ├── DesignInput.css       # 主设计输入样式
│   │   └── style.css             # 全局样式
│   ├── dist/                     # Vite 构建输出
│   ├── public/                   # 静态资源
│   ├── index.html                # HTML 模板
│   ├── vite.config.ts            # Vite 配置
│   ├── tsconfig.json             # TypeScript 配置
│   └── package.json              # 前端依赖
├── design-system/                # 设计系统
│   └── iflow-码年挥春小摊/
│       ├── MASTER.md             # 设计系统主文档
│       └── pages/                # 页面级设计规范（预留）
├── public/                       # 静态资源目录
├── dist/                         # TypeScript 编译输出
├── package.json                  # 根项目配置
├── tsconfig.json                 # TypeScript 编译配置
├── wrangler.toml                 # Cloudflare Workers 配置
├── .editorconfig                 # 编辑器统一配置
└── .dev.vars.example             # 环境变量示例
```

## 构建和运行

### 依赖安装

```bash
yarn install
```

### 环境配置

复制 `.dev.vars.example` 创建 `.dev.vars` 文件：

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com
```

### 开发模式

**后端开发（包含前端）**

```bash
yarn dev
```

服务将运行在 <http://localhost:3000>

**前端独立开发**

```bash
yarn workspace frontend dev
```

前端将运行在独立端口（默认 <http://localhost:5173>）

### 构建

**仅构建后端**

```bash
yarn build:backend
```

**仅构建前端**

```bash
yarn build:frontend
```

**构建全部（推荐）**

```bash
yarn build
# 或
yarn build:all
```

## API 端点

### 主端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | POST | 获取模型列表 |
| `/v1/spring-festival/generate` | POST | 生成春联和挥春 |
| `/` | GET | 服务信息 |
| `/doc` | GET | OpenAPI 3.0 JSON 规范 |

### 文档端点

| 端点 | 描述 |
|------|------|
| `/swagger-ui` | Swagger UI 文档界面 |
| `/scalar` | Scalar 深色模式文档（现代布局） |
| `/scalar-light` | Scalar 浅色模式文档（经典布局） |
| `/redoc` | ReDoc 响应式文档 |

### 春联生成 API

**请求示例**

```bash
curl -X POST http://localhost:3000/v1/spring-festival/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "龙年",
    "model": "gpt-4",
    "apiUrl": "https://api.openai.com",
    "apiKey": "YOUR_API_KEY"
  }'
```

**响应示例**

```json
{
  "upperCouplet": "龙腾盛世千家喜",
  "lowerCouplet": "春满神州万象新",
  "horizontalScroll": "龙年大吉",
  "springScrolls": [
    "福到",
    "财源广进",
    "万事如意",
    "恭喜发财"
  ]
}
```

### 认证方式

**方式 1：请求体认证**

```bash
curl -X POST http://localhost:3000/v1/models \
  -H "Content-Type: application/json" \
  -d '{
    "apiUrl": "https://api.openai.com",
    "apiKey": "YOUR_API_KEY"
  }'
```

**方式 2：环境变量认证**

配置 `.dev.vars` 文件后直接调用：

```bash
curl -X POST http://localhost:3000/v1/models
```

## 设计系统

### 配色方案

| 角色 | Hex | CSS 变量 |
|------|-----|----------|
| Primary | `#0F172A` | `--color-primary` |
| Secondary | `#1E3A8A` | `--color-secondary` |
| CTA/Accent | `#CA8A04` | `--color-cta` |
| Background | `#F8FAFC` | `--color-background` |
| Text | `#020617` | `--color-text` |

### 字体

- **标题字体**: Noto Serif TC
- **正文字体**: Noto Sans TC
- **风格**: 传统、优雅、文化、多语言

### 设计风格

**风格**: 夸张极简主义（Exaggerated Minimalism）

**关键词**: 粗犷极简、超大排版、高对比度、负空间、响亮极简、宣言式设计

**适用场景**: 时尚、建筑、作品集、落地页、奢侈品、编辑风格

### 组件规范

详细的设计规范请参考 `design-system/iflow-码年挥春小摊/MASTER.md`

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
- **输出目录**: `dist/`（后端）、`frontend/dist/`（前端）

### 命名约定

- **文件名**: 小写，使用短横线分隔（如 `openai.routes.ts`）
- **类名**: 大驼峰（如 `OpenAIService`）
- **接口/类型**: 大驼峰（如 `OpenAIModel`）
- **函数/变量**: 小驼峰（如 `getModels`）

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

### 添加新的 API 端点

1. 在 `src/routes/` 创建新的路由文件
2. 使用 `createRoute` 定义 OpenAPI 规范
3. 实现处理函数
4. 在 `src/index.ts` 中注册路由

### 添加新的服务

1. 在 `src/services/` 创建服务文件
2. 定义服务类和相关方法
3. 在路由文件中引入并使用

### 添加类型定义

1. 在 `src/types/` 创建或更新类型文件
2. 使用 `interface` 或 `type` 定义类型
3. 在需要的地方导入使用

### 添加前端组件

1. 在 `frontend/src/components/` 创建组件文件
2. 使用 TypeScript + React 编写组件
3. 遵循设计系统规范（参考 `design-system/`）
4. 在需要的地方导入使用

### 修改春联生成提示词

编辑 `src/config/spring-festival.config.ts` 文件，修改 `SPRING_FESTIVAL_SYSTEM_PROMPT` 常量。

### 部署到 Cloudflare Workers

```bash
npx wrangler deploy
```

## 注意事项

- Cloudflare Workers 环境不支持 Node.js 特有 API（如 `fs`、`path`）
- 使用 `fetch` API 进行 HTTP 请求
- 环境变量通过 `c.env` 或 `wrangler.toml` 的 `vars` 配置
- `.dev.vars` 文件不会被提交到 Git（已在 `.gitignore` 中）
- 前端构建产物通过 Workers Assets 绑定在 `/` 路径下提供服务
- 使用 Yarn Workspaces 管理依赖时，运行脚本需要指定 workspace
- 春联生成需要有效的 LLM API 配置
- 设计系统变更需同步更新 `design-system/` 目录下的文档