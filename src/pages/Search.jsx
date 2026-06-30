import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { search, extractTrackInfo } from '../api'
import { usePlayerStore } from '../store'
import { Search as SearchIcon, Play, Disc, User, ListMusic, Video, AlertCircle } from 'lucide-react'

function Search() {
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get('query') || ''
  const navigate = useNavigate()
  const [query, setQuery] = useState(urlQuery || '')
  const [results, setResults] = useState(null)
  const [filter, setFilter] = useState('songs')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { playTrack } = usePlayerStore()
  
  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery)
      performSearch(urlQuery, filter)
    }
  }, [urlQuery, filter])
  
  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      // Update URL for bookmarking but don't reload - stay on same page
      navigate(`/search?query=${encodeURIComponent(query)}`, { replace: true })
      performSearch(query, filter)
    }
  }
  
  const performSearch = async (searchQuery, searchFilter) => {
    if (!searchQuery) return
    
    setLoading(true)
    setError(null)
    // Don't clear results immediately to avoid flashing
    
    try {
      console.log('Searching for:', searchQuery, 'with filter:', searchFilter)
      const res = await search(searchQuery, searchFilter, 20)
      console.log('Search results:', res.data)
      
      if (res.data && res.data.results) {
        setResults(res.data.results)
      } else {
        setResults([])
      }
    } catch (err) {
      console.error('Search failed:', err)
      setError(err.response?.data?.detail || err.message || 'Search failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }
  
  const handlePlayTrack = (track, allTracks) => {
    // Prevent event bubbling to avoid any navigation
    event?.stopPropagation()
    playTrack(track, allTracks)
  }
  
  const getIcon = (f) => {
    switch (f) {
      case 'songs': return <Disc size={16} />
      case 'albums': return <Disc size={16} />
      case 'artists': return <User size={16} />
      case 'playlists': return <ListMusic size={16} />
      case 'videos': return <Video size={16} />
      default: return <Disc size={16} />
    }
  }
  
  return (
    <div>
      <header className="header">
        <h1 style={{ fontSize: 32 }}>Search</h1>
      </header>
      
      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div className="search-container">
          <div className="search-wrapper">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search for songs, artists, albums..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </form>
      
      {/* Error Display */}
      {error && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--spacing-sm)',
          padding: 'var(--spacing-md)',
          background: 'var(--error-container)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-lg)',
          color: 'var(--on-error-container)'
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}
      
      {/* Filter Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border)',
        paddingBottom: 'var(--spacing-md)'
      }}>
        {['songs', 'albums', 'artists', 'playlists', 'videos'].map((f) => (
          <button
            key={f}
            className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setFilter(f)
              if (query) performSearch(query, f)
            }}
          >
            {getIcon(f)}
            <span style={{ marginLeft: 4 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</span>
          </button>
        ))}
      </div>
      
      {/* Results */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="empty-state">
          <AlertCircle className="empty-state-icon" />
          <h3 className="empty-state-title">Search Error</h3>
          <p className="empty-state-text">{error}</p>
        </div>
      ) : results ? (
        <div>
          <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>
            Results for "{query}" ({results.length} found)
          </h3>
          
          {results.length === 0 ? (
            <div className="empty-state">
              <SearchIcon className="empty-state-icon" />
              <h3 className="empty-state-title">No results found</h3>
              <p className="empty-state-text">Try different keywords or filters</p>
            </div>
          ) : (
            filter === 'songs' ? (
              <ul className="track-list">
                {results.map((item, index) => {
                  const track = extractTrackInfo(item)
                  if (!track) return null
                  return (
                    <li 
                      key={index}
                      className="track-item"
                      onClick={(e) => handlePlayTrack(track, results.map(r => extractTrackInfo(r)).filter(Boolean), e)}
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
                          src={track.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} 
                          alt={track.title}
                          loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div className="track-info">
                        <span className="track-title">{track.title || item.title}</span>
                        <span className="track-artist">{track.artist || item.artist || 'Unknown'}</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : filter === 'albums' ? (
              <div className="grid grid-4">
                {results.map((item, index) => (
                  <div key={index} className="card">
                    <div className="card-image">
                      <img 
                        src={item.thumbnail?.thumbnails?.[0]?.url || item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} 
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-content">
                      <div className="card-title">{item.title}</div>
                      <div className="card-subtitle">
                        {item.artists?.map(a => a.name).join(', ') || item.artist || 'Unknown'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filter === 'artists' ? (
              <div className="grid grid-4">
                {results.map((item, index) => (
                  <div key={index} className="card" style={{ textAlign: 'center' }}>
                    <div className="card-image" style={{ borderRadius: '50%' }}>
                      <img 
                        src={item.thumbnail?.thumbnails?.[0]?.url || item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} 
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-content">
                      <div className="card-title">{item.title}</div>
                      <div className="card-subtitle">Artist</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-4">
                {results.map((item, index) => (
                  <div key={index} className="card">
                    <div className="card-image">
                      <img 
                        src={item.thumbnail?.thumbnails?.[0]?.url || item.thumbnail || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`} 
                        alt={item.title}
                        loading="lazy"
                      />
                    </div>
                    <div className="card-content">
                      <div className="card-title">{item.title}</div>
                      <div className="card-subtitle">
                        {item.subtitle || item.artist || 'Playlist'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      ) : (
        <div className="empty-state">
          <SearchIcon className="empty-state-icon" />
          <h3 className="empty-state-title">Search for music</h3>
          <p className="empty-state-text">Find your favorite songs, artists, and albums</p>
        </div>
      )}
    </div>
  )
}

export default Search