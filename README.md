# Markdown Editor Pro

一个功能强大的在线 Markdown 编辑器，基于 React + TypeScript + Supabase 构建。支持实时预览、语法高亮、流程图、数学公式等丰富功能。

## ✨ 特性

- 📝 实时预览 Markdown 渲染效果
- 🎨 支持语法高亮
- 📊 支持 Mermaid 流程图
- 📐 支持 KaTeX 数学公式
- 📁 文档分类管理
- 👥 多用户支持
- 🔄 实时自动保存
- 📱 响应式设计
- 🎯 快捷工具栏
- 🎨 自定义主题

## 🛠️ 技术栈

- React 18
- TypeScript
- Supabase
- Monaco Editor
- TailwindCSS
- React Markdown
- Mermaid
- KaTeX

## 🚀 快速开始

1. 克隆项目
```bash
git clone https://github.com/your-username/markdown-editor-pro.git
cd markdown-editor-pro
npm install
```

2. 配置环境变量
修改 .env.example 文件名为 .env.local ，并配置你的 Supabase 信息：


在 .env.local 文件中配置你的 Supabase 信息：
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. 启动开发服务器
```bash
npm run dev
```


## 🔧 技术栈

- React 18
- TypeScript
- Tailwind CSS
- Monaco Editor
- Supabase
- React Markdown
- Mermaid
- KaTeX
- Vite

## 📝 使用指南

### 文档管理
- 点击左侧 "+" 按钮创建新文档或文件夹
- 支持文档重命名和删除
- 文档自动保存

### Markdown 编辑
- 使用顶部工具栏快速插入 Markdown 语法
- 支持代码块语法高亮
- 支持数学公式：`$E = mc^2$`
- 支持 Mermaid 流程图：
```mermaid
graph TD
    A[开始] --> B[处理]
    B --> C[结束]
```

### 界面操作
- 拖动中间分隔线调整编辑区和预览区比例
- 点击文档标题可以修改
- 自定义滚动条样式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

[MIT License](LICENSE)