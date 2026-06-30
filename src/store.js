// Player State Store using Zustand
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const usePlayerStore = create(
  persist(
    (set, get) => ({
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
      
      // Shuffle & repeat
      shuffle: false,
      repeat: 'off', // 'off', 'all', 'one'
      
      // Actions
      setTrack: (track) => set({ currentTrack: track, isPlaying: true }),
      
      play: () => set({ isPlaying: true }),
      
      pause: () => set({ isPlaying: false }),
      
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
      
      cycleRepeat: () => set((state) => {
        const modes = ['off', 'all', 'one']
        const idx = modes.indexOf(state.repeat)
        return { repeat: modes[(idx + 1) % modes.length] }
      }),
      
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
        const { queue, currentIndex, shuffle, repeat } = get()
        
        let nextIndex
        if (shuffle && queue.length > 1) {
          // Pick random index different from current
          const available = queue.map((_, i) => i).filter(i => i !== currentIndex)
          if (available.length > 0) {
            nextIndex = available[Math.floor(Math.random() * available.length)]
          } else {
            nextIndex = currentIndex
          }
        } else {
          nextIndex = currentIndex + 1
        }
        
        if (nextIndex < queue.length) {
          set({
            currentIndex: nextIndex,
            currentTrack: queue[nextIndex],
            progress: 0
          })
        } else if (repeat === 'all') {
          // Loop back to start
          set({ currentIndex: 0, currentTrack: queue[0], progress: 0 })
        } else if (repeat === 'one') {
          // Replay current track
          set({ progress: 0 })
        }
        // else: stop (end of queue)
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
        } else if (get().repeat === 'all') {
          // Wrap to last track
          const lastIndex = queue.length - 1
          if (lastIndex >= 0) {
            set({ currentIndex: lastIndex, currentTrack: queue[lastIndex], progress: 0 })
          }
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
    }),
    {
      name: 'soundscape-player',
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        isPlaying: state.isPlaying,
        queue: state.queue,
        currentIndex: state.currentIndex,
        volume: state.volume,
        shuffle: state.shuffle,
        repeat: state.repeat
      })
    }
  )
)

// Auth Store - persisted to localStorage
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      initializeAuth: () => {
        const state = get()
        // Already rehydrated by Zustand persist middleware
        if (state.token && state.user) {
          set({ user: state.user, token: state.token, isAuthenticated: true })
          return
        }
        // Fallback: migrate from old localStorage keys (pre-persist migration)
        const oldToken = localStorage.getItem('soundscape_token')
        const oldUserStr = localStorage.getItem('soundscape_user')
        if (oldToken && oldUserStr) {
          try {
            const user = JSON.parse(oldUserStr)
            set({ user, token: oldToken, isAuthenticated: true })
            // Clean up old keys after migration
            localStorage.removeItem('soundscape_token')
            localStorage.removeItem('soundscape_user')
          } catch {
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
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setAuthModal: (open) => set({ authModalOpen: open }),
}))
