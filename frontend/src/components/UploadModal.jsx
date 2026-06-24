import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as ticketService from '../services/ticketService';
import * as requestService from '../services/requestService';
import { getAIPriceRecommendation } from '../utils/priceRecommendation';
import '../styles/modals.css';

const UploadModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'Movie',
    event_date: '',
    event_location: '',
    seat_number: '',
    seat_row: '',
    original_price: '',
    selling_price: '',
    quantity: '1',
    description: ''
  });
  const [suggestedPrice, setSuggestedPrice] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'original_price' || name === 'event_date') {
      if (formData.original_price && formData.event_date) {
        const suggested = getAIPriceRecommendation(
          parseFloat(formData.original_price),
          formData.event_date
        );
        setSuggestedPrice(suggested);
      }
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await ticketService.createTicket(formData, imageFile);
      setFormData({
        event_name: '',
        event_type: 'Movie',
        event_date: '',
        event_location: '',
        seat_number: '',
        seat_row: '',
        original_price: '',
        selling_price: '',
        quantity: '1',
        description: ''
      });
      setImageFile(null);
      setSuggestedPrice(null);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload Ticket</h2>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Event Name</label>
            <input
              type="text"
              name="event_name"
              value={formData.event_name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type</label>
              <select name="event_type" value={formData.event_type} onChange={handleInputChange}>
                <option value="Movie">Movie</option>
                <option value="IPL">IPL</option>
                <option value="Concert">Concert</option>
                <option value="Show">Show</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div className="form-group">
              <label>Event Date</label>
              <input
                type="datetime-local"
                name="event_date"
                value={formData.event_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Original Price (₹)</label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Selling Price (₹)</label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {suggestedPrice && (
            <div className="suggested-price">
              💡 AI Suggested: ₹{suggestedPrice}
            </div>
          )}

          <div className="form-group">
            <label>Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Seat Number</label>
              <input
                type="text"
                name="seat_number"
                value={formData.seat_number}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
              />
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Ticket'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
