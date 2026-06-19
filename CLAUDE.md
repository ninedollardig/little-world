# 小世界 · A Little World 项目规范

## 项目说明
小世界 — 私人音频 + 碎碎念分享空间。上传录音和文字，在手机上收听/阅读。

## 铁律
1. **需求文档同步**：所有功能改动同步更新 REQUIREMENTS.md
2. **UI 先行确认**：改 UI 前用 ASCII 图预览，确认后再写代码
3. **密钥不进代码**：所有配置放 .env，严禁硬编码 fallback 值（os.getenv 不设默认值）

## 技术栈
- 前端: React 19 + Vite + React Router 7 + Tailwind CSS 4
- 后端: Flask 3 + gunicorn + sqlite3
- 图标: Lucide React
- 提示: sonner

## 端口
- 后端: 8765
- 前端: 5173

## 本地运行
- 后端: `cd backend && python app.py` → http://localhost:8765
- 前端: `cd frontend && npm run dev` → http://localhost:5173
- 一键启动: `start.bat`
- 验证: `curl http://localhost:8765/api/health` → `{"status":"ok","db":"connected"}`

## 部署

### 目标平台
Fly.io（免费层 3GB 持久存储，适合 5 人小站）

### 部署状态
✅ GitHub Pages 已上线 — `https://ninedollardig.github.io/little-world/`
每次 push main 自动构建部署（`.github/workflows/deploy.yml`）

### 待部署
⚠️ 后端 Fly.io — 等待绑定支付方式

### 部署文件（已就绪）
- `Dockerfile` — 多阶段构建（前端 npm build + 后端 Python/Flask）
- `fly.toml` — Fly.io 配置（8080 端口、持久卷挂载、香港区域）
- `wsgi.py` — 备用（PythonAnywhere WSGI 入口）
- `.github/workflows/deploy.yml` — 备用（GitHub Pages 前端部署）

### 部署步骤（卡到后执行）
```
fly deploy                              # 一键部署
fly secrets set JWT_SECRET=<随机密钥>    # 设置生产密钥
```

### Fly.io 账号
- 邮箱: eatebanjeima@gmail.com
- 已登录，待绑定支付

### GitHub
- 仓库: https://github.com/ninedollardig/little-world
- 用户: ninedollardig
