# AI "码"年挥春小摊

基于 AI 的春联创作平台，利用大语言模型通过三阶段工作流自动创作符合中国传统文化规范的春联和挥春。

## 技术栈

- **前端框架**：React 18
- **构建工具**：Vite 6.x
- **路由管理**：React Router v7
- **语言**：TypeScript (ES2022)
- **包管理器**：Yarn 4.x
- **部署**：GitHub Pages

## 功能特性

- ✅ 三阶段工作流生成（主题分析→春联生成→质量审查）
- ✅ AI 春联生成（上联、下联、横批）
- ✅ 四个主题相关挥春创作
- ✅ 多模型支持（OpenAI 及兼容 API）
- ✅ 灵活配置（字数、对联顺序、横批方向、福字方向）
- ✅ 精美的传统风格展示界面
- ✅ 完整的 TypeScript 类型支持
- ✅ 自动质量审查和重试机制（最多 3 次）
- ✅ 详细的控制台日志输出

## 快速开始

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

访问 <http://localhost:5173> 开始使用。

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

### 展示页面实时调整

春联生成后，在展示页面可以通过左侧控制面板实时调整：

- **对联顺序**：切换左上右下 / 右上左下布局
- **横批方向**：切换左到右 / 右到左显示
- **福字方向**：切换正贴 / 倒贴显示
- 点击"再写一副"返回重新设计

移动端控制面板自动调整为顶部横向布局。

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

## 项目结构

```
├── src/
│   ├── components/           # React 组件
│   │   ├── SettingsButton.tsx
│   │   ├── SettingsModal.tsx
│   │   └── Settings.css
│   ├── pages/                # 页面组件
│   │   ├── DisplayPage.tsx   # 春联展示页面（含实时控制面板）
│   │   ├── DisplayPage.css
│   │   ├── LoadingPage.tsx   # 加载页面
│   │   └── LoadingPage.css
│   ├── config/
│   │   └── prompts.config.ts # 三阶段工作流提示词配置
│   ├── services/
│   │   └── spring-workflow.service.ts # 春联生成工作流服务
│   ├── App.tsx               # 主应用组件
│   ├── App.css
│   ├── DesignInput.tsx       # 主设计输入组件
│   ├── DesignInput.css
│   ├── main.tsx              # React 入口
│   ├── routes.tsx            # 路由配置
│   └── style.css             # 全局样式
├── public/
│   ├── 404.html              # GitHub Pages SPA 路由支持
│   └── vite.svg
├── design-system/            # 设计系统
│   └── ai-码年挥春小摊/
│       └── MASTER.md         # 设计规范文档
├── index.html                # HTML 模板
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

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

## 开发规范

- **缩进**：2 空格
- **换行符**：LF
- **字符编码**：UTF-8
- **文件结尾**：必须包含换行符
- **注释**：使用中文注释
- **命名约定**：
  - 文件名：小写，短横线分隔
  - 类名：大驼峰
  - 函数/变量：小驼峰

## 更多信息

- 详细开发规范请参阅 [AGENTS.md](./AGENTS.md)
- 设计系统规范请参阅 [design-system/ai-码年挥春小摊/MASTER.md](./design-system/ai-码年挥春小摊/MASTER.md)