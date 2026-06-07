import { X, Repeat, ListMusic } from 'lucide-react'
import { useAudio } from '../../context/AudioContext'
import VinylRecord from './VinylRecord'

function fmt(sec) {
  if (!sec || !isFinite(sec)) return '00:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function AudioPlayer() {
  const { current, isPlaying, progress, duration, playMode, toggle, seek, stop, togglePlayMode } = useAudio()

  if (!current) return null

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      className="fixed bottom-14 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-murmur-accent/5 to-transparent pointer-events-none" />

      <div className="bg-murmur-surface/95 backdrop-blur-xl border-t border-murmur-border">
        <div className="max-w-lg mx-auto">
          {/* Seekable progress */}
          <div
            className="relative h-[3px] bg-murmur-border-visible cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              seek(((e.clientX - rect.left) / rect.width) * duration)
            }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-murmur-accent rounded-r-full transition-[width] duration-300"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-murmur-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(232,180,120,0.5)]" />
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5">
            {/* Mini vinyl record */}
            <VinylRecord
              spinning={isPlaying}
              size="sm"
              onClick={toggle}
            />

            {/* Track info */}
            <div className="flex-1 min-w-0">
              <p className="text-murmur-text text-[13px] font-medium truncate leading-tight">
                {current.title}
              </p>
              <p className="text-murmur-text-muted text-[11px] tabular-nums">
                {fmt(progress)}&ensp;&middot;&ensp;{fmt(duration)}
              </p>
            </div>

            {/* Play mode toggle */}
            <button
              onClick={togglePlayMode}
              className={`p-2 rounded-xl transition-colors ${
                playMode === 'loop'
                  ? 'text-murmur-accent bg-murmur-accent/10'
                  : 'text-murmur-text-muted hover:text-murmur-text-secondary hover:bg-murmur-surface'
              }`}
              title={playMode === 'loop' ? '单曲循环中' : '顺序播放中'}
            >
              {playMode === 'loop' ? (
                <Repeat size={17} />
              ) : (
                <ListMusic size={17} />
              )}
            </button>

            {/* Close */}
            <button
              onClick={stop}
              className="p-2 -mr-1 rounded-xl text-murmur-text-muted hover:text-murmur-text-secondary hover:bg-murmur-surface transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
