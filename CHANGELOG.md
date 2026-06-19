# 小世界 · A Little World 项目日志

## 2026-06-09
- 修复发布碎碎念失败：
  - `start.bat` 仍引用已删除的 `main.py`（Flask 迁移时改为 `app.py`），导致一键启动时后端无法运行
  - `createPost`/`updatePost` 缺少 401 登录过期处理（token 过期时吞掉错误，只显示泛化"发布失败"），改为复用 `request()` 的错误处理模式：读取后端返回的具体错误信息、401 时自动清 token 跳转登录
  - `UploadPage` 发布失败 toast 改为显示后端实际错误消息，不再硬编码"发布失败"
- 碎碎念列表（/posts）从单列纵向排列改为 CSS columns masonry 瀑布流布局：`column-width: 300px` 自动适配列数，`break-inside: avoid` 防止卡片被截断，容器从 `max-w-lg` 扩至 `max-w-6xl`

### 玻璃态浅色主题（Glassmorphism Light）
- 全局色彩：暗黑手稿风 → 粉紫渐变浅色（#f7f2f0 底，玫瑰粉 accent #c47a96）
- 字体：Noto Serif SC 衬线 → Inter + Noto Sans SC 无衬线为主，保留 Long Cang 手写时钟
- 卡片：纯色暗卡 → 磨砂玻璃（backdrop-blur-xl + 半透明白色底 + 柔光阴影）
- 背景：暗色噪声纹理 → 暖色调多层径向渐变 blob + 细颗粒纹理
- 导航栏/播放器：深色毛玻璃 → 亮色毛玻璃
- VinylRecord：暗色标签 → 粉调亮色标签
- 按钮：accent-on-dark → accent-on-white
- 所有 text-murmur-deep → text-white（accent 按钮上）
- 所有 bg-murmur-deep/70 遮罩 → bg-white/70

## 2026-06-07

### 部署准备（⚠️ 待完成）
- Fly.io 账号已登录（eatebanjeima@gmail.com），待绑定信用卡（免费层不扣费）
- Dockerfile 多阶段构建就绪（前端 npm build + 后端 Flask/gunicorn）
- fly.toml 配置：香港区域、512MB 内存、双持久卷（data + uploads）
- `fly deploy` 一键部署，`fly secrets set JWT_SECRET=xxx` 设置密钥
- 备用方案：wsgi.py + PythonAnywhere WSGI 配置

### Flask 迁移
- 后端框架从 FastAPI 切换到 Flask（PythonAnywhere 兼容性）
- FastAPI main.py → Flask app.py（create_app 工厂模式）
- 路由改造：@router.get → @bp.route，Form/File → request.form/files
- JWT 认证：Depends → 自定义 @login_required 装饰器 + g.user
- 删除 models.py（Pydantic → 原生 dict）
- 新增依赖：flask、flask-cors、gunicorn

### JWT 密钥安全
- 移除 auth.py 中 JWT_SECRET 的硬编码 fallback
- 改为 `os.getenv("JWT_SECRET") or secrets.token_hex(32)` 随机生成
- .env 添加 JWT_SECRET 配置项

### 项目更名
- "Murmur Nights / 夜深" → "小世界 · A Little World"
- 更新：页面标题、CLAUDE.md、REQUIREMENTS.md、start.bat、FastAPI title

### 用户系统 + 登录 + "我的"页面
- 后端：users 表，audios/posts 加 user_id 外键，JWT 认证 + 权限控制
- 前端：LoginPage（登录/注册）、ProfilePage（个人信息 + 我的音频/碎碎念）、AuthContext
- 底部导航新增「我的」tab
- 上传/编辑/删除接口加权限校验（只能操作自己的内容）
- 所有列表返回发布者用户名

### 碎碎念配图片
- posts 表加 image 字段，后端支持 multipart 图片上传
- 前端：上传页加图片选择、首页卡片缩略图、详情页大图、编辑可替换图片
- 图片服务 `/uploads/images/`

### 莫兰迪色系 + 卡片式布局
- 全局配色改为莫兰迪低饱和色（暖棕底、奶油字、灰调琥珀）
- 首页音频/碎碎念分区卡片（6 色调循环）
- 各行间距增大（space-y-24、py-7）

### 日历式首页改版
- 实时 24 小时制时钟，Long Cang 手写涂鸦字体（text-7xl），每秒刷新
- 中文日期转换：年（二〇二六）、月（六月）、日（六月七日）、星期（星期日）
- 音频 + 碎碎念混合时间线，按日期分组，最新在前
- 月份切换时插入居中月牌分隔符
- TimelineItem 子组件：音频（迷你黑胶 + 播放切换）、碎碎念（情绪标记 + 文字预览）
- 舒朗留白布局：space-y-16 日期间距、居中日期标题 + 装饰分割线
- 首页空态：大月亮 + 引导文案 + 开始创作按钮

### 黑胶唱片播放视觉
- VinylRecord 组件：CSS 纯黑胶唱片（同心凹槽纹路 + 旋转动画 + 中心月亮标签 + 唱臂）
- 大尺寸：音频详情页（200px，4s 一圈，带唱臂 + 播放光晕）
- 小尺寸：浮动播放条左侧（48px，3s 一圈，替代原播放按钮）
- 播放时旋转，暂停时静止

### 油画质感背景
- 5 层径向渐变 blob 模拟油画笔触：暖赭石、灰玫瑰、鼠尾草绿、淡紫、琥珀
- 画布纹理叠加（fractalNoise + 降低透明度），替代纯噪声
- 整体氛围：温暖、稚拙，像儿童画册的底色

### 碎碎念卡片式改版
- 每张卡片独立渐变色底（4 色调循环：暖棕/蓝灰/紫灰/绿灰）
- 更大圆角（rounded-3xl）、更大内边距、hover 微放大
- 卡片内嵌细微纹理叠加
- 情绪标记 + 日期置顶，标题加大，预览文字行高 1.7

### 月亮标识系统
- MoonIcon 组件：SVG 弯月（支持 glow 光晕模式），全站统一视觉符号
- Favicon 从 emoji 改为 SVG 月亮（琥珀色）
- 导航栏首页图标改为月亮
- 首页 Hero 右上角大面积装饰月亮（opacity 0.2）+ 空白页大月亮
- LoadingSpinner 改为呼吸月牙
- EmptyState 默认图标改为月亮
- LoadingSpinner 改为呼吸月牙（替代传统转圈）
- EmptyState 默认图标改为月亮

### 播放模式
- AudioContext 新增 playMode（sequential / loop）和 playlist 支持
- 顺序播放：当前曲目结束后自动播放列表下一首
- 单曲循环：当前曲目结束后从头重播
- AudioPlayer 新增模式切换按钮（Repeat / ListMusic 图标）
- AudioCard 支持接收 playlist 参数，列表页自动传递完整播放列表

### UI 重构（Nocturnal Manuscript 方向）
- 移除 Inter 字体，全站改用 Noto Serif SC（文学气质）
- SVG 噪声纹理背景（#0b0a10 更深底色），纸张/暗房质感
- 呼吸动效：播放按钮 4s 呼吸缩放 + 光晕脉冲
- 卡片入场 stagger 动画（fadeUp + 逐条延迟）
- 音频卡片：播放中显示波形指示条 + 标题变为琥珀色
- 播放器：毛玻璃 backdrop-blur-xl、进度条拖拽把手光晕
- 碎碎念卡片：情绪标记（"—" "~" "+" "..."  "*" "!"）替代文字标签
- 导航栏：选中项 pill 背景替代单纯颜色变化
- 详情页：播放按钮放大到 112px，呼吸动效

### 基础
- 项目初始化：助眠音频 + 碎碎念个人网站
- 后端 FastAPI + SQLite，生命周期改用 lifespan（修复 on_event deprecation）
- 前端 React + Vite + Tailwind CSS 4
- start.bat 修复：去掉嵌套引号、cd 后 start、/k 保持窗口打开
