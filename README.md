# AI "码"年挥春小摊

一个基于 React + TypeScript 的现代化 Web 应用，利用大语言模型（LLM）为用户生成定制化的春联作品。

## 🎨 项目特色

- **AI 智能创作**：基于用户输入的主题，生成符合平仄、对仗规则的春联
- **三阶段工作流**：主题分析 → 春联生成 → 质量审查，确保生成质量
- **传统设计风格**：采用中文传统节日设计语言，融合现代极简主义
- **布局自定义**：支持调整对联顺序、横批方向、福字方向等
- **响应式设计**：完美适配桌面和移动设备

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Yarn 包管理器

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

开发服务器将在 `http://localhost:5173` 启动

### 构建生产版本

```bash
yarn build
```

### 预览构建结果

```bash
yarn preview
```

### GitHub Pages 部署

```bash
yarn dev:gh
```

## 📱 功能特性

### 🎯 核心功能

- **智能春联生成**：输入主题，AI 自动生成符合传统规则的春联
- **多字数支持**：支持 5 字、7 字、9 字春联生成
- **布局自定义**：灵活调整对联顺序、横批方向、福字方向
- **质量审查**：自动检测平仄、对仗、格式等问题
- **容错机制**：失败时自动选举最优候选，确保用户体验

### 🎨 设计系统

- **配色方案**：深蓝 (#0F172A) + 金色 (#CA8A04) + 浅灰 (#F8FAFC)
- **字体规范**：Noto Serif TC（标题）+ Noto Sans TC（正文）
- **间距系统**：基于 4px 基础单位的完整间距系统
- **阴影规范**：五级阴影系统，营造层次感
- **设计风格**：夸张极简主义（Bold Minimalism）

## 🏗️ 技术架构

### 前端技术栈

- **React 18.3.1**：现代化的前端框架
- **TypeScript**：类型安全的 JavaScript 超集
- **Vite 6.0.7**：快速的构建工具
- **React Router DOM 7.13.0**：客户端路由管理

### 设计系统

- **CSS 变量**：完整的主题变量系统
- **Google Fonts**：Noto Serif TC + Noto Sans TC
- **响应式设计**：适配多种屏幕尺寸

## 📁 项目结构

```plaintext
src/
├── components/          # React 组件
│   ├── SettingsButton.tsx    # 设置按钮
│   └── SettingsModal.tsx     # 设置弹窗
├── config/             # 配置文件
│   └── prompts/        # LLM 提示词配置
│       ├── analysis.prompt.ts     # 主题分析
│       ├── generation.prompt.ts   # 春联生成
│       ├── review.prompt.ts       # 质量审查
│       └── election.prompt.ts     # 选举机制
├── pages/              # 页面组件
│   ├── DisplayPage.tsx    # 显示页面
│   ├── LoadingPage.tsx    # 加载页面
│   └── DisplayPage.css    # 样式
├── services/           # 服务层
│   └── spring-workflow.service.ts  # 春联工作流
├── types/              # TypeScript 类型
│   ├── model.types.ts     # 模型类型
│   └── spring.types.ts    # 春联类型
├── utils/              # 工具函数
│   └── json-parser.util.ts # JSON 解析
├── App.tsx             # 根组件
├── DesignInput.tsx     # 输入页面
├── main.tsx            # 应用入口
└── routes.tsx          # 路由配置
```

## 🎮 使用指南

### 1. 输入主题

在首页输入框中输入您的主题，例如：

- "马年"
- "科技"
- "家庭"
- "事业"

### 2. 选择配置

- **字数**：选择 5 字、7 字或 9 字春联
- **对联顺序**：选择左上右下或右上左下排列
- **横批方向**：选择左到右或右到左方向
- **福字方向**：选择正贴或倒贴

### 3. 选择模型

从下拉菜单中选择可用的 LLM 模型

### 4. 开始生成

点击"开始设计"进入生成流程

### 5. 查看结果

在显示页面查看生成的春联和挥春作品

### 6. 自定义调整

在显示页面调整各种布局设置

### 7. 重新生成

点击"再写一副"回到输入页面

## 🔧 API 配置

### 首次使用

1. 点击右上角的设置按钮
2. 配置 LLM API 服务地址和密钥
3. 更新可用模型列表

### 支持的 API

- OpenAI API 兼容服务
- 自定义 LLM API 服务

## 🎯 设计规范

### 配色方案

| 角色 | 颜色 | CSS 变量 |
| ---- | ---- | -------- |
| 主色 | #0F172A | `--color-primary` |
| 次色 | #1E3A8A | `--color-secondary` |
| 强调 | #CA8A04 | `--color-cta` |
| 背景 | #F8FAFC | `--color-background` |
| 文本 | #020617 | `--color-text` |

### 间距系统

| Token | 值 | 用途 |
| ---- | ---- | ---- |
| --space-xs | 4px | 紧凑间距 |
| --space-sm | 8px | 图标间距 |
| --space-md | 16px | 标准间距 |
| --space-lg | 24px | 区块间距 |
| --space-xl | 32px | 大间距 |
| --space-2xl | 48px | 区块边距 |
| --space-3xl | 64px | 英雄区间距 |

### 阴影系统

| 等级 | 值 | 用途 |
| ---- | ---- | ---- |
| --shadow-sm | 0 1px 2px rgba(0,0,0,0.05) | 轻微阴影 |
| --shadow-md | 0 4px 6px rgba(0,0,0,0.1) | 卡片阴影 |
| --shadow-lg | 0 10px 15px rgba(0,0,0,0.1) | 模态框阴影 |
| --shadow-xl | 0 20px 25px rgba(0,0,0,0.15) | 英雄区阴影 |

## 🚀 部署

### GitHub Pages

项目配置了自动部署工作流：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建
3. 自动部署到 GitHub Pages

### 本地部署

```bash
# 构建
yarn build

# 预览
yarn preview
```

## 📊 开发规范

### 代码风格

- 函数不超过 25 行
- 单一职责，最大 3 层嵌套
- 完整的 TypeScript 类型定义
- XML 文档注释规范

### 设计系统

- 遵循 `design-system/ai-码年挥春小摊/MASTER.md`
- 使用 CSS 变量系统
- 遵循夸张极简主义设计风格
- 禁止使用表情符号作为图标

### 错误处理

- 格式错误
- 平仄不合规
- 对仗不工整
- 内容问题
- 其他问题

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件
- 加入讨论组

---

**AI "码"年挥春小摊** - 让传统文化与现代科技完美融合！
