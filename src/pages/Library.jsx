import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  getLibrarySongs, 
  getLibraryAlbums, 
  getLibraryArtists, 
  getLibraryPlaylists,
  extractTrackInfo 
} from '../api'
import { usePlayerStore } from '../store'
import { Disc, User, ListMusic, Music } from 'lucide-react'

function Library() {
  const [activeTab, setActiveTab] = useState('songs')
  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  const { playTrack } = usePlayerStore()
  
  useEffect(() => {
    loadLibrary()
  }, [])
  
  const loadLibrary = async () => {
    setLoading(true)
    try {
      const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
        getLibrarySongs(50),
        getLibraryAlbums(50),
        getLibraryArtists(50),
        getLibraryPlaylists(50)
      ])
      
      setSongs(songsRes.data.songs || [])
      setAlbums(albumsRes.data.albums || [])
      setArtists(artistsRes.data.artists || [])
      setPlaylists(playlistsRes.data.playlists || [])
    } catch (error) {
      console.error('Failed to load library:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePlayTrack = (track, allTracks) => {
    playTrack(track, allTracks)
  }
  
  const tabs = [
    { id: 'songs', label: 'Songs', icon: <Music size={16} /> },
    { id: 'albums', label: 'Albums', icon: <Disc size={16} /> },
    { id: 'artists', label: 'Artists', icon: <User size={16} /> },
    { id: 'playlists', label: 'Playlists', icon: <ListMusic size={16} /> }
  ]
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }
  
  return (
    <div>
      <header className="header">
        <h1 style={{ fontSize: 32 }}>Your Library</h1>
      </header>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-xl)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--spacing-md)'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span style={{ marginLeft: 4 }}>{tab.label}</span>
          </button>
        ))}
      </div>
      
      {/* Content */}
      {activeTab === 'songs' && (
        songs.length > 0 ? (
          <ul className="track-list">
            {songs.map((item, index) => {
              const track = extractTrackInfo(item)
              return (
                <li 
                  key={index}
                  className="track-item"
                  onClick={() => handlePlayTrack(track, songs.map(s => extractTrackInfo(s)))}
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
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="track-info">
                    <span className="track-title">{track.title}</span>
                    <span className="track-artist">{track.artist}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <div className="empty-state">
            <Music className="empty-state-icon" />
            <h3 className="empty-state-title">No songs in library</h3>
            <p className="empty-state-text">Songs you like will appear here</p>
          </div>
        )
      )}
      
      {activeTab === 'albums' && (
        albums.length > 0 ? (
          <div className="grid grid-4">
            {albums.map((album, index) => (
              <div key={index} className="card">
                <div className="card-image">
                  <img 
                    src={album.thumbnail?.thumbnails?.[0]?.url || album.thumbnail} 
                    alt={album.title}
                  />
                </div>
                <div className="card-content">
                  <div className="card-title">{album.title}</div>
                  <div className="card-subtitle">
                    {album.artist?.name || album.artists?.map(a => a.name).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Disc className="empty-state-icon" />
            <h3 className="empty-state-title">No albums in library</h3>
            <p className="empty-state-text">Albums you like will appear here</p>
          </div>
        )
      )}
      
      {activeTab === 'artists' && (
        artists.length > 0 ? (
          <div className="grid grid-4">
            {artists.map((artist, index) => (
              <div key={index} className="card" style={{ textAlign: 'center' }}>
                <div className="card-image" style={{ borderRadius: '50%' }}>
                  <img 
                    src={artist.thumbnail?.thumbnails?.[0]?.url || artist.thumbnail} 
                    alt={artist.name}
                  />
                </div>
                <div className="card-content">
                  <div className="card-title">{artist.name}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <User className="empty-state-icon" />
            <h3 className="empty-state-title">No artists in library</h3>
            <p className="empty-state-text">Artists you follow will appear here</p>
          </div>
        )
      )}
      
      {activeTab === 'playlists' && (
        playlists.length > 0 ? (
          <div className="grid grid-4">
            {playlists.map((playlist, index) => (
              <Link 
                to={`/playlist/${playlist.playlistId}`} 
                key={index}
                className="card"
              >
                <div className="card-image">
                  <img 
                    src={playlist.thumbnail?.thumbnails?.[0]?.url || playlist.thumbnail} 
                    alt={playlist.title}
                  />
                </div>
                <div className="card-content">
                  <div className="card-title">{playlist.title}</div>
                  <div className="card-subtitle">
                    {playlist.count} tracks
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ListMusic className="empty-state-icon" />
            <h3 className="empty-state-title">No playlists yet</h3>
            <p className="empty-state-text">Create playlists to organize your music</p>
          </div>
        )
      )}
    </div>
  )
}

export default Library