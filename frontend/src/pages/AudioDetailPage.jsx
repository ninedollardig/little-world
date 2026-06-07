import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getAudio, deleteAudio } from '../api/client'
import { useAudio } from '../context/AudioContext'
import VinylRecord from '../components/audio/VinylRecord'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { toast } from 'sonner'

function formatDuration(sec) {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AudioDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { current, isPlaying, load, toggle } = useAudio()
  const [audio, setAudio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAudio(id)
      .then(setAudio)
      .catch(() => toast.error('加载失败'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('确定删除这条音频吗？')) return
    try {
      await deleteAudio(id)
      toast.success('已删除')
      navigate('/audio', { replace: true })
    } catch {
      toast.error('删除失败')
    }
  }

  if (loading) return <LoadingSpinner />
  if (!audio) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-12">
        <p className="text-murmur-text-muted">音频不存在</p>
      </div>
    )
  }

  const isCurrent = current?.id === audio.id
  const isActive = isCurrent && isPlaying

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
        <button
          onClick={handleDelete}
          className="p-2.5 rounded-xl text-murmur-text-muted hover:text-murmur-danger hover:bg-murmur-danger/5 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Vinyl record player */}
      <div className="flex flex-col items-center justify-center py-8 mb-10">
        {/* Glow behind record when playing */}
        <div className={`transition-all duration-1000 ${
          isActive ? 'opacity-100 scale-110' : 'opacity-0 scale-90'
        }`}>
          <div className="absolute w-48 h-48 rounded-full bg-murmur-accent/5 blur-3xl" />
        </div>

        <VinylRecord
          spinning={isActive}
          size="lg"
          onClick={() => (isCurrent ? toggle() : load(audio))}
        />

        <p className="text-murmur-text-muted text-xs mt-8 tracking-wide">
          {isActive ? '♪ 正在播放' : isCurrent ? '已暂停 · 点击继续' : '点击唱片播放'}
        </p>
      </div>

      {/* Metadata */}
      <h1 className="text-2xl font-bold mb-3 leading-snug">{audio.title}</h1>
      {audio.description && (
        <p className="text-murmur-text-secondary text-[15px] leading-relaxed mb-6">
          {audio.description}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4 text-xs text-murmur-text-muted">
        <span className="px-2.5 py-1 rounded-lg bg-murmur-surface border border-murmur-border">
          {audio.original_name}
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-murmur-surface border border-murmur-border">
          {formatDuration(audio.duration_sec)}
        </span>
        <span>{audio.created_at?.slice(0, 10)}</span>
      </div>
    </div>
  )
}
