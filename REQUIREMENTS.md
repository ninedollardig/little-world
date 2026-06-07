# 小世界 · A Little World 需求文档

## 功能清单

### 音频（助眠音频）
- [x] 上传音频文件（mp3/wav/ogg/flac/m4a）
- [x] 填写标题和描述
- [x] 音频列表（分页，最新在前）
- [x] 音频详情页
- [x] 流式播放（支持拖动进度条 seek）
- [x] 全局浮动播放器（切换页面不中断）
- [x] 删除音频

### 碎碎念（文字帖子）
- [x] 创建文字帖子（标题+内容+情绪标签）
- [x] 帖子列表（分页，最新在前）
- [x] 帖子详情页
- [x] 编辑帖子
- [x] 删除帖子

### 导航
- [x] 底部标签栏（首页/音频/碎碎念/上传）
- [x] 移动端响应式布局

### 首页
- [x] 随时间变化的问候语
- [x] 最近上传的音频预览
- [x] 最近碎碎念预览

## API 端点

| Method | Path | 说明 |
|--------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/audio | 音频列表 |
| GET | /api/audio/:id | 音频详情 |
| POST | /api/audio | 上传音频 |
| DELETE | /api/audio/:id | 删除音频 |
| GET | /api/audio/:id/stream | 流式播放 |
| GET | /api/posts | 帖子列表 |
| GET | /api/posts/:id | 帖子详情 |
| POST | /api/posts | 创建帖子 |
| PUT | /api/posts/:id | 编辑帖子 |
| DELETE | /api/posts/:id | 删除帖子 |

## 数据库

### audios
| 列 | 类型 | 说明 |
|----|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT NOT NULL | 标题 |
| description | TEXT | 描述 |
| filename | TEXT NOT NULL | UUID 磁盘文件名 |
| original_name | TEXT NOT NULL | 原始文件名 |
| file_size | INTEGER | 字节数 |
| mime_type | TEXT | MIME 类型 |
| duration_sec | REAL | 时长（秒） |
| created_at | TEXT | 创建时间 |

### posts
| 列 | 类型 | 说明 |
|----|------|------|
| id | INTEGER PK | 自增 |
| title | TEXT | 标题 |
| content | TEXT NOT NULL | 正文 |
| emotion | TEXT | 情绪标签 |
| created_at | TEXT | 创建时间 |
| updated_at | TEXT | 更新时间 |
