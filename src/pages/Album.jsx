import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAlbum, extractTrackInfo } from '../api'
import { usePlayerStore } from '../store'
import { Play, Pause, Disc, Music } from 'lucide-react'

function Album() {
  const { id } = useParams()
  const [album, setAlbum] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playTrack, currentTrack, isPlaying } = usePlayerStore()
  
  useEffect(() => {
    loadAlbum()
  }, [id])
  
  const loadAlbum = async () => {
    setLoading(true)
    try {
      const res = await getAlbum(id)
      setAlbum(res.data.album)
    } catch (error) {
      console.error('Failed to load album:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePlayTrack = (track, allTracks) => {
    playTrack(track, allTracks)
  }
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }
  
  if (!album) {
    return (
      <div className="empty-state">
        <Disc className="empty-state-icon" />
        <h3 className="empty-state-title">Album not found</h3>
        <p className="empty-state-text">This album may not exist</p>
      </div>
    )
  }
  
  const tracks = (album.tracks || []).map(t => extractTrackInfo(t)).filter(Boolean)
  
  const isTrackPlaying = (track) => {
    return currentTrack?.videoId === track.videoId && isPlaying
  }
  
  // Calculate total duration
  const totalDuration = tracks.reduce((acc, track) => {
    if (track.duration && typeof track.duration === 'string') {
      const parts = track.duration.split(':')
      if (parts.length === 2) {
        return acc + parseInt(parts[0]) * 60 + parseInt(parts[1])
      }
    }
    return acc
  }, 0)
  
  const formatTotalDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return hours > 0 ? `${hours} hr ${mins} min` : `${mins} min`
  }
  
  return (
    <div>
      {/* Album Header */}
      <div className="album-header">
        <div className="album-image">
          <img 
            src={album.thumbnail?.thumbnails?.[0]?.url || album.thumbnail} 
            alt={album.title}
            loading="lazy"
          />
        </div>
        <div className="album-info">
          <div className="album-type">Album</div>
          <h1 className="album-title">{album.title}</h1>
          <Link 
            to={`/artist/${album.artist?.id}`} 
            className="album-artist"
            style={{ display: 'inline-block' }}
          >
            {album.artist?.name || album.artist || 'Unknown Artist'}
          </Link>
          <div className="album-meta">
            {album.year} • {tracks.length} songs, {formatTotalDuration(totalDuration)}
          </div>
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <button 
              className="btn btn-primary"
              onClick={() => handlePlayTrack(tracks[0], tracks)}
            >
              <Play size={20} />
              Play
            </button>
          </div>
        </div>
      </div>
      
      {/* Track List */}
      <ul className="track-list">
        <li className="track-item" style={{ 
          borderBottom: '1px solid var(--border)', 
          paddingBottom: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <span className="track-number">#</span>
          <span className="track-info" style={{ color: 'var(--text-muted)', fontSize: 13 }}>TITLE</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>DURATION</span>
        </li>
        
        {tracks.map((track, index) => (
          <li 
            key={index}
            className="track-item"
            onClick={() => handlePlayTrack(track, tracks)}
            style={{ 
              background: currentTrack?.videoId === track.videoId ? 'var(--surface-container)' : 'transparent'
            }}
          >
            <span className="track-number">
              {isTrackPlaying(track) ? (
                <Pause size={16} />
              ) : (
                index + 1
              )}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div className="track-info">
                <span 
                  className="track-title"
                  style={{ 
                    color: currentTrack?.videoId === track.videoId ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  {track.title}
                </span>
              </div>
            </div>
            <span className="track-duration">
              {track.duration || '0:00'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Album