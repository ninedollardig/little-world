import { NavLink, useLocation } from 'react-router-dom'
import { Music, FileText, Plus, User } from 'lucide-react'
import MoonIcon from '../shared/MoonIcon'

const tabs = [
  { to: '/', label: '首页', isMoon: true },
  { to: '/audio', icon: Music, label: '音频' },
  { to: '/posts', icon: FileText, label: '碎碎念' },
  { to: '/upload', icon: Plus, label: '上传' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function NavBar() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/60 backdrop-blur-xl border-t border-murmur-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', boxShadow: '0 -4px 24px rgba(160,130,150,0.06)' }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-around h-14 px-1">
        {tabs.map(({ to, icon: Icon, label, isMoon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to))
          return (
            <NavLink
              key={to}
              to={to}
              className="relative flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-2xl transition-all duration-300"
            >
              {active && (
                <span className="absolute inset-0 bg-murmur-accent/12 rounded-2xl" />
              )}
              {isMoon ? (
                <MoonIcon
                  size={18}
                  className={`relative transition-colors duration-300 ${
                    active ? 'text-murmur-accent' : 'text-murmur-text-muted'
                  }`}
                />
              ) : (
                <Icon
                  size={18}
                  strokeWidth={active ? 2 : 1.5}
                  className={`relative transition-colors duration-300 ${
                    active ? 'text-murmur-accent' : 'text-murmur-text-muted'
                  }`}
                />
              )}
              <span
                className={`relative text-[10px] leading-none font-medium transition-colors duration-300 ${
                  active ? 'text-murmur-accent' : 'text-murmur-text-muted'
                }`}
              >
                {label}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}
