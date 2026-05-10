import { useState, useEffect, useRef } from 'react'
import YouTube from 'react-youtube'
import { usePlayerStore } from '../store'
import { 
  Play, Pause, SkipBack, SkipForward, 
  Volume2, VolumeX, Heart, ListMusic,
  ChevronUp, ChevronDown, Shuffle, Repeat,
  Disc3, X, MessageCircle, Send
} from 'lucide-react'

function Player() {
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
    currentIndex
  } = usePlayerStore()
  
  const [isExpanded, setIsExpanded] = useState(false)
  const [showQueue, setShowQueue] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [playerReady, setPlayerReady] = useState(false)
  const playerRef = useRef(null)
  
  const [comments, setComments] = useState([
    { id: 1, user: 'Music Fan', text: 'Great song! 🎵', time: '2 hours ago' },
    { id: 2, user: ' listener', text: 'Love this track!', time: '1 day ago' },
  ])
  
  const handlePlayerReady = (event) => {
    playerRef.current = event.target
    setPlayerReady(true)
    event.target.setVolume(volume * 100)
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
  
  // Update progress every second
  useEffect(() => {
    const interval = setInterval(handleProgress, 1000)
    return () => clearInterval(interval)
  }, [playerReady])
  
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
      {/* Hidden YouTube Player */}
      <div style={{ display: 'none' }}>
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
          <button className="player-btn" onClick={previous}>
            <SkipBack size={18} />
          </button>
          <button className="player-btn player-btn-main" onClick={togglePlay}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className="player-btn" onClick={next}>
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
          <button className="player-btn" onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <button className="player-btn" onClick={() => setShowQueue(!showQueue)}>
            <ListMusic size={16} />
          </button>
          <button className="player-btn" onClick={() => setIsExpanded(true)}>
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
            <button className="player-btn" onClick={() => setIsExpanded(false)}>
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
            <button className="player-btn" title="Shuffle">
              <Shuffle size={20} />
            </button>
            <button className="player-btn" onClick={previous}>
              <SkipBack size={24} />
            </button>
            <button className="player-btn player-btn-main player-btn-large" onClick={togglePlay}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
            <button className="player-btn" onClick={next}>
              <SkipForward size={24} />
            </button>
            <button className="player-btn" title="Repeat">
              <Repeat size={20} />
            </button>
          </div>
          
          {/* Extra Controls */}
          <div className="player-expanded-extras">
            <button className="player-btn" title="Add to playlist">
              <ListMusic size={20} />
            </button>
            <button className="player-btn" title="Like">
              <Heart size={20} />
            </button>
            <div className="player-volume">
              <button className="player-btn" onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
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
                    <img src={track.thumbnail} alt={track.title} className="queue-thumb" />
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
            <button className="player-btn" onClick={() => setShowQueue(false)}>
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
                <img src={track.thumbnail} alt={track.title} className="queue-thumb" />
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