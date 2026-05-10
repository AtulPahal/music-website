import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Player from './Player'
import Settings from './Settings'

function Layout() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  return (
    <>
      <div className="app-container">
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Player />
      <Settings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}

export default Layout