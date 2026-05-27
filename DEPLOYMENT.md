# 🚀 Life Coach AI - 部署指南

## 📋 环境变量配置

### 需要配置的环境变量

| 变量名 | 说明 | 必填 | 示例 |
|--------|------|------|------|
| `ARK_API_KEY` | 火山方舟 API 密钥 | ✅ | `ark-4c1bc0b9-0fb2-47f8-ad9f-ff5465707816-f00ae` |
| `MODEL` | 模型 Endpoint ID | ✅ | `ep-20260527224928-8l7db` |
| `ARK_API_HOST` | API 主机地址 | ❌ | `ark.cn-beijing.volces.com` (默认) |
| `ARK_API_PATH` | API 路径 | ❌ | `/api/v3/responses` (默认) |

---

## 🖥️ 本地开发环境配置

### 步骤 1: 安装依赖

```bash
npm install
```

### 步骤 2: 配置 .env 文件

项目已经为你创建好了 `.env` 文件，内容如下：

```env
# 火山方舟 DeepSeek R1 API 配置

# API 密钥（必填）
ARK_API_KEY=ark-4c1bc0b9-0fb2-47f8-ad9f-ff5465707816-f00ae

# 模型 Endpoint ID（必填）
MODEL=ep-20260527224928-8l7db

# API 主机（可选，默认值如下）
ARK_API_HOST=ark.cn-beijing.volces.com
ARK_API_PATH=/api/v3/responses

# 服务器端口（可选，默认 3000）
PORT=3000
```

如果需要修改，直接编辑 `.env` 文件即可。

### 步骤 3: 启动服务器

```bash
# 方式 1: 使用 npm
npm start

# 方式 2: 直接使用 node
node server.js

# 方式 3: 使用批处理文件（Windows）
启动服务器.bat
```

### 步骤 4: 打开应用

在浏览器中打开 `index.html` 文件即可开始使用。

---

## ☁️ Vercel 部署指南

### 步骤 1: 准备代码仓库

确保你的代码已经提交到 GitHub / GitLab / Bitbucket。

⚠️ **重要**: `.env` 文件已经在 `.gitignore` 中，不会被提交，你的 API 密钥是安全的！

### 步骤 2: 登录 Vercel

1. 访问 [vercel.com](https://vercel.com)
2. 使用 GitHub / GitLab / Bitbucket 账号登录

### 步骤 3: 导入项目

1. 点击 "New Project"
2. 选择你的代码仓库
3. 点击 "Import"

### 步骤 4: 配置环境变量（重要！）

在项目配置页面，找到 "Environment Variables" 部分：

1. 点击 "Add" 按钮
2. 添加以下环境变量：

| 变量名 | 值 |
|--------|-----|
| `ARK_API_KEY` | `ark-4c1bc0b9-0fb2-47f8-ad9f-ff5465707816-f00ae` |
| `MODEL` | `ep-20260527224928-8l7db` |

3. 确保勾选 "Automatically expose System Environment Variables"
4. 点击 "Deploy"

### 步骤 5: 等待部署完成

Vercel 会自动构建和部署你的项目，通常需要 1-2 分钟。

### 步骤 6: 完成！

部署成功后，Vercel 会给你一个类似 `https://your-project-name.vercel.app` 的地址，直接访问即可！

---

## 🔒 安全说明

1. **永远不要将 `.env` 文件提交到 Git** - 我们已经在 `.gitignore` 中配置好了
2. **环境变量只在服务器端使用** - 前端无法访问你的 API 密钥
3. **Vercel 环境变量是加密存储的** - 安全有保障

---

## 📁 项目结构说明

```
.
├── api/
│   └── chat.js           # Vercel Serverless Function
├── .env                  # 本地环境变量（不提交）
├── .env.example          # 环境变量模板（可提交）
├── .gitignore            # Git 忽略文件配置
├── index.html            # 前端页面
├── package.json          # 项目配置
├── server.js             # 本地开发服务器
├── vercel.json           # Vercel 配置
└── README.md             # 项目说明
```

---

## 🆘 常见问题

### Q: 本地开发时提示缺少环境变量？
A: 确保 `.env` 文件存在并且配置正确，然后重新启动服务器。

### Q: Vercel 部署后 API 报错？
A: 检查 Vercel 项目设置中的环境变量是否正确配置。

### Q: 如何修改 API 密钥？
A: 
- 本地开发: 修改 `.env` 文件
- Vercel 部署: 在 Vercel 项目设置中修改环境变量，然后重新部署

### Q: 本地和 Vercel 可以同时使用吗？
A: 可以！前端会自动检测当前环境并选择正确的 API 地址。