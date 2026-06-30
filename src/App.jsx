import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { useAuthStore } from './store'
import Layout from './components/Layout'

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('./pages/Home'))
const Search = lazy(() => import('./pages/Search'))
const Library = lazy(() => import('./pages/Library'))
const Playlists = lazy(() => import('./pages/Playlists'))
const PlaylistDetail = lazy(() => import('./pages/PlaylistDetail'))
const Artist = lazy(() => import('./pages/Artist'))
const Album = lazy(() => import('./pages/Album'))
const Chat = lazy(() => import('./pages/Chat'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))

// Loading fallback for lazy-loaded routes
function PageLoading() {
  return (
    <div className="loading" style={{ minHeight: '50vh' }}>
      <div className="spinner"></div>
    </div>
  )
}


// Protected Route component
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route component - only accessible when NOT logged in
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  const [loading, setLoading] = useState(true)
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  useEffect(() => {
    // Initialize auth from localStorage
    initializeAuth()
    setLoading(false)
  }, [])
  
  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    )
  }
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - only accessible when NOT logged in */}
        <Route path="/login" element={<PublicRoute><Suspense fallback={<PageLoading />}><Login /></Suspense></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Suspense fallback={<PageLoading />}><Signup /></Suspense></PublicRoute>} />
        
        {/* Protected routes - require authentication */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Suspense fallback={<PageLoading />}><Home /></Suspense>} />
          <Route path="search" element={<Suspense fallback={<PageLoading />}><Search /></Suspense>} />
          <Route path="recommendations" element={<Suspense fallback={<PageLoading />}><Recommendations /></Suspense>} />
          <Route path="chat" element={<Suspense fallback={<PageLoading />}><Chat /></Suspense>} />
          <Route path="library" element={<Suspense fallback={<PageLoading />}><Library /></Suspense>} />
          <Route path="playlists" element={<Suspense fallback={<PageLoading />}><Playlists /></Suspense>} />
          <Route path="playlist/:id" element={<Suspense fallback={<PageLoading />}><PlaylistDetail /></Suspense>} />
          <Route path="artist/:id" element={<Suspense fallback={<PageLoading />}><Artist /></Suspense>} />
          <Route path="album/:id" element={<Suspense fallback={<PageLoading />}><Album /></Suspense>} />
        </Route>
        
        {/* Catch all - redirect to login if not authenticated, else home */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App