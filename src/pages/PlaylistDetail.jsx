import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPlaylist, extractTrackInfo, formatDuration } from '../api'
import { usePlayerStore } from '../store'
import { Play, Pause, Heart, MoreHorizontal, Clock, ListMusic } from 'lucide-react'

function PlaylistDetail() {
  const { id } = useParams()
  const [playlist, setPlaylist] = useState(null)
  const [loading, setLoading] = useState(true)
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayerStore()
  
  useEffect(() => {
    loadPlaylist()
  }, [id])
  
  const loadPlaylist = async () => {
    setLoading(true)
    try {
      const res = await getPlaylist(id, 100)
      setPlaylist(res.data.playlist)
    } catch (error) {
      console.error('Failed to load playlist:', error)
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
  
  if (!playlist) {
    return (
      <div className="empty-state">
        <ListMusic className="empty-state-icon" />
        <h3 className="empty-state-title">Playlist not found</h3>
        <p className="empty-state-text">This playlist may not exist or is private</p>
      </div>
    )
  }
  
  const tracks = playlist.tracks || []
  const tracksWithInfo = tracks.map(t => extractTrackInfo(t)).filter(Boolean)
  
  const isCurrentTrackPlaying = (track) => {
    return currentTrack?.videoId === track.videoId && isPlaying
  }
  
  return (
    <div>
      {/* Playlist Header */}
      <div className="album-header" style={{ marginBottom: 'var(--spacing-xxl)' }}>
        <div className="album-image" style={{ width: 220, height: 220 }}>
          <img 
            src={playlist.thumbnail?.thumbnails?.[0]?.url || playlist.thumbnail} 
            alt={playlist.title}
            loading="lazy"
          />
        </div>
        <div className="album-info">
          <div className="album-type">Playlist</div>
          <h1 className="album-title" style={{ fontSize: 40 }}>{playlist.title}</h1>
          <div className="album-meta">
            {tracks.length} songs • {playlist.duration || 'Unknown duration'}
          </div>
          <div style={{ marginTop: 'var(--spacing-lg)' }}>
            <button 
              className="btn btn-primary"
              onClick={() => handlePlayTrack(tracksWithInfo[0], tracksWithInfo)}
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
          <Clock size={16} style={{ color: 'var(--text-muted)' }} />
        </li>
        
        {tracksWithInfo.map((track, index) => (
          <li 
            key={index}
            className="track-item"
            onClick={() => handlePlayTrack(track, tracksWithInfo)}
            style={{ 
              background: currentTrack?.videoId === track.videoId ? 'var(--surface-container)' : 'transparent'
            }}
          >
            <span className="track-number">
              {isCurrentTrackPlaying(track) ? (
                <Pause size={16} />
              ) : (
                index + 1
              )}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              <div className="card-image" style={{ 
                width: 40, 
                height: 40, 
                marginRight: 'var(--spacing-md)',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0
              }}>
                <img 
                  src={track.thumbnail} 
                  alt={track.title}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="track-info">
                <span 
                  className="track-title" 
                  style={{ 
                    color: currentTrack?.videoId === track.videoId ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  {track.title}
                </span>
                <span className="track-artist">{track.artist}</span>
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

export default PlaylistDetail