import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, Pencil, Upload, X } from 'lucide-react'
import { getPost, updatePost, deletePost } from '../api/client'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { toast } from 'sonner'

const emotions = [
  { value: 'calm', label: '平静', mark: '—' },
  { value: 'reflective', label: '沉思', mark: '~' },
  { value: 'happy', label: '开心', mark: '+' },
  { value: 'melancholy', label: '惆怅', mark: '...' },
  { value: 'grateful', label: '感恩', mark: '*' },
  { value: 'anxious', label: '不安', mark: '!' },
]

export default function PostDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [editImage, setEditImage] = useState(null)
  const [saving, setSaving] = useState(false)
  const imageInputRef = useRef(null)

  useEffect(() => {
    getPost(id)
      .then((data) => {
        setPost(data)
        setTitle(data.title)
        setContent(data.content)
        setEmotion(data.emotion)
      })
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false))
  }, [id])

  const handleSave = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', title.trim())
      fd.append('content', content.trim())
      fd.append('emotion', emotion)
      if (editImage) fd.append('image', editImage)
      const updated = await updatePost(id, fd)
      setPost(updated)
      setEditImage(null)
      setEditing(false)
      toast.success('已保存')
    } catch {
      toast.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定删除吗？')) return
    try {
      await deletePost(id)
      toast.success('已删除')
      navigate('/posts', { replace: true })
    } catch {
      toast.error('删除失败')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!post) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-12">
        <p className="text-murmur-text-muted">内容不存在</p>
      </div>
    )
  }

  const emotionItem = emotions.find((e) => e.value === post.emotion)

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 -ml-2.5 rounded-xl text-murmur-text-secondary hover:text-murmur-text hover:bg-murmur-surface transition-colors"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setEditing(!editing)}
            className={`p-2.5 rounded-xl transition-colors ${
              editing
                ? 'text-murmur-accent bg-murmur-accent/8'
                : 'text-murmur-text-muted hover:text-murmur-text hover:bg-murmur-surface'
            }`}
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2.5 rounded-xl text-murmur-text-muted hover:text-murmur-danger hover:bg-murmur-danger/5 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题（可选）"
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors text-xl font-semibold"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写点什么..."
            rows={10}
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors resize-none leading-relaxed text-[15px]"
          />
          {/* Image picker in edit mode */}
          {editImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-murmur-border-visible">
              <img
                src={URL.createObjectURL(editImage)}
                alt="预览"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setEditImage(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-murmur-deep/70 text-murmur-text-secondary hover:text-murmur-danger backdrop-blur-sm transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : post.image ? (
            <div className="relative rounded-2xl overflow-hidden border border-murmur-border-visible">
              <img
                src={`/uploads/images/${post.image}`}
                alt="当前图片"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setEditImage(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-murmur-deep/70 text-murmur-text-secondary hover:text-murmur-danger backdrop-blur-sm transition-colors text-xs"
              >
                保留原图
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-murmur-border-visible rounded-2xl text-murmur-text-muted hover:border-murmur-accent/25 hover:text-murmur-accent/60 transition-all text-xs"
            >
              <Upload size={14} /> 添加图片（可选）
            </button>
          )}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setEditImage(file)
            }}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            {emotions.map(({ value, label, mark }) => (
              <button
                key={value}
                onClick={() => setEmotion(emotion === value ? '' : value)}
                className={`px-4 py-2 rounded-full text-xs transition-all ${
                  emotion === value
                    ? 'bg-murmur-accent/15 text-murmur-accent border border-murmur-accent/25'
                    : 'bg-murmur-surface text-murmur-text-muted border border-murmur-border hover:border-murmur-border-visible'
                }`}
              >
                {mark} {label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="px-8 py-3 bg-murmur-accent text-murmur-deep font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors disabled:opacity-40 text-sm"
            >
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setTitle(post.title)
                setContent(post.content)
                setEmotion(post.emotion)
                setEditImage(null)
              }}
              className="px-8 py-3 bg-murmur-surface text-murmur-text-secondary rounded-2xl hover:bg-murmur-elevated transition-colors text-sm font-medium"
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <article className="animate-fade-in">
          {post.image && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-murmur-border-visible">
              <img
                src={`/uploads/images/${post.image}`}
                alt={post.title || '碎碎念配图'}
                className="w-full object-cover max-h-80"
              />
            </div>
          )}
          {post.title && (
            <h1 className="text-2xl font-bold mb-6 leading-snug">{post.title}</h1>
          )}
          <div className="text-murmur-text leading-[1.85] text-[15px] whitespace-pre-wrap mb-10">
            {post.content}
          </div>
          <footer className="flex items-center gap-3 text-xs text-murmur-text-muted pt-6 border-t border-murmur-border">
            {emotionItem && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-murmur-surface border border-murmur-border text-murmur-text-secondary">
                <span className="text-murmur-accent/60">{emotionItem.mark}</span>
                {emotionItem.label}
              </span>
            )}
            <span>{post.created_at?.slice(0, 10)}</span>
          </footer>
        </article>
      )}
    </div>
  )
}
