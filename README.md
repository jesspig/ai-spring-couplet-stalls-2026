# OpenAI Compatible API

基于 Hono 框架实现的 OpenAI 兼容 API 服务，提供模型列表查询功能，支持多种 API 文档界面。

## 技术栈

- **运行时**：Cloudflare Workers
- **框架**：Hono 4.x
- **语言**：TypeScript (ES2022)
- **验证**：Zod
- **文档**：Swagger UI、Scalar、ReDoc
- **包管理器**：Yarn 4.x

## 功能特性

- ✅ OpenAI 兼容的 `/v1/models` 端点
- ✅ 请求头和环境变量两种认证方式
- ✅ 可配置的 API Base URL
- ✅ 多种 API 文档界面
- ✅ OpenAPI 3.0 规范
- ✅ Zod 类型验证
- ✅ 完整的 TypeScript 类型支持
- ✅ CORS 支持
- ✅ 请求日志和格式化输出

## 快速开始

### 安装依赖

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

```bash
yarn dev
```

### 构建

```bash
yarn build
```

编译输出到 `dist/` 目录。

### 部署

```bash
npx wrangler deploy
```

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | GET | 获取模型列表 |
| `/` | GET | 服务信息 |
| `/doc` | GET | OpenAPI 3.0 JSON 规范 |

### 获取模型列表

```bash
curl http://localhost:3000/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

响应：

```json
{
  "object": "list",
  "data": [
    {
      "id": "gpt-4",
      "object": "model",
      "created": 1234567890,
      "owned_by": "openai"
    }
  ]
}
```

## 认证方式

### 方式一：环境变量认证

在 `.dev.vars` 中配置后直接调用：

```bash
curl http://localhost:3000/v1/models
```

### 方式二：请求头认证

```bash
curl http://localhost:3000/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## 文档界面

启动服务后访问：

| 端点 | 描述 |
|------|------|
| `/swagger-ui` | Swagger UI 文档界面 |
| `/scalar` | Scalar 深色模式 |
| `/scalar-light` | Scalar 浅色模式 |
| `/redoc` | ReDoc 响应式文档 |
| `/doc` | OpenAPI 3.0 JSON 规范 |

## 项目结构

```
├── frontend/               # 前端项目（独立 Vite 应用）
├── public/                 # 静态资源
├── src/
│   ├── config/             # 配置相关
│   ├── routes/
│   │   ├── openai.routes.ts   # OpenAI API 路由
│   │   └── test.routes.ts     # 测试路由
│   ├── services/
│   │   └── openai.service.ts  # OpenAI 服务实现
│   ├── types/
│   │   └── openai.ts          # TypeScript 类型定义
│   ├── index.ts              # 应用入口（路由和中间件）
│   └── worker.ts             # Cloudflare Workers 入口
├── package.json
├── tsconfig.json
├── wrangler.toml
└── .dev.vars.example
```

## 更多信息

- 详细开发规范请参阅 [AGENTS.md](./AGENTS.md)
- 环境变量配置请参考 `.dev.vars.example`
