# AGENTS.md - 项目说明文档

## 项目概述

这是一个基于 **Hono** 框架实现的 OpenAI 兼容 API 服务，提供模型列表查询功能，并支持多种 API 文档界面。

### 核心技术栈

- **运行时**: Cloudflare Workers
- **框架**: Hono 4.x
- **语言**: TypeScript (ES2022)
- **包管理器**: Yarn 4.x
- **API 验证**: Zod + @hono/zod-openapi
- **文档**: Swagger UI、Scalar、ReDoc
- **部署**: Wrangler (Cloudflare Workers)

### 架构特点

- 基于 Cloudflare Workers 的 Serverless 架构
- RESTful API 设计，遵循 OpenAPI 3.0 规范
- 完整的 TypeScript 类型支持
- 模块化架构，路由、服务、类型分离
- 支持请求头和环境变量两种认证方式
- 使用 c.env 管理环境变量，适配 Workers 环境

## 项目结构

```
trae_demo_04/
├── src/
│   ├── routes/
│   │   └── openai.routes.ts      # OpenAI API 路由定义
│   ├── services/
│   │   └── openai.service.ts     # OpenAI 服务实现
│   ├── types/
│   │   └── openai.ts             # TypeScript 类型定义
│   ├── index.ts                  # 应用主入口（路由和中间件配置）
│   └── worker.ts                 # Cloudflare Workers 入口
├── public/                       # 静态资源目录
├── dist/                         # TypeScript 编译输出
├── package.json                  # 项目配置和依赖
├── tsconfig.json                 # TypeScript 编译配置
├── wrangler.json                 # Cloudflare Workers 配置
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

使用 Wrangler 本地开发服务器：

```bash
yarn dev
```

或直接使用：

```bash
npx wrangler dev
```

### 构建

```bash
yarn build
```

编译输出到 `dist/` 目录。

## API 端点

### 主端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | GET | 获取模型列表 |
| `/` | GET | 服务信息 |
| `/doc` | GET | OpenAPI 3.0 JSON 规范 |

### 文档端点

| 端点 | 描述 |
|------|------|
| `/swagger-ui` | Swagger UI 文档界面 |
| `/scalar` | Scalar 深色模式文档 |
| `/scalar-light` | Scalar 浅色模式文档 |
| `/redoc` | ReDoc 响应式文档 |

### 认证方式

**方式 1：请求头认证**

```bash
curl http://localhost:3000/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**方式 2：环境变量认证**

配置 `.dev.vars` 文件后直接调用：

```bash
curl http://localhost:3000/v1/models
```

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

### 部署到 Cloudflare Workers

```bash
npx wrangler deploy
```

## 注意事项

- Cloudflare Workers 环境不支持 Node.js 特有 API（如 `fs`、`path`）
- 使用 `fetch` API 进行 HTTP 请求
- 环境变量通过 `c.env` 或 `wrangler.json` 的 `vars` 配置
- `.dev.vars` 文件不会被提交到 Git（已在 `.gitignore` 中）