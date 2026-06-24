import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFetch } from '../hooks/useFetch';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import SearchSection from '../components/SearchSection';
import TicketCard from '../components/TicketCard';
import UploadModal from '../components/UploadModal';
import Loader from '../components/Loader';
import * as ticketService from '../services/ticketService';
import * as requestService from '../services/requestService';
import '../styles/pages.css';

const HomePage = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    loadTickets();
  }, [filters]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets(filters);
      setTickets(data);
    } catch (error) {
      console.error('Failed to load tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTicket = async (ticketId) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const offeredPrice = prompt('Enter your offer:');
    if (offeredPrice) {
      try {
        await requestService.createRequest(ticketId, parseFloat(offeredPrice));
        alert('Request sent successfully!');
      } catch (error) {
        alert('Failed to send request: ' + error.message);
      }
    }
  };

  return (
    <div className="home-page">
      <Hero 
        onBrowseClick={() => window.scrollTo({ top: 400, behavior: 'smooth' })}
        onSellClick={() => setShowUploadModal(true)}
        isAuthenticated={!!user}
      />
      
      <Stats />
      
      <SearchSection onFiltersChange={setFilters} />

      {loading ? (
        <Loader />
      ) : (
        <div className="tickets-grid">
          {tickets.length === 0 ? (
            <p className="no-tickets">No tickets available</p>
          ) : (
            tickets.map(ticket => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onRequest={handleRequestTicket}
              />
            ))
          )}
        </div>
      )}

      {user?.role === 'seller' && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={loadTickets}
        />
      )}
    </div>
  );
};

export default HomePage;
