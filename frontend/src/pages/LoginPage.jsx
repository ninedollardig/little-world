import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'sonner'
import MoonIcon from '../components/shared/MoonIcon'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(username.trim(), password)
      } else {
        await register(username.trim(), password, displayName.trim())
      }
      toast.success(mode === 'login' ? '欢迎回来' : '注册成功')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-20 pb-8">
      <div className="text-center mb-12">
        <MoonIcon size={40} className="text-murmur-accent mx-auto mb-4" glow />
        <h1 className="text-2xl font-bold text-murmur-text">小世界</h1>
        <p className="text-murmur-text-muted text-xs mt-2 tracking-wide">A Little World</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="用户名"
          autoComplete="username"
          className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors"
        />
        {mode === 'register' && (
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="显示名称（可选）"
            className="w-full bg-murmur-surface border border-murmur-border rounded-2xl px-5 py-4 text-murmur-text placeholder-murmur-text-muted focus:outline-none focus:border-murmur-accent/40 transition-colors"
          />
        )}

        <button
          type="submit"
          disabled={submitting || !username.trim() || !password}
          className="w-full py-4 bg-murmur-accent text-murmur-deep font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors disabled:opacity-30"
        >
          {submitting ? '请稍候...' : mode === 'login' ? '登录' : '注册'}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          className="text-murmur-text-muted hover:text-murmur-accent text-xs transition-colors"
        >
          {mode === 'login' ? '没有账号？注册' : '已有账号？登录'}
        </button>
      </div>
    </div>
  )
}
