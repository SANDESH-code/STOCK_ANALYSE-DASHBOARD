import React, { useState, useEffect, useRef } from 'react';
import * as chatService from '../services/chatService';
import '../styles/chat.css';

const ChatModal = ({ isOpen, onClose, receiverId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (isOpen && receiverId) {
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen, receiverId]);

  const loadMessages = async () => {
    try {
      const data = await chatService.getConversation(receiverId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await chatService.sendMessage(receiverId, newMessage);
      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Chat</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <p className="no-messages">No messages yet. Start a conversation!</p>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`message ${msg.is_read ? 'read' : 'unread'}`}>
                <p>{msg.message}</p>
                <span className="message-time">{new Date(msg.sent_at).toLocaleTimeString()}</span>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-form">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
