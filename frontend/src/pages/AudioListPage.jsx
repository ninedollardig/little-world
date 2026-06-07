import { useState, useEffect } from 'react'
import { Music } from 'lucide-react'
import { getAudios } from '../api/client'
import AudioCard from '../components/audio/AudioCard'
import EmptyState from '../components/shared/EmptyState'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function AudioListPage() {
  const [audios, setAudios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAudios(1, 50)
      .then((data) => setAudios(data.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-8">
      <header className="mb-8">
        <p className="text-murmur-text-muted text-[10px] tracking-[0.2em] uppercase mb-1">Library</p>
        <h1 className="text-2xl font-bold">助眠音频</h1>
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : audios.length === 0 ? (
        <EmptyState
          icon={Music}
          title="还没有音频"
          description="上传你的第一个助眠录音"
        />
      ) : (
        <div className="space-y-1.5">
          {audios.map((a, i) => (
            <div key={a.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 0.06}s` }}>
              <AudioCard audio={a} playlist={audios} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
