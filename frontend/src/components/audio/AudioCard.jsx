import { Play, Pause } from 'lucide-react'
import { useAudio } from '../../context/AudioContext'

function formatDuration(sec) {
  if (!sec) return '--:--'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function AudioCard({ audio, playlist = null }) {
  const { current, isPlaying, load, toggle } = useAudio()
  const isCurrent = current?.id === audio.id

  const handleClick = () => {
    if (isCurrent) toggle()
    else load(audio, playlist)
  }

  return (
    <div
      onClick={handleClick}
      className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-500 ${
        isCurrent
          ? 'bg-murmur-accent/8 border border-murmur-accent/20 shadow-[0_0_30px_rgba(200,130,150,0.10)]'
          : 'bg-white/30 backdrop-blur-md border border-white/20 hover:bg-white/50 hover:border-murmur-accent/15 hover:shadow-md'
      }`}
    >
      <div className="relative shrink-0">
        {isCurrent && isPlaying && (
          <div className="absolute inset-0 rounded-full animate-glow" />
        )}
        <button
          className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
            isCurrent
              ? 'bg-murmur-accent/15 text-murmur-accent'
              : 'bg-white/50 text-murmur-text-muted group-hover:text-murmur-accent group-hover:bg-murmur-accent/8'
          } ${isCurrent && isPlaying ? 'animate-breathe' : ''}`}
        >
          {isCurrent && isPlaying ? (
            <Pause size={20} fill="currentColor" />
          ) : (
            <Play size={20} fill="currentColor" className="ml-0.5" />
          )}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`text-[15px] font-medium truncate transition-colors ${
          isCurrent ? 'text-murmur-accent' : 'text-murmur-text'
        }`}>
          {audio.title}
        </h3>
        <p className="text-murmur-text-muted text-xs mt-0.5">
          {formatDuration(audio.duration_sec)} &middot; {audio.created_at?.slice(0, 10)}
        </p>
      </div>

      {isCurrent && isPlaying && (
        <div className="flex items-end gap-[2px] h-5 shrink-0">
          {[0.6, 1, 0.4, 0.8, 0.5].map((h, i) => (
            <span
              key={i}
              className="w-[2px] bg-murmur-accent/50 rounded-full"
              style={{
                height: `${h * 100}%`,
                animation: `breathe ${1.2 + i * 0.2}s ease-in-out infinite`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
