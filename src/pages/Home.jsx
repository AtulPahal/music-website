import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCharts, getMoods, getMoodPlaylists, getRecommendations, extractTrackInfo, search } from '../api'
import { usePlayerStore } from '../store'
import { Play, Heart, MoreHorizontal, TrendingUp, Music, Search, Sparkles } from 'lucide-react'

function Home() {
  const [charts, setCharts] = useState([])
  const [moods, setMoods] = useState([])
  const [moodPlaylists, setMoodPlaylists] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMood, setSelectedMood] = useState(null)
  const [error, setError] = useState(null)
  const { playTrack, setTrack } = usePlayerStore()
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    try {
      setError(null)
      
      // Try to get charts and moods (requires YouTube Music auth)
      try {
        const [chartsRes, moodsRes] = await Promise.all([
          getCharts('US'),
          getMoods()
        ])
        setCharts(chartsRes.data.charts || [])
        setMoods(moodsRes.data.moods || [])
      } catch (ytError) {
        console.log('YouTube Music auth required for charts/moods')
        // Don't show error - fall back to recommendations
      }
      
      // Always try to get recommendations (works with just app auth)
      try {
        const recoRes = await getRecommendations(20)
        const recoData = recoRes.data?.recommendations || recoRes.data || []
        setRecommendations(Array.isArray(recoData) ? recoData : [])
      } catch (recoError) {
        console.log('Recommendations unavailable:', recoError)
      }
      
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Failed to load content')
    } finally {
      setLoading(false)
    }
  }
  
  const handleMoodClick = async (moodId) => {
    setSelectedMood(moodId)
    try {
      const res = await getMoodPlaylists(moodId)
      setMoodPlaylists(res.data.playlists || [])
    } catch (error) {
      console.error('Failed to load mood playlists:', error)
    }
  }
  
  const handlePlayTrack = (track, tracks) => {
    playTrack(track, tracks)
  }
  
  const handleSearchExample = async (query) => {
    try {
      const res = await search(query, 'songs', 5)
      const tracks = res.data.results?.map(extractTrackInfo).filter(Boolean) || []
      if (tracks.length > 0) {
        playTrack(tracks[0], tracks)
      }
    } catch (err) {
      console.error('Search failed:', err)
    }
  }
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }
  
  // Check if there's any content to display
  const hasContent = charts?.length > 0 || moods?.length > 0 || recommendations?.length > 0
  
  return (
    <div>
      <header className="header">
        <h1 style={{ fontSize: 32 }}>Discover</h1>
      </header>
      
      {/* Quick Search Examples */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">
            <Search size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Quick Search
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {['Pop hits', 'Rock classics', 'Lo-fi beats', 'Jazz', 'Classical'].map((genre, index) => (
            <button
              key={index}
              className="btn btn-ghost"
              onClick={() => handleSearchExample(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      </section>
      
      {/* Charts Section - Only shows if YouTube Music auth is available */}
      {charts.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              <TrendingUp size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Top Charts
            </h2>
          </div>
          
          <div className="grid grid-4">
            {charts.slice(0, 4).map((chart, index) => (
              <div key={index} className="card">
                <div className="card-image">
                  {chart.items?.[0]?.thumbnail ? (
                    <img 
                      src={chart.items[0].thumbnail.thumbnails?.[0]?.url} 
                      alt={chart.title}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Music size={48} style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>
                <div className="card-content">
                  <div className="card-title">{chart.title}</div>
                  <div className="card-subtitle">
                    {chart.items?.slice(0, 3).map(item => item.title).join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {/* Moods Section - Only shows if YouTube Music auth is available */}
      {moods.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Mood</h2>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
            {moods.map((mood, index) => (
              <button
                key={index}
                className={`btn ${selectedMood === mood.params ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleMoodClick(mood.params)}
              >
                {mood.title}
              </button>
            ))}
          </div>
          
          {moodPlaylists.length > 0 && (
            <div className="grid grid-4">
              {moodPlaylists.map((playlist, index) => (
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
          )}
        </section>
      )}
      
      {/* Recommendations Section - shows even without YouTube Music auth */}
      {recommendations.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">
              <Sparkles size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Recommended for You
            </h2>
          </div>
          
          <ul className="track-list">
            {recommendations.slice(0, 10).map((item, index) => {
              const track = extractTrackInfo(item)
              if (!track) return null
              return (
                <li 
                  key={index}
                  className="track-item"
                  onClick={() => playTrack(track, recommendations.map(r => extractTrackInfo(r)).filter(Boolean))}
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
                    <span className="track-artist">{track.artist}</span>
                  </div>
                  <button 
                    className="player-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      playTrack(track, recommendations.map(r => extractTrackInfo(r)).filter(Boolean))
                    }}
                    aria-label="Play track"
                  >
                    <Play size={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}
      
      {/* If no content at all */}
      {!hasContent && recommendations.length === 0 && (
        <div className="empty-state">
          <Music className="empty-state-icon" />
          <h3 className="empty-state-title">Welcome to Soundscape!</h3>
          <p className="empty-state-text">
            Start by searching for your favorite songs or artists.
          </p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: 'var(--spacing-lg)' }}>
            Search for Music
          </Link>
        </div>
      )}
    </div>
  )
}

export default Home