import { NavLink, useNavigate } from 'react-router-dom'
import { 
  Music, 
  Search, 
  Library, 
  ListMusic, 
  Home,
  Settings,
  Plus,
  LogOut,
  User,
  MessageCircle,
  Sparkles,
  X
} from 'lucide-react'
import { useAuthStore } from '../store'
import { createPlaylist } from '../api'

function Sidebar({ onOpenSettings, mobileOpen, onMobileClose }) {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  const handleCreatePlaylist = async () => {
    const name = prompt('Enter a name for your new playlist:')
    if (!name || !name.trim()) return
    try {
      const res = await createPlaylist(name.trim())
      const playlistId = res.data.playlistId || res.data.id
      if (playlistId) {
        navigate(`/playlist/${playlistId}`)
      }
    } catch (err) {
      console.error('Failed to create playlist:', err)
      alert('Failed to create playlist. Make sure the backend is running.')
    }
  }
  
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">
            <Music />
          </div>
          <span className="logo-text">Soundscape</span>
        </div>
        <button 
          className="mobile-sidebar-close"
          onClick={onMobileClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>
      
      <nav className="nav-section">
        <div className="nav-section-title">Menu</div>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onMobileClose}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onMobileClose}>
          <Search size={20} />
          <span>Search</span>
        </NavLink>
        <NavLink to="/recommendations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onMobileClose}>
          <Sparkles size={20} />
          <span>For You</span>
        </NavLink>
        <NavLink to="/chat" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={onMobileClose}>
          <MessageCircle size={20} />
          <span>Chat</span>
        </NavLink>
      </nav>
      
      {isAuthenticated ? (
        <>
          <nav className="nav-section">
            <div className="nav-section-title">Library</div>
            <NavLink to="/library" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Library size={20} />
              <span>Your Library</span>
            </NavLink>
            <NavLink to="/playlists" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <ListMusic size={20} />
              <span>Playlists</span>
            </NavLink>
          </nav>
          
          <nav className="nav-section">
            <div className="nav-section-title">Create</div>
            <button 
              className="nav-link" 
              onClick={handleCreatePlaylist}
              style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          </nav>
        </>
      ) : null}
      
      <div style={{ flex: 1 }} />
      
      {isAuthenticated && (
        <div className="user-section">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
      
      <nav className="nav-section" style={{ marginTop: isAuthenticated ? 0 : 'auto' }}>
        <button 
          className="nav-link" 
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}
          onClick={onOpenSettings}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar