import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getArtist, getArtistAlbums, extractTrackInfo } from '../api'
import { usePlayerStore } from '../store'
import { Play, User, Disc, Music } from 'lucide-react'

function Artist() {
  const { id } = useParams()
  const [artist, setArtist] = useState(null)
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const { playTrack } = usePlayerStore()
  
  useEffect(() => {
    loadArtist()
  }, [id])
  
  const loadArtist = async () => {
    setLoading(true)
    try {
      const [artistRes, albumsRes] = await Promise.all([
        getArtist(id),
        getArtistAlbums(id, 20)
      ])
      setArtist(artistRes.data.artist)
      setAlbums(albumsRes.data.albums || [])
    } catch (error) {
      console.error('Failed to load artist:', error)
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
  
  if (!artist) {
    return (
      <div className="empty-state">
        <User className="empty-state-icon" />
        <h3 className="empty-state-title">Artist not found</h3>
        <p className="empty-state-text">This artist may not exist</p>
      </div>
    )
  }
  
  // Get featured tracks from artist's albums
  const featuredTracks = []
  albums.slice(0, 3).forEach(album => {
    if (album.tracks) {
      album.tracks.slice(0, 2).forEach(track => {
        if (track.videoId) {
          featuredTracks.push(extractTrackInfo(track))
        }
      })
    }
  })
  
  return (
    <div>
      {/* Artist Header */}
      <div className="artist-header">
        <div className="artist-image">
          <img 
            src={artist.thumbnail?.thumbnails?.[0]?.url || artist.banner?.thumbnails?.[0]?.url || artist.avatar?.thumbnails?.[0]?.url} 
            alt={artist.name}
            loading="lazy"
          />
        </div>
        <div className="artist-info">
          <div style={{ 
            fontFamily: 'var(--font-ui)', 
            fontSize: 12, 
            textTransform: 'uppercase', 
            letterSpacing: '0.1em',
            marginBottom: 'var(--spacing-xs)'
          }}>
            Artist
          </div>
          <h1 className="artist-name">{artist.name}</h1>
          <div className="artist-meta">
            {artist.subscribers && `${artist.subscribers} subscribers`}
          </div>
        </div>
      </div>
      
      {/* Featured Tracks */}
      {featuredTracks.length > 0 && (
        <section className="section">
          <h2 className="section-title mb-lg">Popular</h2>
          <ul className="track-list">
            {featuredTracks.slice(0, 5).map((track, index) => (
              <li 
                key={index}
                className="track-item"
                onClick={() => handlePlayTrack(track, featuredTracks)}
              >
                <span className="track-number">{index + 1}</span>
                <div className="card-image" style={{ 
                  width: 48, 
                  height: 48, 
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
                  <span className="track-title">{track.title}</span>
                  <span className="track-artist">{track.album}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
      
      {/* Albums */}
      {albums.length > 0 && (
        <section className="section">
          <h2 className="section-title mb-lg">Albums</h2>
          <div className="grid grid-4">
            {albums.map((album, index) => (
              <Link 
                to={`/album/${album.browseId}`} 
                key={index}
                className="card"
              >
                <div className="card-image">
                  <img 
                    src={album.thumbnail?.thumbnails?.[0]?.url || album.thumbnail} 
                    alt={album.title}
                    loading="lazy"
                  />
                </div>
                <div className="card-content">
                  <div className="card-title">{album.title}</div>
                  <div className="card-subtitle">
                    {album.year || 'Unknown year'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Artist