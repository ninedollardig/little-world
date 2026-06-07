import { createContext, useContext, useState, useRef, useCallback } from 'react'

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const [current, setCurrent] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [playMode, setPlayMode] = useState('sequential') // 'sequential' | 'loop'
  const [playlist, setPlaylist] = useState([])

  const audioRef = useRef(null)
  const playlistRef = useRef([])
  const playModeRef = useRef('sequential')

  const playNext = useCallback(() => {
    const list = playlistRef.current
    if (!current || list.length === 0) return
    const idx = list.findIndex((a) => a.id === current.id)
    if (idx < 0 || idx >= list.length - 1) return
    const next = list[idx + 1]
    const el = new Audio(`/api/audio/${next.id}/stream`)
    el.volume = volume
    el.addEventListener('loadedmetadata', () => setDuration(el.duration))
    el.addEventListener('timeupdate', () => setProgress(el.currentTime))
    el.addEventListener('ended', () => {
      // Don't call onEnded here, the handler is attached below
    })
    el.addEventListener('pause', () => setIsPlaying(false))
    el.addEventListener('play', () => setIsPlaying(true))
    audioRef.current = el
    setCurrent(next)
    setProgress(0)
    setDuration(0)
    el.play().catch(() => {})
  }, [current, volume])

  const load = useCallback((audio, list = null) => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeEventListener('ended', () => {})
    }
    if (list) {
      setPlaylist(list)
      playlistRef.current = list
    }

    const el = new Audio(`/api/audio/${audio.id}/stream`)
    el.volume = volume

    const onEnded = () => {
      if (playModeRef.current === 'loop') {
        el.currentTime = 0
        el.play().catch(() => {})
      } else if (playModeRef.current === 'sequential') {
        const lst = playlistRef.current
        const idx = lst.findIndex((a) => a.id === audio.id)
        if (idx >= 0 && idx < lst.length - 1) {
          const next = lst[idx + 1]
          // Load next track
          audioRef.current?.pause()
          const nextEl = new Audio(`/api/audio/${next.id}/stream`)
          nextEl.volume = volume
          nextEl.addEventListener('loadedmetadata', () => setDuration(nextEl.duration))
          nextEl.addEventListener('timeupdate', () => setProgress(nextEl.currentTime))
          nextEl.addEventListener('ended', onEnded)
          nextEl.addEventListener('pause', () => setIsPlaying(false))
          nextEl.addEventListener('play', () => setIsPlaying(true))
          audioRef.current = nextEl
          setCurrent(next)
          setProgress(0)
          setDuration(0)
          nextEl.play().catch(() => {})
          return
        }
      }
      setIsPlaying(false)
    }

    el.addEventListener('loadedmetadata', () => setDuration(el.duration))
    el.addEventListener('timeupdate', () => setProgress(el.currentTime))
    el.addEventListener('ended', onEnded)
    el.addEventListener('pause', () => setIsPlaying(false))
    el.addEventListener('play', () => setIsPlaying(true))

    audioRef.current = el
    setCurrent(audio)
    setProgress(0)
    setDuration(0)
    el.play().catch(() => {})
  }, [volume])

  const togglePlayMode = useCallback(() => {
    const next = playMode === 'sequential' ? 'loop' : 'sequential'
    setPlayMode(next)
    playModeRef.current = next
  }, [playMode])

  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const toggle = useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const seek = useCallback((sec) => {
    if (audioRef.current) {
      audioRef.current.currentTime = sec
      setProgress(sec)
    }
  }, [])

  const changeVolume = useCallback((v) => {
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setCurrent(null)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setPlaylist([])
    playlistRef.current = []
  }, [])

  return (
    <AudioContext.Provider value={{
      current, isPlaying, progress, duration, volume, playMode, playlist,
      load, play, pause, toggle, seek, changeVolume, stop, togglePlayMode, playNext,
    }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  const ctx = useContext(AudioContext)
  if (!ctx) throw new Error('useAudio must be inside AudioProvider')
  return ctx
}
