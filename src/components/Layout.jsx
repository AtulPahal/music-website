import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Player from './Player'
import Settings from './Settings'
import { Menu, X } from 'lucide-react'

function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      
      <div className="app-container">
        <Sidebar 
          onOpenSettings={() => {
            setSettingsOpen(true)
            setMobileSidebarOpen(false)
          }}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />
        
        {/* Mobile hamburger button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          aria-label={mobileSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <main className="main-content" id="main-content">
          <Outlet />
        </main>
      </div>
      <Player />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

export default Layout