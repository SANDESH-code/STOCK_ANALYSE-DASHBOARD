# FRONTEND - React Components & Styling

## React Components & Pages

### Component: Hero.jsx

```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/hero.css';

function Hero({ onSellClick }) {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Don't Waste Tickets.<br />Resell Them Instantly.</h1>
        <p>Buy and sell movie tickets, IPL tickets, concert passes, event tickets and more.</p>
        
        <div className="hero-buttons">
          <Link to="/#tickets" className="btn btn-primary">
            Browse Tickets
          </Link>
          
          {user?.role === 'seller' ? (
            <button className="btn btn-secondary" onClick={onSellClick}>
              + Sell Ticket
            </button>
          ) : (
            <Link to="/signup?role=seller" className="btn btn-secondary">
              Become a Seller
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

export default Hero;
```

### Component: Stats.jsx

```jsx
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import '../styles/stats.css';

function Stats({ tickets }) {
  const [stats, setStats] = useState({
    total_tickets: 0,
    available_tickets: 0,
    sold_tickets: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.get('/tickets/stats');
        setStats(response);
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };

    loadStats();
  }, [tickets]);

  return (
    <section className="stats">
      <div className="stat-card">
        <h2>{stats.total_tickets}</h2>
        <p>Tickets Listed</p>
      </div>

      <div className="stat-card">
        <h2>{stats.available_tickets}</h2>
        <p>Available Now</p>
      </div>

      <div className="stat-card">
        <h2>{stats.sold_tickets}</h2>
        <p>Tickets Sold</p>
      </div>
    </section>
  );
}

export default Stats;
```

### Component: SearchSection.jsx

```jsx
import React, { useState } from 'react';
import '../styles/search.css';

function SearchSection({ onFiltersChange }) {
  const [filters, setFilters] = useState({
    search: '',
    event_type: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <section className="search-section">
      <input
        type="text"
        name="search"
        placeholder="Search Tickets..."
        value={filters.search}
        onChange={handleChange}
        className="search-input"
      />

      <select
        name="event_type"
        value={filters.event_type}
        onChange={handleChange}
        className="search-select"
      >
        <option value="">All Categories</option>
        <option value="Movie">Movie</option>
        <option value="IPL">IPL</option>
        <option value="Concert">Concert</option>
        <option value="Show">Show</option>
        <option value="Sports">Sports</option>
      </select>
    </section>
  );
}

export default SearchSection;
```

### Component: UploadModal.jsx

```jsx
import React, { useState } from 'react';
import { ticketService } from '../services/ticketService';
import { getAIPriceRecommendation } from '../utils/priceRecommendation';
import '../styles/modal.css';

function UploadModal({ onClose, onUploadSuccess }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventType: 'Movie',
    eventDate: '',
    eventLocation: '',
    seatNumber: '',
    originalPrice: '',
    sellingPrice: '',
    quantity: 1,
    description: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Calculate suggested price
    if (name === 'originalPrice' || name === 'eventDate') {
      const price = name === 'originalPrice' ? value : formData.originalPrice;
      const date = name === 'eventDate' ? value : formData.eventDate;
      if (price && date) {
        const suggested = getAIPriceRecommendation(price, date);
        setSuggestedPrice(suggested);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.eventName || !formData.eventDate || !formData.originalPrice) {
      setError('Please fill all required fields');
      return;
    }

    if (!imageFile) {
      setError('Please upload a ticket image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await ticketService.createTicket(
        {
          ...formData,
          sellingPrice: formData.sellingPrice || suggestedPrice || formData.originalPrice
        },
        imageFile
      );

      alert('Ticket uploaded successfully!');
      onUploadSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Ticket</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="eventName"
              placeholder="e.g., Avengers Endgame"
              value={formData.eventName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type *</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
              >
                <option>Movie</option>
                <option>IPL</option>
                <option>Concert</option>
                <option>Show</option>
                <option>Sports</option>
              </select>
            </div>

            <div className="form-group">
              <label>Event Date *</label>
              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="eventLocation"
              placeholder="e.g., PVR, Mumbai"
              value={formData.eventLocation}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Seat Number</label>
              <input
                type="text"
                name="seatNumber"
                placeholder="e.g., A1"
                value={formData.seatNumber}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Original Price (₹) *</label>
              <input
                type="number"
                name="originalPrice"
                placeholder="500"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Selling Price (₹)</label>
              <input
                type="number"
                name="sellingPrice"
                placeholder={suggestedPrice || 'Auto-calculated'}
                value={formData.sellingPrice}
                onChange={handleChange}
              />
            </div>
          </div>

          {suggestedPrice && (
            <div className="ai-suggestion">
              <p>💡 <strong>AI Suggested Price:</strong> ₹{suggestedPrice}</p>
            </div>
          )}

          <div className="form-group">
            <label>Ticket Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imageFile && <p className="file-name">✓ {imageFile.name}</p>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe your ticket..."
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Ticket'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
```

### Component: ChatModal.jsx

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import '../styles/chat.css';

function ChatModal({ userId, userName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
    const interval = setInterval(loadConversation, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const response = await chatService.getConversation(userId);
      setMessages(response.messages || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(userId, newMessage);
      setNewMessage('');
      loadConversation();
    } catch (error) {
      alert('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-header">
          <h3>Chat with {userName}</h3>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="messages-container">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet. Start the conversation!</p>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`message ${msg.is_sender ? 'sent' : 'received'}`}
              >
                <p>{msg.message}</p>
                <small>{new Date(msg.sent_at).toLocaleTimeString()}</small>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="chat-input"
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatModal;
```

### Component: Loader.jsx

```jsx
import React from 'react';
import '../styles/loader.css';

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

export default Loader;
```

### Component: ErrorBoundary.jsx

```jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

---

## CSS STYLING

### global.css

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary: #2563eb;
  --secondary: #1d4ed8;
  --success: #16a34a;
  --danger: #dc2626;
  --warning: #ea8e2e;

  --bg: #f5f7fb;
  --card: #ffffff;
  --border: #e5e7eb;

  --text: #111827;
  --text-light: #6b7280;

  --shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.15);

  --radius: 12px;
  --transition: 0.3s ease;
}

body.dark {
  --bg: #0f172a;
  --card: #1e293b;
  --border: #334155;
  --text: #f8fafc;
  --text-light: #94a3b8;
}

html, body, #root {
  height: 100%;
  font-family: 'Poppins', sans-serif;
}

body {
  background: var(--bg);
  color: var(--text);
  transition: all var(--transition);
  line-height: 1.6;
}

/* BUTTONS */

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-size: 14px;
  white-space: nowrap;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--secondary);
  transform: translateY(-2px);
}

.btn-secondary {
  background: var(--card);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg);
  border-color: var(--primary);
}

.btn-success {
  background: var(--success);
  color: white;
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-block {
  width: 100%;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 12px;
}

/* FORMS */

input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--card);
  color: var(--text);
  font-family: inherit;
  transition: all var(--transition);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* GRID */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.grid {
  display: grid;
  gap: 20px;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}

/* FLEX */

.flex {
  display: flex;
  align-items: center;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* SPACING */

.mt-1 { margin-top: 0.5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mt-4 { margin-top: 2rem; }

.mb-1 { margin-bottom: 0.5rem; }
.mb-2 { margin-bottom: 1rem; }
.mb-3 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 2rem; }

.p-1 { padding: 0.5rem; }
.p-2 { padding: 1rem; }
.p-3 { padding: 1.5rem; }
.p-4 { padding: 2rem; }

/* TEXT */

h1 { font-size: 2.5rem; line-height: 1.2; }
h2 { font-size: 2rem; line-height: 1.3; }
h3 { font-size: 1.5rem; line-height: 1.4; }
h4 { font-size: 1.25rem; }
h5 { font-size: 1.1rem; }
h6 { font-size: 1rem; }

p { margin: 0; }

small { font-size: 0.85rem; color: var(--text-light); }

.text-center { text-align: center; }
.text-muted { color: var(--text-light); }
.text-danger { color: var(--danger); }
.text-success { color: var(--success); }

/* CARDS */

.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
  transition: all var(--transition);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

/* ERROR & SUCCESS */

.error-message {
  color: var(--danger);
  background: rgba(220, 38, 38, 0.1);
  padding: 12px;
  border-radius: var(--radius);
  margin: 10px 0;
}

.success-message {
  color: var(--success);
  background: rgba(22, 163, 74, 0.1);
  padding: 12px;
  border-radius: var(--radius);
  margin: 10px 0;
}
```

### responsive.css

```css
/* TABLET */

@media (max-width: 768px) {
  h1 { font-size: 2rem; }
  h2 { font-size: 1.5rem; }

  .grid-2 { grid-template-columns: 1fr; }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
  .grid-4 { grid-template-columns: repeat(2, 1fr); }

  .navbar-container {
    flex-direction: column;
    gap: 10px;
  }

  .nav-actions {
    flex-wrap: wrap;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .modal-content {
    width: 90vw;
    max-height: 90vh;
  }
}

/* MOBILE */

@media (max-width: 480px) {
  body { font-size: 14px; }

  h1 { font-size: 1.5rem; }
  h2 { font-size: 1.25rem; }

  .btn {
    padding: 10px 16px;
    font-size: 12px;
  }

  .grid { gap: 10px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }

  .flex-between {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-section {
    flex-direction: column;
  }

  .search-input, .search-select {
    width: 100%;
  }

  input, select, textarea {
    padding: 10px;
  }

  .modal-content {
    width: 95vw;
  }

  .form-row {
    flex-direction: column;
  }

  .form-row .form-group {
    width: 100%;
  }
}
```

---

## UTILITIES

### priceRecommendation.js

```javascript
export function getAIPriceRecommendation(originalPrice, eventDate) {
  const now = new Date();
  const eventTime = new Date(eventDate);
  const hoursUntilEvent = (eventTime - now) / (1000 * 60 * 60);

  let discountPercent = 0;

  if (hoursUntilEvent < 6) {
    discountPercent = 30; // 30% discount (70% of price)
  } else if (hoursUntilEvent < 24) {
    discountPercent = 15; // 15% discount (85% of price)
  } else if (hoursUntilEvent < 48) {
    discountPercent = 5; // 5% discount (95% of price)
  }

  return Math.round(originalPrice * ((100 - discountPercent) / 100));
}
```

---

## VITE CONFIG

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

Complete React + Node.js + MySQL implementation with all features preserved!
