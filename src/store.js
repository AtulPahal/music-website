// Player State Store using Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePlayerStore = create((set, get) => ({
  // Current track
  currentTrack: null,
  isPlaying: false,
  
  // Queue
  queue: [],
  currentIndex: 0,
  
  // Playback state
  progress: 0,
  duration: 0,
  volume: 0.8,
  
  // Actions
  setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
  
  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setQueue: (tracks, startIndex = 0) => set({
    queue: tracks,
    currentIndex: startIndex,
    currentTrack: tracks[startIndex] || null,
    isPlaying: true
  }),
  
  addToQueue: (track) => set((state) => ({
    queue: [...state.queue, track]
  })),
  
  next: () => {
    const { queue, currentIndex } = get()
    if (currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1
      set({
        currentIndex: nextIndex,
        currentTrack: queue[nextIndex],
        progress: 0
      })
    }
  },
  
  previous: () => {
    const { queue, currentIndex, progress } = get()
    if (progress > 3) {
      set({ progress: 0 })
    } else if (currentIndex > 0) {
      const prevIndex = currentIndex - 1
      set({
        currentIndex: prevIndex,
        currentTrack: queue[prevIndex],
        progress: 0
      })
    }
  },
  
  setProgress: (progress) => set({ progress }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => set({ volume }),
  
  playTrack: (track, tracks = null) => {
    if (tracks) {
      const index = tracks.findIndex(t => t.videoId === track.videoId)
      set({
        queue: tracks,
        currentIndex: index >= 0 ? index : 0,
        currentTrack: track,
        isPlaying: true,
        progress: 0
      })
    } else {
      set({ currentTrack: track, isPlaying: true, progress: 0 })
    }
  }
}))

// Auth Store - persisted to localStorage
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        localStorage.setItem('soundscape_token', token)
        localStorage.setItem('soundscape_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('soundscape_token')
        localStorage.removeItem('soundscape_user')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      initializeAuth: () => {
        const token = localStorage.getItem('soundscape_token')
        const userStr = localStorage.getItem('soundscape_user')
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({ user, token, isAuthenticated: true })
          } catch (e) {
            localStorage.removeItem('soundscape_token')
            localStorage.removeItem('soundscape_user')
          }
        }
      }
    }),
    {
      name: 'soundscape-auth'
    }
  )
)

// UI Store for sidebar, modals, etc.
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  authModalOpen: false,
  currentView: 'home',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAuthModal: (open) => set({ authModalOpen: open }),
  setCurrentView: (view) => set({ currentView: view })
}))