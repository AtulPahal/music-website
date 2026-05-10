import { useState } from 'react'
import { useAuthStore } from '../store'
import { 
  User, Music, Bell, Shield, Palette, 
  LogOut, Settings as SettingsIcon,
  ChevronRight, Moon, Sun, Volume2
} from 'lucide-react'
import { logout } from '../api'

function Settings({ isOpen, onClose }) {
  const { user, isAuthenticated, logout: authLogout } = useAuthStore()
  const [activeSection, setActiveSection] = useState('profile')
  
  const handleLogout = () => {
    authLogout()
    logout()
    onClose()
  }
  
  if (!isOpen) return null
  
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="btn-icon" onClick={onClose}>
          <ChevronRight size={24} />
        </button>
      </div>
      
      <div className="settings-content">
        {/* User Profile Section */}
        <div className="settings-section">
          <h3>Account</h3>
          
          {isAuthenticated ? (
            <>
              <div className="settings-item">
                <div className="settings-item-left">
                  <div className="settings-item-icon">
                    <User size={20} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title">{user?.name || 'User'}</span>
                    <span className="settings-item-subtitle">{user?.email}</span>
                  </div>
                </div>
                <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 12 }}>
                  Edit
                </button>
              </div>
              
              <button 
                className="settings-item" 
                onClick={handleLogout}
                style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="settings-item-left">
                  <div className="settings-item-icon" style={{ background: 'var(--error-container)', color: 'var(--error)' }}>
                    <LogOut size={20} />
                  </div>
                  <div className="settings-item-text">
                    <span className="settings-item-title" style={{ color: 'var(--error)' }}>Sign Out</span>
                    <span className="settings-item-subtitle">Sign out of your account</span>
                  </div>
                </div>
              </button>
            </>
          ) : (
            <div className="settings-item">
              <div className="settings-item-left">
                <div className="settings-item-icon">
                  <User size={20} />
                </div>
                <div className="settings-item-text">
                  <span className="settings-item-title">Sign In</span>
                  <span className="settings-item-subtitle">Login to access your account</span>
                </div>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
        
        {/* YouTube Music Section */}
        <div className="settings-section">
          <h3>YouTube Music</h3>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-icon">
                <Music size={20} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Connect YouTube Music</span>
                <span className="settings-item-subtitle">Enable charts and recommendations</span>
              </div>
            </div>
            <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
          </div>
        </div>
        
        {/* Playback Section */}
        <div className="settings-section">
          <h3>Playback</h3>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-icon">
                <Volume2 size={20} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Audio Quality</span>
                <span className="settings-item-subtitle">High quality streaming</span>
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>High</span>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-icon">
                <Shield size={20} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Explicit Content</span>
                <span className="settings-item-subtitle">Allow explicit songs</span>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {/* Appearance Section */}
        <div className="settings-section">
          <h3>Appearance</h3>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-icon">
                <Palette size={20} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Theme</span>
                <span className="settings-item-subtitle">Dark forest theme</span>
              </div>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Dark</span>
          </div>
        </div>
        
        {/* Notifications Section */}
        <div className="settings-section">
          <h3>Notifications</h3>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-icon">
                <Bell size={20} />
              </div>
              <div className="settings-item-text">
                <span className="settings-item-title">Push Notifications</span>
                <span className="settings-item-subtitle">New music releases</span>
              </div>
            </div>
            <label className="toggle">
              <input type="checkbox" />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        
        {/* About Section */}
        <div className="settings-section">
          <h3>About</h3>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-text">
                <span className="settings-item-title">Version</span>
                <span className="settings-item-subtitle">1.0.0</span>
              </div>
            </div>
          </div>
          
          <div className="settings-item">
            <div className="settings-item-left">
              <div className="settings-item-text">
                <span className="settings-item-title">Made with ❤️</span>
                <span className="settings-item-subtitle">Soundscape Music App</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings