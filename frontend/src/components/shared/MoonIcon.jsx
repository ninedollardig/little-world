export default function MoonIcon({ size = 24, className = '', glow = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {glow && (
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="var(--color-murmur-accent, #e8b478)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--color-murmur-accent, #e8b478)" stopOpacity="0" />
          </radialGradient>
        </defs>
      )}
      {glow && <circle cx="32" cy="28" r="30" fill="url(#moonGlow)" />}
      <path
        d="M36 8C26 12 16 22 16 32s10 20 20 24c-12-3-18-14-18-24S24 11 36 8z"
        fill="currentColor"
        fillOpacity="0.92"
      />
    </svg>
  )
}
