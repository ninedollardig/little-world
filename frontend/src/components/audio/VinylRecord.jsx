import MoonIcon from '../shared/MoonIcon'

export default function VinylRecord({ spinning = false, size = 'lg', onClick }) {
  const dims = size === 'sm' ? { record: 48, label: 18 } : { record: 200, label: 64 }

  return (
    <div
      className={`relative inline-flex items-center cursor-pointer select-none ${
        size === 'sm' ? '' : 'flex-col'
      }`}
      onClick={onClick}
    >
      {/* Record disc */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: dims.record,
          height: dims.record,
          background: `
            repeating-radial-gradient(
              circle at center,
              #1a1a1a 0px,
              #1a1a1a 3px,
              #222 3px,
              #222 4px,
              #1a1a1a 4px,
              #1a1a1a 7px,
              #1f1f1f 7px,
              #1f1f1f 8px
            )
          `,
          boxShadow: `
            0 0 0 ${dims.record * 0.04}px #111,
            0 0 0 ${dims.record * 0.06}px #1a1a1a,
            0 ${dims.record * 0.04}px ${dims.record * 0.1}px rgba(0,0,0,0.5)
          `,
          animation: spinning ? `spin ${size === 'sm' ? 3 : 4}s linear infinite` : 'none',
        }}
      >
        {/* Inner groove ring */}
        <div
          className="rounded-full"
          style={{
            width: dims.record * 0.42,
            height: dims.record * 0.42,
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        />

        {/* Center label */}
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: dims.label,
            height: dims.label,
            background: 'linear-gradient(135deg, #2a1f1a 0%, #3d2b20 50%, #2a1f1a 100%)',
            border: '2px solid rgba(232,180,120,0.2)',
          }}
        >
          <MoonIcon
            size={dims.label * 0.45}
            className="text-murmur-accent/60"
          />
        </div>

        {/* Spindle hole */}
        <div
          className="absolute rounded-full bg-murmur-deep"
          style={{
            width: dims.label * 0.12,
            height: dims.label * 0.12,
          }}
        />
      </div>

      {/* Tonearm (large only) */}
      {size === 'lg' && (
        <div className="absolute -right-8 top-4" style={{ transformOrigin: 'top right' }}>
          {/* Base */}
          <div className="w-3 h-4 rounded-sm bg-murmur-text-muted/30" />
          {/* Arm */}
          <div
            className="absolute top-1 right-1.5 w-24 h-[2px] bg-murmur-text-muted/40 rounded-full origin-right"
            style={{ transform: 'rotate(-25deg)' }}
          >
            {/* Headshell */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2">
              <div className="w-2.5 h-1 bg-murmur-text-muted/30 rounded-sm" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* Spin keyframe injected via index.css */
