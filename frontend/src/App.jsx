import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AudioProvider } from './context/AudioContext'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/layout/NavBar'
import AudioPlayer from './components/audio/AudioPlayer'
import HomePage from './pages/HomePage'
import AudioListPage from './pages/AudioListPage'
import AudioDetailPage from './pages/AudioDetailPage'
import PostListPage from './pages/PostListPage'
import PostDetailPage from './pages/PostDetailPage'
import UploadPage from './pages/UploadPage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'rgba(255,255,255,0.75)',
              color: '#2d1f2a',
              border: '1px solid rgba(255,255,255,0.5)',
              backdropFilter: 'blur(16px)',
            },
          }}
        />
        <div className="min-h-[100dvh] text-murmur-text font-sans pb-24 relative">
          <div className="relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/audio" element={<AudioListPage />} />
              <Route path="/audio/:id" element={<AudioDetailPage />} />
              <Route path="/posts" element={<PostListPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </div>
          <AudioPlayer />
          <NavBar />
        </div>
      </AudioProvider>
    </AuthProvider>
  )
}
