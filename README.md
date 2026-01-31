# OpenAI Compatible API

基于 Hono 实现的 OpenAI 兼容 API 服务，支持通过 API URL 和 API Key 获取模型列表，并提供 Swagger UI 文档。

## 功能特性

- ✅ OpenAI 兼容的 `/v1/models` 端点
- ✅ 支持通过请求头或环境变量配置 API Key
- ✅ 支持自定义 API Base URL
- ✅ 多种文档界面（Swagger UI、Scalar、ReDoc）
- ✅ 详细的 API 规范和示例
- ✅ CORS 支持
- ✅ 请求日志和格式化 JSON 输出
- ✅ 完整的 TypeScript 类型支持

## 安装依赖

```bash
yarn install
```

## 配置

创建 `.dev.vars` 文件（参考 `.dev.vars.example`）：

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com
```

## 运行

开发模式（Cloudflare Workers 本地模拟）：

```bash
yarn dev
```

## API 端点

### 获取模型列表

**请求：**

```bash
curl http://localhost:3000/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**响应：**

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

## 文档

启动服务后，访问以下地址查看文档：

- **Swagger UI**: http://localhost:3000/swagger-ui - 经典的 Swagger UI 界面
- **Scalar (深色模式)**: http://localhost:3000/scalar - 现代化的 API 文档界面（深色主题）
- **Scalar (浅色模式)**: http://localhost:3000/scalar-light - 现代化的 API 文档界面（浅色主题）
- **ReDoc**: http://localhost:3000/redoc - 响应式的 API 文档界面
- **OpenAPI JSON**: http://localhost:3000/doc - OpenAPI 3.0 规范的 JSON 文档

### 文档对比

| 文档类型 | 特点 | 适用场景 |
|---------|------|---------|
| Swagger UI | 经典界面，功能完整 | 传统 API 文档查看 |
| Scalar | 现代化界面，交互性强 | 需要美观且易用的文档 |
| ReDoc | 响应式设计，专注阅读 | 移动端或需要专注阅读的场景 |

## 使用示例

### 使用环境变量配置 API Key

1. 在 `.dev.vars` 文件中设置环境变量：
   ```env
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
   OPENAI_BASE_URL=https://api.openai.com
   ```

2. 直接调用：
   ```bash
   curl http://localhost:3000/v1/models
   ```

### 使用请求头传递 API Key

```bash
curl http://localhost:3000/v1/models \
  -H "Authorization: Bearer sk-xxxxxxxxxxxxxxxx"
```

### 自定义 API Base URL

```env
OPENAI_BASE_URL=https://your-custom-api.com
```

## 项目结构

```
src/
├── routes/
│   └── openai.routes.ts   # OpenAI 路由
├── services/
│   └── openai.service.ts  # OpenAI 服务
├── types/
│   └── openai.ts          # 类型定义
├── index.ts               # 应用入口
└── worker.ts              # Cloudflare Workers 入口
```
