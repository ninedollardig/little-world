import MoonIcon from './MoonIcon'

export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      {Icon ? (
        <Icon size={44} strokeWidth={1} className="text-murmur-text-muted mb-5" />
      ) : (
        <div className="mb-5">
          <MoonIcon size={48} className="text-murmur-text-muted" glow />
        </div>
      )}
      <h3 className="text-murmur-text-secondary text-base font-medium mb-2">{title}</h3>
      {description && <p className="text-murmur-text-muted text-sm">{description}</p>}
    </div>
  )
}
