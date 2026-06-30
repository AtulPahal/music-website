import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from '../store'

describe('Player Store', () => {
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

  it('playTrack with tracks sets queue and plays', () => {
    const tracks = [
      { videoId: 'a', title: 'A', artist: 'Artist 1' },
      { videoId: 'b', title: 'B', artist: 'Artist 2' },
    ]
    usePlayerStore.getState().playTrack(tracks[0], tracks)
    const state = usePlayerStore.getState()
    expect(state.currentTrack).toEqual(tracks[0])
    expect(state.queue).toEqual(tracks)
    expect(state.currentIndex).toBe(0)
    expect(state.isPlaying).toBe(true)
  })

  it('playTrack without tracks sets only current track', () => {
    const track = { videoId: 'a', title: 'A', artist: 'Artist' }
    usePlayerStore.getState().playTrack(track)
    const state = usePlayerStore.getState()
    expect(state.currentTrack).toEqual(track)
    expect(state.isPlaying).toBe(true)
    expect(state.queue).toEqual([])
  })

  it('next advances to next track', () => {
    const tracks = [
      { videoId: 'a', title: 'A' },
      { videoId: 'b', title: 'B' },
      { videoId: 'c', title: 'C' },
    ]
    usePlayerStore.setState({
      queue: tracks,
      currentIndex: 0,
      currentTrack: tracks[0],
      isPlaying: true,
      progress: 0,
    })
    usePlayerStore.getState().next()
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(usePlayerStore.getState().currentTrack?.videoId).toBe('b')
  })

  it('next with shuffle picks a different track', () => {
    const tracks = [
      { videoId: 'a', title: 'A' },
      { videoId: 'b', title: 'B' },
      { videoId: 'c', title: 'C' },
      { videoId: 'd', title: 'D' },
    ]
    usePlayerStore.setState({
      queue: tracks,
      currentIndex: 0,
      currentTrack: tracks[0],
      shuffle: true,
      progress: 0,
    })
    
    // First next should change from index 0
    usePlayerStore.getState().next()
    const firstIdx = usePlayerStore.getState().currentIndex
    expect(firstIdx).not.toBe(0) // Should not pick the same track
    
    // Subsequent nexts should stay in valid range
    for (let i = 0; i < 5; i++) {
      usePlayerStore.getState().next()
      const idx = usePlayerStore.getState().currentIndex
      expect(idx).toBeGreaterThanOrEqual(0)
      expect(idx).toBeLessThan(tracks.length)
    }
  })

  it('next with repeat:all loops back to start', () => {
    const tracks = [
      { videoId: 'a', title: 'A' },
      { videoId: 'b', title: 'B' },
    ]
    usePlayerStore.setState({
      queue: tracks,
      currentIndex: 1,
      currentTrack: tracks[1],
      repeat: 'all',
      progress: 0,
    })
    usePlayerStore.getState().next()
    // Should wrap to index 0
    expect(usePlayerStore.getState().currentIndex).toBe(0)
    expect(usePlayerStore.getState().currentTrack?.videoId).toBe('a')
  })

  it('next with repeat:one replays current track', () => {
    const tracks = [
      { videoId: 'a', title: 'A' },
      { videoId: 'b', title: 'B' },
    ]
    usePlayerStore.setState({
      queue: tracks,
      currentIndex: 1,
      currentTrack: tracks[1],
      repeat: 'one',
      progress: 50,
    })
    usePlayerStore.getState().next()
    // Should stay on same track but reset progress
    expect(usePlayerStore.getState().currentIndex).toBe(1)
    expect(usePlayerStore.getState().currentTrack?.videoId).toBe('b')
    expect(usePlayerStore.getState().progress).toBe(0)
  })

  it('previous with progress > 3 resets to 0', () => {
    usePlayerStore.setState({
      queue: [{ videoId: 'a' }, { videoId: 'b' }],
      currentIndex: 0,
      currentTrack: { videoId: 'a' },
      progress: 10,
    })
    usePlayerStore.getState().previous()
    expect(usePlayerStore.getState().currentIndex).toBe(0)
    expect(usePlayerStore.getState().progress).toBe(0)
  })

  it('previous with progress <= 3 goes to previous track', () => {
    usePlayerStore.setState({
      queue: [{ videoId: 'a' }, { videoId: 'b' }],
      currentIndex: 1,
      currentTrack: { videoId: 'b' },
      progress: 1,
    })
    usePlayerStore.getState().previous()
    expect(usePlayerStore.getState().currentIndex).toBe(0)
    expect(usePlayerStore.getState().currentTrack?.videoId).toBe('a')
  })

  it('toggleShuffle toggles shuffle state', () => {
    expect(usePlayerStore.getState().shuffle).toBe(false)
    usePlayerStore.getState().toggleShuffle()
    expect(usePlayerStore.getState().shuffle).toBe(true)
    usePlayerStore.getState().toggleShuffle()
    expect(usePlayerStore.getState().shuffle).toBe(false)
  })

  it('cycleRepeat cycles through off -> all -> one -> off', () => {
    expect(usePlayerStore.getState().repeat).toBe('off')
    usePlayerStore.getState().cycleRepeat()
    expect(usePlayerStore.getState().repeat).toBe('all')
    usePlayerStore.getState().cycleRepeat()
    expect(usePlayerStore.getState().repeat).toBe('one')
    usePlayerStore.getState().cycleRepeat()
    expect(usePlayerStore.getState().repeat).toBe('off')
  })

  it('addToQueue appends to queue', () => {
    usePlayerStore.setState({
      queue: [{ videoId: 'a', title: 'A' }],
    })
    usePlayerStore.getState().addToQueue({ videoId: 'b', title: 'B' })
    expect(usePlayerStore.getState().queue).toHaveLength(2)
    expect(usePlayerStore.getState().queue[1].videoId).toBe('b')
  })

  it('setQueue updates queue and starts playing from given index', () => {
    const tracks = [
      { videoId: 'x', title: 'X' },
      { videoId: 'y', title: 'Y' },
      { videoId: 'z', title: 'Z' },
    ]
    usePlayerStore.getState().setQueue(tracks, 2)
    const state = usePlayerStore.getState()
    expect(state.queue).toEqual(tracks)
    expect(state.currentIndex).toBe(2)
    expect(state.currentTrack?.videoId).toBe('z')
    expect(state.isPlaying).toBe(true)
  })

  it('togglePlay toggles isPlaying', () => {
    usePlayerStore.setState({ isPlaying: false })
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(true)
    usePlayerStore.getState().togglePlay()
    expect(usePlayerStore.getState().isPlaying).toBe(false)
  })
})
