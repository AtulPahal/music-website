// API Client for Soundscape Backend - Fixed version using local axios mock
import axios from "./axios.js";

const API_BASE = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json"
  }
});

// Auth
export const checkAuth = () => api.get("/auth/status");

export const uploadCookies = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post("/auth/upload-cookies", formData, { headers: { "Content-Type": "multipart/form-data" } });
};

// Search
export const search = (query, filter = null, limit = 20) => 
  api.get("/search/", { params: { query, filter, limit } });

export const getSuggestions = (query) => api.get("/search/suggestions", { params: { query } });

// Library
export const getLibraryPlaylists = (limit = 25) => api.get("/library/playlists", { params: { limit } });

export const getLibrarySongs = (limit = 25, order = "recent") => api.get("/library/songs", { params: { limit, order } });

export const getLibraryAlbums = (limit = 25, order = "recent") => api.get("/library/albums", { params: { limit, order } });

export const getLibraryArtists = (limit = 25) => api.get("/library/artists", { params: { limit } });

// Playlists
export const getPlaylist = (playlistId, limit = 100) => api.get(`/playlists/${playlistId}`, { params: { limit } });

export const createPlaylist = (title, description = "") => api.post("/playlists/", { title, description });

export const addToPlaylist = (playlistId, videoIds) => api.post(`/playlists/${playlistId}/tracks`, { video_ids: videoIds });

// Browse
export const getCharts = (country = "US") => api.get("/browse/charts", { params: { country } });

export const getMoods = () => api.get("/browse/moods");

export const getMoodPlaylists = (moodId, limit = 20) => api.get(`/browse/moods/${moodId}`, { params: { limit } });

export const getArtist = (artistId) => api.get(`/browse/artist/${artistId}`);

export const getArtistAlbums = (artistId, limit = 25) => api.get(`/browse/artist/${artistId}/albums`, { params: { limit } });

export const getAlbum = (albumId) => api.get(`/browse/album/${albumId}`);

export const getRelated = (videoId, limit = 20) => api.get(`/browse/related/${videoId}`, { params: { limit } });

// Player
export const getWatchPlaylist = (videoId = null, playlistId = null, limit = 25) => api.get("/player/watch", { params: { video_id: videoId, playlist_id: playlistId, limit } });

export const getRadio = (videoId, limit = 25) => api.get("/player/radio", { params: { video_id: videoId, limit } });

export const getHistory = (limit = 25) => api.get("/player/history", { params: { limit } });

// Helper to extract video info from API responses
export const extractTrackInfo = (item) => {
  if (!item) return null;
  return {
    videoId: item.videoId || item.video_id,
    title: item.title || item.name,
    artist: item.artist?.name || item.artists?.[0]?.name || "Unknown Artist",
    artistId: item.artist?.id || item.artists?.[0]?.id,
    album: item.album?.name || item.albumTitle || item.album?.title,
    albumId: item.album?.id,
    thumbnail: item.thumbnail?.thumbnails?.[0]?.url || item.thumbnail || item.thumbnails?.[0]?.url || `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`,
    duration: item.duration || item.length,
    durationSeconds: item.duration_seconds
  };
};

// Helper to format duration
export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default api;