import { Link } from 'react-router-dom'

const cardPalette = [
  'from-[#2a1f1a] to-[#1f1a16] border-[#3d2b20]/20',
  'from-[#1a2228] to-[#151c20] border-[#253540]/20',
  'from-[#1f1a24] to-[#181420] border-[#2d2435]/20',
  'from-[#1f241a] to-[#181c15] border-[#2d3525]/20',
]

const emotionLabels = {
  calm: '平静',
  reflective: '沉思',
  happy: '开心',
  melancholy: '惆怅',
  grateful: '感恩',
  anxious: '不安',
}

const emotionIcons = {
  calm: '—',
  reflective: '~',
  happy: '+',
  melancholy: '...',
  grateful: '*',
  anxious: '!',
}

export default function PostCard({ post, index = 0 }) {
  const preview = post.content.slice(0, 100) + (post.content.length > 100 ? '…' : '')
  const emotionLabel = emotionLabels[post.emotion]
  const emotionIcon = emotionIcons[post.emotion]
  const tints = cardPalette[index % cardPalette.length]

  return (
    <Link
      to={`/posts/${post.id}`}
      className={`block p-5 rounded-3xl bg-gradient-to-br ${tints} border hover:scale-[1.01] transition-all duration-300 group relative overflow-hidden`}
    >
      {/* Subtle paint texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23b)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />

      <div className="relative">
        {/* Top: emotion mark + date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {emotionIcon && (
              <span className="text-murmur-accent/50 text-base font-serif italic">
                {emotionIcon}
              </span>
            )}
            {emotionLabel && (
              <span className="text-murmur-text-muted text-[11px] tracking-wide">
                {emotionLabel}
              </span>
            )}
          </div>
          <span className="text-murmur-text-muted/40 text-[11px]">
            {post.created_at?.slice(5, 10)}
          </span>
        </div>

        {/* Image thumbnail */}
        {post.image && (
          <div className="mb-3 rounded-xl overflow-hidden border border-white/5">
            <img
              src={`/uploads/images/${post.image}`}
              alt=""
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Title */}
        {post.title && (
          <h3 className="text-[17px] font-semibold mb-2.5 leading-snug text-murmur-text/90 group-hover:text-murmur-text transition-colors">
            {post.title}
          </h3>
        )}

        {/* Preview */}
        <p className="text-murmur-text-secondary/80 text-[14px] leading-[1.7] line-clamp-3">
          {preview}
        </p>
      </div>
    </Link>
  )
}
