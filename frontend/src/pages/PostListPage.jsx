import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { getPosts } from '../api/client'
import PostCard from '../components/posts/PostCard'
import EmptyState from '../components/shared/EmptyState'
import LoadingSpinner from '../components/shared/LoadingSpinner'

export default function PostListPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPosts(1, 50)
      .then((data) => setPosts(data.items))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-5 md:px-8 pt-12 pb-8">
      <header className="mb-8">
        <p className="text-murmur-text-muted text-[10px] tracking-[0.2em] uppercase mb-1">Journal</p>
        <h1 className="text-2xl font-bold">碎碎念</h1>
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="还没有碎碎念"
          description="写下你的第一段文字"
        />
      ) : (
        <div className="masonry-grid">
          {posts.map((p, i) => (
            <div key={p.id} className="masonry-item">
              <div className="animate-fade-up" style={{ animationDelay: `${i * 0.06}s` }}>
                <PostCard post={p} index={i} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
