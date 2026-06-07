import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Music, FileText, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getAudios, getPosts } from '../api/client'
import MoonIcon from '../components/shared/MoonIcon'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [audios, setAudios] = useState([])
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAudios(1, 100).catch(() => ({ items: [] })),
      getPosts(1, 100).catch(() => ({ items: [] })),
    ]).then(([a, p]) => {
      setAudios(a.items.filter(x => x.user_id === user?.id))
      setPosts(p.items.filter(x => x.user_id === user?.id))
      setLoading(false)
    })
  }, [user])

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-20 pb-8 text-center">
        <MoonIcon size={48} className="text-murmur-text-muted mx-auto mb-5" glow />
        <p className="text-murmur-text-secondary mb-6">请先登录</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-murmur-accent text-murmur-deep font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors text-sm"
        >
          去登录
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-8">
      {/* User card */}
      <div className="bg-murmur-surface/60 border border-murmur-border rounded-3xl p-6 mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-murmur-accent/10 border border-murmur-accent/20 flex items-center justify-center">
            <span className="text-murmur-accent text-xl font-hand">
              {(user.display_name || user.username)[0]}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-murmur-text">
              {user.display_name || user.username}
            </h2>
            <p className="text-murmur-text-muted text-xs mt-0.5">@{user.username}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-murmur-text-muted hover:text-murmur-danger hover:bg-murmur-danger/5 transition-colors text-xs"
        >
          <LogOut size={14} /> 退出登录
        </button>
      </div>

      {/* My content */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* My audios */}
          <div>
            <h3 className="flex items-center gap-2 text-xs tracking-[0.2em] text-murmur-text-muted/70 font-medium mb-3 px-1">
              <Music size={14} /> 我上传的音频
            </h3>
            {audios.length === 0 ? (
              <p className="text-murmur-text-muted/50 text-xs px-1">暂无</p>
            ) : (
              <div className="space-y-0.5">
                {audios.map(a => (
                  <Link
                    key={a.id}
                    to={`/audio/${a.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-murmur-surface/40 transition-colors group"
                  >
                    <span className="flex-1 text-sm text-murmur-text/80 truncate">{a.title}</span>
                    <span className="text-murmur-text-muted/40 text-xs">{a.created_at?.slice(0, 10)}</span>
                    <ChevronRight size={14} className="text-murmur-text-muted/30 group-hover:text-murmur-accent/50 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* My posts */}
          <div>
            <h3 className="flex items-center gap-2 text-xs tracking-[0.2em] text-murmur-text-muted/70 font-medium mb-3 px-1">
              <FileText size={14} /> 我写的碎碎念
            </h3>
            {posts.length === 0 ? (
              <p className="text-murmur-text-muted/50 text-xs px-1">暂无</p>
            ) : (
              <div className="space-y-0.5">
                {posts.map(p => (
                  <Link
                    key={p.id}
                    to={`/posts/${p.id}`}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-murmur-surface/40 transition-colors group"
                  >
                    <span className="flex-1 text-sm text-murmur-text/80 truncate">
                      {p.title || p.content.slice(0, 20)}
                    </span>
                    <span className="text-murmur-text-muted/40 text-xs">{p.created_at?.slice(0, 10)}</span>
                    <ChevronRight size={14} className="text-murmur-text-muted/30 group-hover:text-murmur-accent/50 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
