# 小世界 · A Little World 项目规范

## 项目说明
小世界 — 私人音频 + 碎碎念分享空间。上传录音和文字，在手机上收听/阅读。

## 铁律
1. **需求文档同步**：所有功能改动同步更新 REQUIREMENTS.md
2. **UI 先行确认**：改 UI 前用 ASCII 图预览，确认后再写代码
3. **密钥不进代码**：所有配置放 .env，严禁硬编码

## 技术栈
- 前端: React 19 + Vite + React Router 7 + Tailwind CSS 4
- 后端: Python FastAPI + uvicorn + sqlite3
- 图标: Lucide React
- 提示: sonner

## 端口
- 后端: 8765
- 前端: 5173

## 验证
- 后端: `python main.py` → http://localhost:8765/api/health 返回 {"status":"ok"}
- 前端: `npm run dev` → http://localhost:5173
- 一键启动: `start.bat`
