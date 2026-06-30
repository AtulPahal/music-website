import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import { usePlayerStore } from '../store'
import { addLikedSong, removeLikedSong, checkLikedSong, getUserPlaylists, addTrackToPlaylist } from '../api'
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Heart, ListMusic,
  ChevronUp, ChevronDown, Shuffle, Repeat,
  Disc3, X, MessageCircle, Send, Check
} from 'lucide-react'

function Player() {
  const store = usePlayerStore()
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay,
    next, 
    previous,
    progress,
    setProgress,
    duration,
    setDuration,
    volume,
    setVolume,
    queue,
    currentIndex,
    shuffle,
    repeat,
    toggleShuffle,
    cycleRepeat,
    setPlayerPaused
  } = store
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showPlaylistPicker, setShowPlaylistPicker] = useState(false)
  const [userPlaylists, setUserPlaylists] = useState([])
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef(null)
  const progressRef = useRef(null)
  
  const [comments, setComments] = useState([
    { id: 1, user: 'Music Fan', text: 'Great song! 🎵', time: '2 hours ago' },
    { id: 2, user: ' listener', text: 'Love this track!', time: '1 day ago' },
  ])
  
  const handlePlayerReady = (event) => {
    playerRef.current = event.target
    setPlayerReady(true)
    event.target.setVolume(volume * 100)
  }
  
  // Sync YouTube player state back to Zustand store
  // YouTube states: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
  const handleStateChange = (event) => {
    const playerState = event.data
    if (playerState === 1) {
      // Playing — ensure isPlaying matches
      if (!store.isPlaying) store.play()
    } else if (playerState === 2) {
      // Paused — ensure isPlaying matches
      if (store.isPlaying) store.pause()
    }
  }
  
  // Handle play/pause
  useEffect(() => {
    if (playerRef.current && playerReady) {
      if (isPlaying) {
        playerRef.current.playVideo()
      } else {
        playerRef.current.pauseVideo()
      }
    }
  }, [isPlaying, playerReady])
  
  // Resilience: if store says isPlaying but YouTube player is paused, resume
  useEffect(() => {
    if (!playerRef.current || !playerReady || !isPlaying || !currentTrack) return
    
    const check = setInterval(() => {
      try {
        const state = playerRef.current?.getPlayerState()
        // YouTube state 2 = paused
        if (state === 2) {
          playerRef.current?.playVideo()
        }
      } catch (e) {
        // Ignore errors during check
      }
    }, 3000)
    
    return () => clearInterval(check)
  }, [playerReady, isPlaying, currentTrack?.videoId])
  
  // Handle volume
  useEffect(() => {
    if (playerRef.current && playerReady) {
      playerRef.current.setVolume(volume * 100)
    }
  }, [volume, playerReady])
  
  // Handle track change
  useEffect(() => {
    if (playerRef.current && playerReady && currentTrack) {
      playerRef.current.loadVideoById(currentTrack.videoId)
      if (isPlaying) {
        playerRef.current.playVideo()
      }
    }
  }, [currentTrack?.videoId])
  
  // Handle video end
  const handleVideoEnd = () => {
    next()
  }
  
  // Handle progress update
  const handleProgress = (event) => {
    if (playerRef.current && playerReady) {
      const currentTime = playerRef.current.getCurrentTime()
      const totalDuration = playerRef.current.getDuration()
      setProgress(currentTime || 0)
      setDuration(totalDuration || 0)
    }
  }
  
  // Update progress every second (only when playing and player is ready)
  useEffect(() => {
    if (!playerReady || !isPlaying || !currentTrack) return
    const interval = setInterval(handleProgress, 1000)
    return () => clearInterval(interval)
  }, [playerReady, isPlaying, currentTrack?.videoId])
  
  // Check if current track is liked
  useEffect(() => {
    if (!currentTrack?.videoId) return
    setIsLiked(false)
    checkLikedSong(currentTrack.videoId)
      .then(res => setIsLiked(res.data.liked))
      .catch(() => setIsLiked(false))
  }, [currentTrack?.videoId])
  
  // Toggle like for current track
  const handleLikeToggle = async () => {
    if (!currentTrack || likeLoading) return
    setLikeLoading(true)
    try {
      if (isLiked) {
        await removeLikedSong(currentTrack.videoId)
        setIsLiked(false)
      } else {
        await addLikedSong({
          videoId: currentTrack.videoId,
          title: currentTrack.title,
          artist: currentTrack.artist,
          thumbnail: currentTrack.thumbnail
        })
        setIsLiked(true)
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
    } finally {
      setLikeLoading(false)
    }
  }
  
  // Open playlist picker and load user playlists
  const handleOpenPlaylistPicker = async () => {
    setShowPlaylistPicker(!showPlaylistPicker)
    if (!showPlaylistPicker) {
      try {
        const res = await getUserPlaylists()
        setUserPlaylists(res.data.playlists || res.data || [])
      } catch (err) {
        console.error('Failed to load playlists:', err)
        setUserPlaylists([])
      }
    }
  }
  
  // Add current track to a playlist
  const handleAddToPlaylist = async (playlistId) => {
    if (!currentTrack) return
    try {
      await addTrackToPlaylist(playlistId, {
        videoId: currentTrack.videoId,
        title: currentTrack.title,
        artist: currentTrack.artist,
        thumbnail: currentTrack.thumbnail
      })
      setShowPlaylistPicker(false)
    } catch (err) {
      console.error('Failed to add to playlist:', err)
    }
  }
  
  const handleProgressClick = (e) => {
    if (playerRef.current && playerReady && duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newTime = percent * duration
      playerRef.current.seekTo(newTime, true)
      setProgress(newTime)
    }
  }
  
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  // Don't render if no track
  if (!currentTrack) {
    return (
      <div className="player player-collapsed" style={{ justifyContent: 'center', padding: '0 var(--spacing-md)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Search for a song and click to play
        </span>
      </div>
    )
  }
  
  return (
    <div className={`player ${isExpanded ? 'player-expanded' : 'player-collapsed'}`}>
      {/* Hidden YouTube Player — visually hidden but still visible to browser */}
      <div style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {currentTrack && (
          <YouTube
            videoId={currentTrack.videoId}
            opts={{
              width: '1',
              height: '1',
              playerVars: {
                autoplay: isPlaying ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
              }
            }}
            onReady={handlePlayerReady}
            onStateChange={handleStateChange}
            onEnd={handleVideoEnd}
          />
        )}
      </div>
      
      {/* Mini Player (Collapsed) */}
      <div className="player-collapsed-content" onClick={() => setIsExpanded(true)}>
        <div className="player-track-info">
          <div className="player-thumbnail">
            <img src={currentTrack.thumbnail} alt={currentTrack.title} />
          </div>
          <div className="player-track-details">
            <span className="player-track-title">{currentTrack.title}</span>
            <span className="player-track-artist">{currentTrack.artist}</span>
          </div>
        </div>
        
        <div className="player-controls-mini" onClick={(e) => e.stopPropagation()}>
          <button className="player-btn" onClick={previous} aria-label="Previous track">
            <SkipBack size={18} />
          </button>
          <button className="player-btn player-btn-main" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="player-btn" onClick={next} aria-label="Next track">
            <SkipForward size={18} />
          </button>
        </div>
        
        <div className="player-progress-mini" onClick={(e) => e.stopPropagation()}>
          <span className="player-time">{formatTime(progress)}</span>
          <div className="progress-bar-mini">
            <div 
              className="progress-fill-mini" 
              style={{ width: `${(progress / duration) * 100 || 0}%` }}
            />
          </div>
          <span className="player-time">{formatTime(duration)}</span>
        </div>
        
        <div className="player-extra-controls-mini" onClick={(e) => e.stopPropagation()}>
          <button className="player-btn" onClick={() => setVolume(volume === 0 ? 0.8 : 0)} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button className="player-btn" onClick={() => setShowQueue(!showQueue)} aria-label="Toggle queue">
            <ListMusic size={16} />
          </button>
          <button className="player-btn" onClick={() => setIsExpanded(true)} aria-label="Expand player">
            <ChevronUp size={16} />
          </button>
        </div>
      </div>
      
      {/* Expanded Player Panel */}
      {isExpanded && (
        <div className="player-expanded-content">
          {/* Header with close button */}
          <div className="player-expanded-header">
            <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Now Playing
            </span>
            <button className="player-btn" onClick={() => setIsExpanded(false)} aria-label="Collapse player">
              <ChevronDown size={24} />
            </button>
          </div>
          
          {/* Main content - Album Art and Info */}
          <div className="player-expanded-main">
            <div className="player-expanded-art">
              <img src={currentTrack.thumbnail} alt={currentTrack.title} />
            </div>
            
            <div className="player-expanded-info">
              <h2 className="player-expanded-title">{currentTrack.title}</h2>
              <p className="player-expanded-artist">{currentTrack.artist}</p>
              <p className="player-expanded-album">{currentTrack.album || 'Unknown Album'}</p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="player-expanded-progress">
            <span className="player-time">{formatTime(progress)}</span>
            <div 
              className="progress-bar" 
              ref={progressRef}
              onClick={handleProgressClick}
            >
              <div 
                className="progress-fill" 
                style={{ width: `${(progress / duration) * 100 || 0}%` }}
              />
            </div>
            <span className="player-time">{formatTime(duration)}</span>
          </div>
          
          {/* Main Controls */}
          <div className="player-expanded-controls">
            <button 
              className={`player-btn ${shuffle ? 'active' : ''}`} 
              onClick={toggleShuffle}
              title={shuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            >
              <Shuffle size={20} color={shuffle ? 'var(--accent)' : undefined} />
            </button>
            <button className="player-btn" onClick={previous} aria-label="Previous track">
              <SkipBack size={24} />
            </button>
            <button className="player-btn player-btn-main player-btn-large" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            <button className="player-btn" onClick={next} aria-label="Next track">
              <SkipForward size={24} />
            </button>
            <button 
              className={`player-btn ${repeat !== 'off' ? 'active' : ''}`} 
              onClick={cycleRepeat}
              title={`Repeat: ${repeat}`}
            >
              <Repeat 
                size={20} 
                color={repeat !== 'off' ? 'var(--accent)' : undefined}
              />
            </button>
          </div>
          
          {/* Extra Controls */}
          <div className="player-expanded-extras" style={{ position: 'relative' }}>
            <button className="player-btn" onClick={handleOpenPlaylistPicker} title="Add to playlist">
              <ListMusic size={20} />
            </button>
            <button 
              className="player-btn" 
              onClick={handleLikeToggle}
              title={isLiked ? 'Unlike' : 'Like'}
              disabled={likeLoading}
            >
              <Heart 
                size={20} 
                fill={isLiked ? 'var(--accent)' : 'none'}
                color={isLiked ? 'var(--accent)' : undefined}
              />
            </button>
            
            {/* Playlist picker dropdown */}
            {showPlaylistPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-sm)',
                maxHeight: 200,
                overflowY: 'auto',
                minWidth: 200,
                zIndex: 400
              }}>
                {userPlaylists.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)', fontSize: 13, padding: 'var(--spacing-sm)' }}>
                    No playlists yet
                  </span>
                ) : (
                  userPlaylists.map((pl, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddToPlaylist(pl.playlistId || pl.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        padding: 'var(--spacing-sm)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontSize: 13,
                        borderRadius: 'var(--radius-sm)',
                        width: '100%',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-container)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <ListMusic size={16} />
                      <span>{pl.title || pl.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            
            <div className="player-volume">
              <button className="player-btn" onClick={() => setVolume(volume === 0 ? 0.8 : 0)} aria-label={volume === 0 ? 'Unmute' : 'Mute'}>
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div 
                className="volume-slider"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const percent = (e.clientX - rect.left) / rect.width
                  setVolume(Math.max(0, Math.min(1, percent)))
                }}
              >
                <div className="volume-fill" style={{ width: `${volume * 100}%` }} />
              </div>
            </div>
          </div>
          
          {/* Tabs: Queue, Comments */}
          <div className="player-expanded-tabs">
            <button 
              className={`player-tab ${showQueue ? 'active' : ''}`}
              onClick={() => { setShowQueue(!showQueue); setShowComments(false); }}
            >
              <ListMusic size={16} />
              <span>Queue</span>
            </button>
            <button 
              className={`player-tab ${showComments ? 'active' : ''}`}
              onClick={() => { setShowComments(!showComments); setShowQueue(false); }}
            >
              <MessageCircle size={16} />
              <span>Comments</span>
            </button>
          </div>
          
          {/* Queue Panel */}
          {showQueue && (
            <div className="player-queue">
              <h3>Play Queue ({queue.length} songs)</h3>
              <ul className="queue-list">
                {queue.map((track, index) => (
                  <li 
                    key={index} 
                    className={`queue-item ${index === currentIndex ? 'queue-item-active' : ''}`}
                    onClick={() => {
                      // Play specific track
                      usePlayerStore.getState().setQueue(queue, index)
                    }}
                  >
                    <span className="queue-number">{index + 1}</span>
                    <img src={track.thumbnail} alt={track.title} className="queue-thumb" loading="lazy" />
                    <div className="queue-info">
                      <span className="queue-title">{track.title}</span>
                      <span className="queue-artist">{track.artist}</span>
                    </div>
                    {index === currentIndex && (
                      <span className="queue-playing">🎵</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Comments Panel */}
          {showComments && (
            <div className="player-comments">
              <div className="comments-header">
                <h3>Comments ({comments.length})</h3>
              </div>
              <div className="comments-list">
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-avatar">
                      {comment.user.charAt(0).toUpperCase()}
                    </div>
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-user">{comment.user}</span>
                        <span className="comment-time">{comment.time}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="comment-input-container">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Add a comment..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && commentInput.trim()) {
                      setComments([
                        ...comments,
                        {
                          id: Date.now(),
                          user: 'You',
                          text: commentInput.trim(),
                          time: 'Just now'
                        }
                      ])
                      setCommentInput('')
                    }
                  }}
                />
                <button 
                  className="comment-send-btn"
                  onClick={() => {
                    if (commentInput.trim()) {
                      setComments([
                        ...comments,
                        {
                          id: Date.now(),
                          user: 'You',
                          text: commentInput.trim(),
                          time: 'Just now'
                        }
                      ])
                      setCommentInput('')
                    }
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Queue Sidebar */}
      {showQueue && !isExpanded && (
        <div className="queue-sidebar">
          <div className="queue-sidebar-header">
            <h3>Queue</h3>
            <button className="player-btn" onClick={() => setShowQueue(false)} aria-label="Close queue">
              <X size={18} />
            </button>
          </div>
          <ul className="queue-list">
            {queue.map((track, index) => (
              <li 
                key={index} 
                className={`queue-item ${index === currentIndex ? 'queue-item-active' : ''}`}
                onClick={() => {
                  usePlayerStore.getState().setQueue(queue, index)
                }}
              >
                <span className="queue-number">{index + 1}</span>
                <img src={track.thumbnail} alt={track.title} className="queue-thumb" loading="lazy" />
                <div className="queue-info">
                  <span className="queue-title">{track.title}</span>
                  <span className="queue-artist">{track.artist}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Player