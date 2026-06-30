import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLibraryPlaylists, createPlaylist } from '../api'
import { ListMusic, Plus } from 'lucide-react'

function Playlists() {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadPlaylists()
  }, [])
  
  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const res = await getLibraryPlaylists(50)
      setPlaylists(res.data.playlists || [])
    } catch (error) {
      console.error('Failed to load playlists:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleCreatePlaylist = async () => {
    const name = prompt('Enter a name for your new playlist:')
    if (!name || !name.trim()) return
    
    try {
      const res = await createPlaylist(name.trim())
      const playlistId = res.data.playlistId || res.data.id
      if (playlistId) {
        navigate(`/playlist/${playlistId}`)
      } else {
        // Reload the list if we can't navigate directly
        loadPlaylists()
      }
    } catch (err) {
      console.error('Failed to create playlist:', err)
      alert('Failed to create playlist. Make sure the backend is running.')
    }
  }
  
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
        <h1 style={{ fontSize: 32 }}>Playlists</h1>
      </header>
      
      {/* Create Playlist Button */}
      <button 
        className="btn btn-primary"
        onClick={handleCreatePlaylist}
        style={{ marginBottom: 'var(--spacing-xl)' }}
      >
        <Plus size={18} />
        Create Playlist
      </button>
      
      {/* Your Playlists */}
      {playlists.length > 0 ? (
        <section className="section">
          <h2 className="section-title mb-lg">Your Playlists</h2>
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
                    loading="lazy"
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
        </section>
      ) : (
        <div className="empty-state">
          <ListMusic className="empty-state-icon" />
          <h3 className="empty-state-title">No playlists yet</h3>
          <p className="empty-state-text">Create your first playlist to organize your music</p>
          <button className="btn btn-primary mt-lg" onClick={handleCreatePlaylist}>
            <Plus size={18} />
            Create Playlist
          </button>
        </div>
      )}
    </div>
  )
}

export default Playlists