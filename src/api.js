// API Client for Soundscape Backend
import axios from 'axios'
import { useAuthStore } from './store'

const API_BASE = '/api'

// Get token from auth store (single source of truth)
const getToken = () => useAuthStore.getState().token

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth - User registration and login
export const login = (email, password) => 
  api.post('/auth/login', { email, password })

export const signup = (email, password, name) => 
  api.post('/auth/signup', { email, password, name })

export const logout = () => {
  localStorage.removeItem('soundscape_token')
  localStorage.removeItem('soundscape_user')
  return Promise.resolve()
}

export const getCurrentUser = () => 
  api.get('/auth/me')

export const updateProfile = (name) => 
  api.put('/auth/update-profile', { name })

// User Preferences - Liked Songs
export const getLikedSongs = () => 
  api.get('/user/liked-songs')

export const addLikedSong = (song) => 
  api.post('/user/liked-songs', song)

export const removeLikedSong = (videoId) => 
  api.delete(`/user/liked-songs/${videoId}`)

export const checkLikedSong = (videoId) => 
  api.get(`/user/liked-songs/check/${videoId}`)

// User Preferences - History
export const getUserHistory = (limit = 50) => 
  api.get('/user/history', { params: { limit } })

export const addToHistory = (videoId, title, artist, thumbnail, playDuration = 0) => 
  api.post('/user/history', null, { params: { video_id: videoId, title, artist, thumbnail, play_duration: playDuration } })

// User Preferences
export const getPreferences = () => 
  api.get('/user/preferences')

export const updatePreferences = (prefs) => 
  api.put('/user/preferences', prefs)

// User Playlists
export const getUserPlaylists = () => 
  api.get('/user/playlists')

export const createUserPlaylist = (name, description = '', isPublic = false) => 
  api.post('/user/playlists', { name, description, is_public: isPublic })

export const getUserPlaylist = (playlistId) => 
  api.get(`/user/playlists/${playlistId}`)

export const addTrackToPlaylist = (playlistId, track) => 
  api.post(`/user/playlists/${playlistId}/tracks`, track)

// Recommendations
export const getRecommendations = (limit = 20) => 
  api.get('/recommendations/', { params: { limit } })

export const getForYou = (limit = 20) => 
  api.get('/recommendations/for-you', { params: { limit } })

export const getSimilarSongs = (videoId, limit = 10) => 
  api.get(`/recommendations/similar/${videoId}`, { params: { limit } })

// Auth - YouTube Music (optional)
export const checkAuth = () => api.get('/auth/status')
export const uploadCookies = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/auth/upload-cookies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// Search
export const search = (query, filter = null, limit = 20) => 
  api.get('/search/', { params: { query, filter, limit } })

export const getSuggestions = (query) => 
  api.get('/search/suggestions', { params: { query } })

// Library
export const getLibraryPlaylists = (limit = 25) => 
  api.get('/library/playlists', { params: { limit } })

export const getLibrarySongs = (limit = 25, order = 'recent') => 
  api.get('/library/songs', { params: { limit, order } })

export const getLibraryAlbums = (limit = 25, order = 'recent') => 
  api.get('/library/albums', { params: { limit, order } })

export const getLibraryArtists = (limit = 25) => 
  api.get('/library/artists', { params: { limit } })

// Playlists
export const getPlaylist = (playlistId, limit = 100) => 
  api.get(`/playlists/${playlistId}`, { params: { limit } })

export const createPlaylist = (title, description = '') => 
  api.post('/playlists/', { title, description })

export const addToPlaylist = (playlistId, videoIds) => 
  api.post(`/playlists/${playlistId}/tracks`, { video_ids: videoIds })

// Browse
export const getCharts = (country = 'US') => 
  api.get('/browse/charts', { params: { country } })

export const getMoods = () => api.get('/browse/moods')

export const getMoodPlaylists = (moodId, limit = 20) => 
  api.get(`/browse/moods/${moodId}`, { params: { limit } })

export const getArtist = (artistId) => api.get(`/browse/artist/${artistId}`)

export const getArtistAlbums = (artistId, limit = 25) => 
  api.get(`/browse/artist/${artistId}/albums`, { params: { limit } })

export const getAlbum = (albumId) => api.get(`/browse/album/${albumId}`)

export const getRelated = (videoId, limit = 20) => 
  api.get(`/browse/related/${videoId}`, { params: { limit } })

// Player
export const getWatchPlaylist = (videoId = null, playlistId = null, limit = 25) => 
  api.get('/player/watch', { params: { video_id: videoId, playlist_id: playlistId, limit } })

export const getRadio = (videoId, limit = 25) => 
  api.get('/player/radio', { params: { video_id: videoId, limit } })

export const getHistory = (limit = 25) => 
  api.get('/player/history', { params: { limit } })

// Helper to extract video info from API responses
export const extractTrackInfo = (item) => {
  if (!item) return null
  
  return {
    videoId: item.videoId || item.video_id,
    title: item.title || item.name,
    artist: item.artist?.name || item.artists?.[0]?.name || 'Unknown Artist',
    artistId: item.artist?.id || item.artists?.[0]?.id,
    album: item.album?.name || item.albumTitle || item.album?.title,
    albumId: item.album?.id,
    thumbnail: item.thumbnail?.thumbnails?.[0]?.url || 
               item.thumbnail || 
               item.thumbnails?.[0]?.url ||
               `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
    duration: item.duration || item.length,
    durationSeconds: item.duration_seconds
  }
}

// Helper to format duration
export const formatDuration = (seconds) => {
  if (!seconds) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default api