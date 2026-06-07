import MoonIcon from './MoonIcon'

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="animate-breathe">
        <MoonIcon size={36} className="text-murmur-accent/60" glow />
      </div>
      <p className="text-murmur-text-muted text-xs">加载中...</p>
    </div>
  )
}
