import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { usePlayerStore } from '../store'
import Player from '../components/Player'

// Mock react-youtube
vi.mock('react-youtube', () => ({
  default: ({ videoId, onReady, onEnd }) => {
    return <div data-testid="youtube-player" data-videoid={videoId} />
  }
}))

// Mock the API module (to avoid actual HTTP calls)
vi.mock('../api', () => ({
  addLikedSong: vi.fn().mockResolvedValue({}),
  removeLikedSong: vi.fn().mockResolvedValue({}),
  checkLikedSong: vi.fn().mockResolvedValue({ data: { liked: false } }),
  getUserPlaylists: vi.fn().mockResolvedValue({ data: [] }),
  addTrackToPlaylist: vi.fn().mockResolvedValue({}),
}))

describe('Player Component', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      isPlaying: false,
      queue: [],
      currentIndex: 0,
      progress: 0,
      duration: 0,
      volume: 0.8,
      shuffle: false,
      repeat: 'off',
    })
  })

  it('renders placeholder when no track', () => {
    render(<Player />)
    expect(screen.getByText('Search for a song and click to play')).toBeInTheDocument()
  })

  it('renders collapsed player when track is set', () => {
    usePlayerStore.setState({
      currentTrack: { 
        videoId: 'test123', 
        title: 'Test Song', 
        artist: 'Test Artist', 
        thumbnail: 'test.jpg' 
      },
      isPlaying: false,
    })
    render(<Player />)
    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('does not throw ReferenceError for progressRef', () => {
    // This test verifies the P0 bug fix: progressRef must be declared
    usePlayerStore.setState({
      currentTrack: { 
        videoId: 'test', 
        title: 'T', 
        artist: 'A', 
        thumbnail: 't.jpg',
        album: 'Album'
      },
      duration: 100,
      progress: 50,
    })
    
    // Render should not throw — this would fail if progressRef is undefined
    expect(() => render(<Player />)).not.toThrow()
  })
})
