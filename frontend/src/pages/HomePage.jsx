import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, ArrowRight } from 'lucide-react'
import { getAudios, getPosts } from '../api/client'
import { useAudio } from '../context/AudioContext'
import MoonIcon from '../components/shared/MoonIcon'
import LoadingSpinner from '../components/shared/LoadingSpinner'

/* ── Chinese date helpers ── */

const CN_NUMS = ['〇','一','二','三','四','五','六','七','八','九','十','十一','十二',
  '十三','十四','十五','十六','十七','十八','十九','二十','廿一','廿二','廿三','廿四',
  '廿五','廿六','廿七','廿八','廿九','三十','卅一']

const WEEKDAYS = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六']

function cnYear(y) {
  return String(y).split('').map(c => CN_NUMS[+c]).join('')
}

function cnDate(ymd) {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const wd = WEEKDAYS[date.getDay()]
  return { year: cnYear(y), month: `${CN_NUMS[m]}月`, day: `${CN_NUMS[m]}月${CN_NUMS[d]}日`, weekday: wd }
}

/* ── Card palette ── */

const cardTints = [
  'bg-[#3b2a28] border-[#5a3a34]/25',   // dusty rose
  'bg-[#2a332c] border-[#3d4a3a]/25',   // muted sage
  'bg-[#282d38] border-[#384058]/25',   // dusk blue
  'bg-[#3a2e28] border-[#544030]/25',   // warm clay
  'bg-[#2d2835] border-[#403a52]/25',   // muted plum
  'bg-[#28302e] border-[#3a4844]/25',   // celadon
]

/* ── Audio item inside card ── */

function AudioRow({ item, playlist }) {
  const { current, isPlaying, load, toggle } = useAudio()
  const isCurrent = current?.id === item.id
  const isActive = isCurrent && isPlaying
  const time = item.created_at?.slice(11, 16) || ''

  return (
    <div
      onClick={() => (isCurrent ? toggle() : load(item, playlist))}
      className="flex items-center gap-4 py-4 px-1 cursor-pointer hover:bg-white/3 rounded-xl transition-colors -mx-1 group"
    >
      <div className="relative w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
        style={{
          background: isActive
            ? 'repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 2px, #222 2px, #222 3px, #1a1a1a 3px, #1a1a1a 5px)'
            : 'repeating-radial-gradient(circle at center, #1a1a1a 0px, #1a1a1a 1px, #1f1f1f 1px, #1f1f1f 2px, #1a1a1a 2px, #1a1a1a 3px)',
          animation: isActive ? 'spin 3s linear infinite' : 'none',
          boxShadow: isActive ? '0 0 14px rgba(200,168,124,0.2)' : 'none',
        }}
      >
        <div className="w-3.5 h-3.5 rounded-full bg-[#2a1f1a] border border-murmur-accent/20 flex items-center justify-center">
          <MoonIcon size={7} className="text-murmur-accent/40" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`text-[14px] leading-snug truncate ${isCurrent ? 'text-murmur-accent' : 'text-murmur-text/80'}`}>
          {item.title}
        </h3>
        {item.description && (
          <p className="text-murmur-text-muted/60 text-xs mt-0.5 truncate">{item.description}</p>
        )}
      </div>

      <span className="text-murmur-text-muted/50 text-xs shrink-0">{time}</span>
    </div>
  )
}

/* ── Post item inside card ── */

const emotionMarks = { calm: '—', reflective: '~', happy: '+', melancholy: '...', grateful: '*', anxious: '!' }

function PostRow({ item }) {
  const time = item.created_at?.slice(11, 16) || ''
  const mark = emotionMarks[item.emotion]
  const imageUrl = item.image ? `/uploads/images/${item.image}` : null

  return (
    <Link
      to={`/posts/${item.id}`}
      className="flex items-start gap-4 py-4 px-1 hover:bg-white/3 rounded-xl transition-colors -mx-1 group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/3 border border-white/5 flex items-center justify-center shrink-0 text-murmur-accent/40 text-base font-serif">
        {mark || <MoonIcon size={14} className="text-murmur-text-muted/40" />}
      </div>

      <div className="flex-1 min-w-0">
        {item.title ? (
          <h3 className="text-[14px] font-medium leading-snug text-murmur-text/80 group-hover:text-murmur-text mb-0.5">
            {item.title}
          </h3>
        ) : null}
        <p className="text-murmur-text-secondary text-[13px] leading-relaxed line-clamp-2">
          {item.content}
        </p>
      </div>

      {imageUrl && (
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/5">
          <img src={imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      <span className="text-murmur-text-muted/50 text-xs shrink-0 mt-0.5">{time}</span>
    </Link>
  )
}

/* ── Main page ── */

export default function HomePage() {
  const [clock, setClock] = useState('')
  const [todayStr, setTodayStr] = useState('')
  const [items, setItems] = useState([])
  const [audios, setAudios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(String(now.getHours()))
      setTodayStr(
        `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    Promise.all([
      getAudios(1, 200).catch(() => ({ items: [] })),
      getPosts(1, 200).catch(() => ({ items: [] })),
    ]).then(([a, p]) => {
      setAudios(a.items)
      const merged = [
        ...a.items.map(x => ({ ...x, type: 'audio' })),
        ...p.items.map(x => ({ ...x, type: 'post' })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      setItems(merged)
      setLoading(false)
    })
  }, [])

  const today = cnDate(todayStr || '2026-06-07')

  // Group items by date
  const dateMap = {}
  items.forEach(item => {
    const d = item.created_at?.slice(0, 10)
    if (!d) return
    if (!dateMap[d]) dateMap[d] = []
    dateMap[d].push(item)
  })

  const sortedDates = Object.keys(dateMap).sort().reverse()

  // Build groups with month separators
  const groups = []
  let lastMonth = null
  sortedDates.forEach(d => {
    const dateInfo = cnDate(d)
    if (dateInfo.month !== lastMonth && lastMonth !== null) {
      groups.push({ type: 'month-sep', month: dateInfo.month })
    }
    lastMonth = dateInfo.month
    groups.push({ type: 'day', date: d, info: dateInfo, items: dateMap[d] })
  })

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-8">
      {/* ── Clock section ── */}
      <header className="flex flex-col items-center mb-12 animate-fade-in">
        <p className="text-murmur-text-muted/50 text-sm tracking-[0.3em] mb-2">
          {today.year}
        </p>
        <p className="text-murmur-accent/40 text-xs tracking-[0.5em] mb-8">
          {today.month.toUpperCase()}
        </p>

        <div className="relative mb-4">
          <div className="absolute -inset-8 bg-murmur-accent/3 blur-3xl rounded-full" />
          <time
            className="relative text-8xl font-hand text-murmur-text tracking-widest select-none"
            style={{ fontFamily: 'var(--font-hand)' }}
          >
            {clock || '0'}
          </time>
        </div>

        <p className="text-murmur-text-secondary text-sm tracking-wide mt-2">
          {today.day} &nbsp;·&nbsp; {today.weekday}
        </p>

        <div className="flex items-center gap-5 mt-5 text-murmur-text-muted/20 text-xs">
          <span>˚</span><span>☁</span><span>✦</span><span>·</span><span>☽</span><span>✧</span>
        </div>
      </header>

      {/* ── Timeline ── */}
      <div className="mt-8">
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <MoonIcon size={48} className="text-murmur-text-muted mx-auto mb-5" glow />
            <p className="text-murmur-text-secondary text-base mb-2">这里还很安静</p>
            <p className="text-murmur-text-muted text-sm mb-8">上传第一段音频，或写下第一篇碎碎念</p>
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-murmur-accent text-murmur-deep font-semibold rounded-2xl hover:bg-murmur-accent-soft transition-colors text-sm"
            >
              开始创作 <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-28">
            {groups.map((group, gi) => {
              if (group.type === 'month-sep') {
                return (
                  <div key={`month-${group.month}`} className="flex items-center justify-center py-8">
                    <div className="px-8 py-3 rounded-3xl bg-murmur-surface/50 border border-murmur-border">
                      <span className="text-murmur-accent/50 text-sm tracking-[0.3em] font-medium">
                        {group.month}
                      </span>
                    </div>
                  </div>
                )
              }

              // Day group
              const isToday = group.date === todayStr
              const dayAudios = group.items.filter(i => i.type === 'audio')
              const dayPosts = group.items.filter(i => i.type === 'post')
              const tint = cardTints[gi % cardTints.length]

              return (
                <section key={group.date} className="animate-fade-up" style={{ animationDelay: `${gi * 0.05}s` }}>
                  {/* Day header */}
                  <div className="text-center mb-10">
                    <h2 className="text-murmur-text text-xl font-semibold tracking-wide">
                      {group.info.day}
                    </h2>
                    <p className="text-murmur-text-muted text-xs mt-1.5 tracking-wide">
                      {group.info.weekday}
                      {isToday && (
                        <span className="ml-2 text-murmur-accent/60">· 今天</span>
                      )}
                    </p>
                    <div className="w-8 h-px bg-murmur-border-visible mx-auto mt-4" />
                  </div>

                  {/* Cards */}
                  <div className="space-y-6">
                    {dayAudios.length > 0 && (
                      <div className={`rounded-2xl border ${tint} overflow-hidden`}>
                        <div className="px-5 pt-5 pb-1">
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-murmur-accent/40" />
                            <span className="text-xs tracking-[0.2em] text-murmur-text-muted/70 font-medium">音频</span>
                          </div>
                        </div>
                        <div className="px-5 pb-3 divide-y divide-white/5">
                          {dayAudios.map(item => (
                            <AudioRow key={item.id} item={item} playlist={audios} />
                          ))}
                        </div>
                      </div>
                    )}

                    {dayPosts.length > 0 && (
                      <div className={`rounded-2xl border ${tint} overflow-hidden`}>
                        <div className="px-5 pt-5 pb-1">
                          <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-murmur-accent/30" />
                            <span className="text-xs tracking-[0.2em] text-murmur-text-muted/70 font-medium">碎碎念</span>
                          </div>
                        </div>
                        <div className="px-5 pb-3 divide-y divide-white/5">
                          {dayPosts.map(item => (
                            <PostRow key={item.id} item={item} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
