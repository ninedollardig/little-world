import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileAudio, X, Sparkles } from 'lucide-react'
import { uploadAudio as apiUploadAudio, createPost } from '../api/client'
import { toast } from 'sonner'

const emotions = [
  { value: 'calm', label: '平静', mark: '—' },
  { value: 'reflective', label: '沉思', mark: '~' },
  { value: 'happy', label: '开心', mark: '+' },
  { value: 'melancholy', label: '惆怅', mark: '...' },
  { value: 'grateful', label: '感恩', mark: '*' },
  { value: 'anxious', label: '不安', mark: '!' },
]

export default function UploadPage() {
  const [tab, setTab] = useState('audio')
  const navigate = useNavigate()

  const [audioFile, setAudioFile] = useState(null)
  const [audioTitle, setAudioTitle] = useState('')
  const [audioDesc, setAudioDesc] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [postTitle, setPostTitle] = useState('')
  const [postContent, setPostContent] = useState('')
  const [postEmotion, setPostEmotion] = useState('')
  const [postImage, setPostImage] = useState(null)
  const [posting, setPosting] = useState(false)
  const imageInputRef = useRef(null)

  const handleFileDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file)
      if (!audioTitle) setAudioTitle(file.name.replace(/\.[^.]+$/, ''))
    }
  }

  const handleAudioSubmit = async (e) => {
    e.preventDefault()
    if (!audioFile || !audioTitle.trim()) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', audioFile)
      fd.append('title', audioTitle.trim())
      fd.append('description', audioDesc.trim())
      await apiUploadAudio(fd)
      toast.success('上传成功')
      setAudioFile(null)
      setAudioTitle('')
      setAudioDesc('')
      navigate('/audio')
    } catch {
      toast.error('上传失败')
    } finally {
      setUploading(false)
    }
  }

  const handlePostSubmit = async (e) => {
    e.preventDefault()
    if (!postContent.trim()) return
    setPosting(true)
    try {
      const fd = new FormData()
      fd.append('title', postTitle.trim())
      fd.append('content', postContent.trim())
      fd.append('emotion', postEmotion)
      if (postImage) fd.append('image', postImage)
      await createPost(fd)
      toast.success('已发布')
      setPostTitle('')
      setPostContent('')
      setPostEmotion('')
      setPostImage(null)
      navigate('/posts')
    } catch (err) {
      toast.error(err.message || '发布失败')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-8">
      <h1 className="text-2xl font-bold mb-8">发布</h1>

      {/* Tab switcher */}
      <div className="flex bg-murmur-surface rounded-2xl p-1 mb-8">
        {[
          { key: 'audio', label: '上传音频' },
          { key: 'post', label: '写碎碎念' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
              tab === key
                ? 'bg-murmur-elevated text-murmur-text shadow-sm'
                : 'text-murmur-text-muted hover:text-murmur-text-secondary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Audio upload tab */}
      {tab === 'audio' && (
        <form onSubmit={handleAudioSubmit} className="space-y-4">
          {audioFile ? (
            <div className="flex items-center gap-4 bg-murmur-surface border border-murmur-accent/15 rounded-2xl p-5">
              <div className="w-12 h-12 rounded-xl bg-murmur-accent/10 flex items-center justify-center shrink-0">
                <FileAudio size={22} className="text-murmur-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-murmur-text text-sm font-medium truncate">{audioFile.name}</p>
                <p className="text-murmur-text-muted text-xs mt-0.5">
                  {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudioFile(null)}
                className="p-2 rounded-xl text-murmur-text-muted hover:text-murmur-danger hover:bg-murmur-danger/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="flex flex-col items-center justify-center gap-4 py-14 border-2 border-dashed border-murmur-border-visible rounded-2xl cursor-pointer hover:border-murmur-accent/25 hover:bg-murmur-surface/50 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-2xl bg-murmur-surface flex items-center justify-center group-hover:bg-murmur-accent/5 transition-colors">
                <Upload size={28} strokeWidth={1.5} className="text-murmur-text-muted group-hover:text-murmur-accent/60 transition-colors" />
              </div>
              <div className="text-center">
                <p className="text-murmur-text-secondary text-sm mb-1">
                  拖拽音频到这里，或<span className="text-murmur-accent">点击选择</span>
                </p>
                <p className="text-murmur-text-muted/60 text-xs">
                  mp3 / wav / ogg / flac / m4a
                </p>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileDrop}
            className="hidden"
          />

          <input
            type="text"
            value={audioTitle}
            onChange={(e) => setAudioTitle(e.target.value)}
            placeholder="标题"
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors text-[15px]"
          />
          <textarea
            value={audioDesc}
            onChange={(e) => setAudioDesc(e.target.value)}
            placeholder="描述与注记（可选）"
            rows={2}
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors resize-none text-[15px]"
          />
          <button
            type="submit"
            disabled={uploading || !audioFile || !audioTitle.trim()}
            className="w-full py-4 bg-murmur-accent text-white font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors disabled:opacity-30 text-[15px]"
          >
            {uploading ? '上传中...' : '保存音频'}
          </button>
        </form>
      )}

      {/* Post tab */}
      {tab === 'post' && (
        <form onSubmit={handlePostSubmit} className="space-y-4">
          <input
            type="text"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            placeholder="标题（可选）"
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors text-xl font-semibold"
          />
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="此刻想说的话..."
            rows={8}
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors resize-none leading-relaxed text-[15px]"
          />
          {/* Image picker */}
          {postImage ? (
            <div className="relative rounded-2xl overflow-hidden border border-murmur-border-visible">
              <img
                src={URL.createObjectURL(postImage)}
                alt="预览"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => setPostImage(null)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-white/70 text-murmur-text-secondary hover:text-murmur-danger backdrop-blur-sm transition-colors"
              >
                <X size={16} />
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
              if (file) setPostImage(file)
            }}
            className="hidden"
          />

          <div className="flex flex-wrap gap-2">
            {emotions.map(({ value, label, mark }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPostEmotion(postEmotion === value ? '' : value)}
                className={`px-4 py-2 rounded-full text-xs transition-all ${
                  postEmotion === value
                    ? 'bg-murmur-accent/15 text-murmur-accent border border-murmur-accent/25'
                    : 'bg-murmur-surface text-murmur-text-muted border border-murmur-border hover:border-murmur-border-visible'
                }`}
              >
                {mark} {label}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={posting || !postContent.trim()}
            className="w-full py-4 bg-murmur-accent text-white font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors disabled:opacity-30 text-[15px]"
          >
            {posting ? '发布中...' : '发布碎碎念'}
          </button>
        </form>
      )}
    </div>
  )
}
