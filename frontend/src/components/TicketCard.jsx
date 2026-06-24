import React from 'react';
import '../styles/ticket-card.css';

const TicketCard = ({ ticket, onRequest }) => {
  const isUrgent = ticket.event_date && 
    (new Date(ticket.event_date) - new Date()) / (1000 * 60 * 60) < 24;

  return (
    <div className="ticket-card">
      {ticket.image_path && (
        <div className="ticket-image">
          <img src={ticket.image_path} alt={ticket.event_name} />
        </div>
      )}
      
      <div className="ticket-content">
        <div className="ticket-badges">
          {ticket.verified && <span className="badge badge-verified">✓ Verified</span>}
          {isUrgent && <span className="badge badge-urgent">🔥 Urgent</span>}
        </div>

        <h3>{ticket.event_name}</h3>
        <p className="event-type">{ticket.event_type}</p>
        
        <div className="ticket-details">
          <span>📅 {new Date(ticket.event_date).toLocaleDateString()}</span>
          <span>📍 {ticket.event_location}</span>
        </div>

        <div className="ticket-seller">
          <p>By: {ticket.seller_name}</p>
          <span className="seller-rating">⭐ {ticket.seller_rating?.toFixed(1) || 'N/A'}</span>
        </div>

        <div className="ticket-pricing">
          <div>
            <span className="original-price">₹{ticket.original_price}</span>
            <span className="selling-price">₹{ticket.selling_price}</span>
          </div>
          <span className="heat-score">Heat: {ticket.heat_score}</span>
        </div>

        <button 
          className="btn btn-primary btn-block"
          onClick={() => onRequest(ticket.id)}
        >
          Request to Buy
        </button>
      </div>
    </div>
  );
};

export default TicketCard;
