import { useState, useEffect } from 'react'
import { getForYou, getRecommendations } from '../api'
import { usePlayerStore, useAuthStore } from '../store'
import { Music, Play, Heart, RefreshCw, Loader } from 'lucide-react'

function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { playTrack } = usePlayerStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  useEffect(() => {
    loadRecommendations()
  }, [])
  
  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try to get personalized recommendations first
      if (isAuthenticated) {
        const response = await getForYou(20)
        setRecommendations(response.data.recommendations || [])
      } else {
        // If not logged in, get general recommendations
        const response = await getRecommendations(20)
        setRecommendations(response.data.recommendations || [])
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePlayTrack = (track) => {
    playTrack(track, recommendations)
  }
  
  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '50vh' }}>
        <Loader className="spinner" size={40} />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="empty-state">
        <Music className="empty-state-icon" />
        <h3 className="empty-state-title">Oops!</h3>
        <p className="empty-state-text">{error}</p>
        <button className="btn btn-primary" onClick={loadRecommendations}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    )
  }
  
  return (
    <div>
      <header className="header">
        <h1 style={{ fontSize: 32 }}>For You</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-sm)' }}>
          Personalized recommendations based on your taste
        </p>
      </header>
      
      {!isAuthenticated && (
        <div style={{ 
          background: 'var(--surface-container)', 
          padding: 'var(--spacing-lg)', 
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Sign in to get personalized recommendations based on your liked songs and listening history!
          </p>
        </div>
      )}
      
      {recommendations.length === 0 ? (
        <div className="empty-state">
          <Music className="empty-state-icon" />
          <h3 className="empty-state-title">No Recommendations Yet</h3>
          <p className="empty-state-text">
            Like some songs to get better recommendations!
          </p>
        </div>
      ) : (
        <>
          <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>
            Recommended for You ({recommendations.length} songs)
          </h2>
          
          <ul className="track-list">
            {recommendations.map((item, index) => (
              <li 
                key={item.video_id || index}
                className="track-item"
                onClick={() => handlePlayTrack({
                  videoId: item.video_id,
                  title: item.title,
                  artist: item.artist,
                  thumbnail: item.thumbnail
                })}
              >
                <span className="track-number">{index + 1}</span>
                <div className="card-image" style={{ 
                  width: 48, 
                  height: 48, 
                  marginRight: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-sm)',
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      background: 'var(--surface-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Music size={20} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>
                <div className="track-info">
                  <span className="track-title">{item.title}</span>
                  <span className="track-artist">{item.artist || 'Unknown Artist'}</span>
                  {item.reason && (
                    <span className="track-reason" style={{ 
                      fontSize: 11, 
                      color: 'var(--accent)',
                      fontFamily: 'var(--font-ui)'
                    }}>
                      {item.reason}
                    </span>
                  )}
                </div>
                <button 
                  className="btn-icon"
                  style={{ marginLeft: 'auto' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Add to liked songs
                  }}
                >
                  <Heart size={18} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default Recommendations