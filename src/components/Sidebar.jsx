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
  User
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store'

function Sidebar({ onOpenSettings }) {
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState([])
  const { user, isAuthenticated, logout } = useAuthStore()
  
  const handleLogout = () => {
    logout()
    navigate('/')
  }
  
  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <Music />
        </div>
        <span className="logo-text">Soundscape</span>
      </div>
      
      <nav className="nav-section">
        <div className="nav-section-title">Menu</div>
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/search" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <Search size={20} />
          <span>Search</span>
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
              onClick={() => alert('Create playlist feature coming soon!')}
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