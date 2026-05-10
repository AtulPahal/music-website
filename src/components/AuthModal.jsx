import { useState } from 'react'
import { useUIStore } from '../store'
import { uploadCookies, checkAuth } from '../api'
import { Upload, X, AlertCircle } from 'lucide-react'

function AuthModal() {
  const { setAuthModal } = useUIStore()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
    setError(null)
  }
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      await uploadCookies(file)
      const response = await checkAuth()
      
      if (response.data.oauth || response.data.headers) {
        setAuthModal(false)
        window.location.reload()
      } else {
        setError('Authentication failed. Please check your cookie file.')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <button 
          className="btn-icon" 
          onClick={() => setAuthModal(false)}
          style={{ position: 'absolute', top: 16, right: 16 }}
        >
          <X size={20} />
        </button>
        
        <h2 className="auth-modal-title">Welcome to Soundscape</h2>
        <p className="auth-modal-text">
          To access your YouTube Music library, you need to authenticate. 
          Upload your browser cookies or OAuth credentials file.
        </p>
        
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label 
            style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              padding: 'var(--spacing-xl)',
              border: '2px dashed var(--border)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Upload size={32} style={{ color: 'var(--accent)', marginBottom: 'var(--spacing-sm)' }} />
            <span style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {file ? file.name : 'Click to upload'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              oauth.json or headers_auth.json
            </span>
            <input 
              type="file" 
              accept=".json,text/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
        
        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--spacing-sm)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            background: 'var(--error-container)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 'var(--spacing-lg)'
          }}>
            <AlertCircle size={16} style={{ color: 'var(--error)' }} />
            <span style={{ color: 'var(--on-error-container)', fontSize: 14 }}>{error}</span>
          </div>
        )}
        
        <button 
          className="btn btn-primary" 
          onClick={handleUpload}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Authenticating...' : 'Connect'}
        </button>
        
        <p style={{ 
          fontSize: 12, 
          color: 'var(--text-muted)', 
          marginTop: 'var(--spacing-lg)',
          textAlign: 'center'
        }}>
          Your credentials are stored locally and never uploaded to any server.
        </p>
      </div>
    </div>
  )
}

export default AuthModal