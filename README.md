# iFlow 码年挥春小摊

基于 AI 的春联创作平台，利用大语言模型根据用户主题自动创作符合中国传统文化规范的春联和挥春。

## 技术栈

- **运行时**：Cloudflare Workers
- **框架**：Hono 4.x
- **前端**：React 18 + Vite 6.x
- **语言**：TypeScript (ES2022)
- **验证**：Zod
- **文档**：Swagger UI、Scalar、ReDoc
- **包管理器**：Yarn 4.x

## 功能特性

- ✅ AI 春联生成（上联、下联、横批）
- ✅ 四个主题相关挥春创作
- ✅ 多模型支持（OpenAI 及兼容 API）
- ✅ 灵活的认证方式（环境变量 / 前端配置）
- ✅ 精美的传统风格展示界面
- ✅ 多种 API 文档界面
- ✅ OpenAPI 3.0 规范
- ✅ 完整的 TypeScript 类型支持

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

访问 <http://localhost:3000> 开始使用。

### 构建

```bash
yarn build
```

编译输出到 `dist/` 和 `frontend/dist/` 目录。

### 部署

```bash
npx wrangler deploy
```

## 使用指南

### 通过 Web 界面

1. 启动开发服务器：`yarn dev`
2. 访问 <http://localhost:3000>
3. 点击设置按钮配置 API URL 和 API Key（或使用环境变量）
4. 输入主题（如：龙年、科技、家庭、事业等）
5. 选择模型
6. 点击"开始设计"

### 通过 API

**春联生成 API**

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

## API 端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/v1/models` | POST | 获取模型列表 |
| `/v1/spring-festival/generate` | POST | 生成春联和挥春 |
| `/` | GET | 服务信息 |
| `/doc` | GET | OpenAPI 3.0 JSON 规范 |

### 获取模型列表

```bash
curl -X POST http://localhost:3000/v1/models \
  -H "Content-Type: application/json" \
  -d '{
    "apiUrl": "https://api.openai.com",
    "apiKey": "YOUR_API_KEY"
  }'
```

## 认证方式

### 方式一：环境变量认证

在 `.dev.vars` 中配置后直接调用：

```bash
curl -X POST http://localhost:3000/v1/models
```

### 方式二：请求体认证

```bash
curl -X POST http://localhost:3000/v1/models \
  -H "Content-Type: application/json" \
  -d '{
    "apiUrl": "https://api.openai.com",
    "apiKey": "YOUR_API_KEY"
  }'
```

## 文档界面

启动服务后访问：

| 端点 | 描述 |
|------|------|
| `/swagger-ui` | Swagger UI 文档界面 |
| `/scalar` | Scalar 深色模式（现代布局） |
| `/scalar-light` | Scalar 浅色模式（经典布局） |
| `/redoc` | ReDoc 响应式文档 |
| `/doc` | OpenAPI 3.0 JSON 规范 |

## 项目结构

```
├── frontend/               # 前端项目（Vite + React）
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件（DisplayPage、LoadingPage）
│   │   ├── App.tsx         # 主应用组件
│   │   └── DesignInput.tsx # 主设计输入组件
│   └── public/             # 静态资源
├── design-system/          # 设计系统
│   └── iflow-码年挥春小摊/
│       └── MASTER.md       # 设计规范文档
├── public/                 # 静态资源
├── src/
│   ├── config/
│   │   └── spring-festival.config.ts  # 春联生成配置
│   ├── routes/
│   │   ├── openai.routes.ts   # API 路由（含春联生成）
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

## 春联生成规则

系统根据以下规则生成春联：

- **上联**：7-9 个字，仄声结尾（三声、四声）
- **下联**：7-9 个字，平声结尾（一声、二声）
- **横批**：4 个字，概括主题
- **挥春**：4 个，每个 2-4 个字，内容吉利喜庆
- 上下联必须对仗工整，意境相符
- 内容贴合用户主题，寓意吉祥如意

## 更多信息

- 详细开发规范请参阅 [AGENTS.md](./AGENTS.md)
- 设计系统规范请参阅 [design-system/iflow-码年挥春小摊/MASTER.md](./design-system/iflow-码年挥春小摊/MASTER.md)
- 环境变量配置请参考 `.dev.vars.example`