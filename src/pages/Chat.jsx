import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store'
import { Send, Bot, User, Music } from 'lucide-react'

function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      senderName: 'Soundscape Assistant',
      text: 'Hello! I\'m your music assistant. Ask me to recommend songs, find artists, or help you discover new music!',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const user = useAuthStore((state) => state.user)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      senderName: user?.name || 'You',
      text: input.trim(),
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    
    try {
      // Process the user message and generate a response
      const response = await generateResponse(input.trim())
      
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Soundscape Assistant',
        text: response,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        senderName: 'Soundscape Assistant',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  
  const generateResponse = async (message) => {
    // Simple response logic - in production, this would call an API
    const lowerMessage = message.toLowerCase()
    
    // Music recommendations
    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      if (lowerMessage.includes('sad') || lowerMessage.includes('feeling down')) {
        return "Here are some songs to lift your mood: 'Happy' by Pharrell Williams, 'Don't Stop Believin'' by Journey, 'Best Day of My Life' by American Authors. Would you like me to play any of these?"
      } else if (lowerMessage.includes('party') || lowerMessage.includes('energetic')) {
        return "For a party vibe, try: 'Uptown Funk' by Bruno Mars, 'Blinding Lights' by The Weeknd, 'Dance Monkey' by Tones and I. Want me to search for these?"
      } else if (lowerMessage.includes('relax') || lowerMessage.includes('calm')) {
        return "For relaxation, I'd suggest: 'Weightless' by Marconi Union, 'Clair de Lune' by Debussy, 'River Flows in You' by Yiruma. Should I search for these?"
      } else {
        return "I can help you discover music! Tell me about your mood or what kind of music you like. For example: 'recommend some happy songs' or 'suggest rock music'"
      }
    }
    
    // Artist search
    if (lowerMessage.includes('who is') || lowerMessage.includes('tell me about')) {
      const artistName = lowerMessage.replace(/who is|tell me about/i, '').trim()
      return `I can search for ${artistName}! Would you like me to search for them so you can see their albums and top songs?`
    }
    
    // Play music
    if (lowerMessage.includes('play') || lowerMessage.includes('listen to')) {
      const songOrArtist = lowerMessage.replace(/play|listen to/i, '').trim()
      return `Let me search for "${songOrArtist}" for you! Click the search icon or go to the Search page to find music.`
    }
    
    // Help
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you with:\n• Music recommendations based on your mood\n• Finding artists and their songs\n• Discovering new music\n• Creating playlists\n\nJust tell me what you're in the mood for!"
    }
    
    // Greeting
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hey there! 👋 How can I help you discover some music today?"
    }
    
    // Thanks
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return "You're welcome! Let me know if you need any more music recommendations!"
    }
    
    // Default response
    return "I'm here to help you discover music! Try asking me things like:\n• 'Recommend some happy songs'\n• 'Suggest rock music'\n• 'Find artist [name]'\n• 'What can you do?'"
  }
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const quickActions = [
    { label: '🎵 Recommend songs', action: 'Recommend some songs' },
    { label: '😢 Feeling sad', action: 'Recommend some songs for when I\'m feeling sad' },
    { label: '🎉 Party music', action: 'Recommend party songs' },
    { label: '😌 Relaxing music', action: 'Recommend relaxing music' }
  ]
  
  return (
    <div className="chat-container">
      <header className="header">
        <h1 style={{ fontSize: 32 }}>Chat</h1>
      </header>
      
      {/* Quick Actions */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        padding: 'var(--spacing-md)',
        flexWrap: 'wrap'
      }}>
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="btn btn-ghost"
            onClick={() => setInput(action.action)}
          >
            {action.label}
          </button>
        ))}
      </div>
      
      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`chat-message ${message.sender === 'user' ? 'user' : ''}`}
          >
            <div className="chat-avatar">
              {message.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className="chat-message-content">
              <div className="chat-message-sender">{message.senderName}</div>
              <div className="chat-message-text">{message.text}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="chat-message">
            <div className="chat-avatar">
              <Bot size={20} />
            </div>
            <div className="chat-message-content">
              <div className="chat-message-sender">Soundscape Assistant</div>
              <div className="chat-message-text" style={{ fontStyle: 'italic' }}>
                Thinking...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask for music recommendations..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
        />
        <button 
          className="chat-send-btn"
          onClick={handleSend}
          disabled={loading || !input.trim()}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}

export default Chat