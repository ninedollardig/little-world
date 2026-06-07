# 小世界 · A Little World 项目日志

## 2026-06-07

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
