import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as ticketService from '../services/ticketService';
import * as requestService from '../services/requestService';
import UploadModal from '../components/UploadModal';
import '../styles/dashboard.css';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, ticketsData, requestsData] = await Promise.all([
        ticketService.getDashboardStats(),
        ticketService.getSellerTickets(),
        requestService.getReceivedRequests()
      ]);
      setStats(statsData);
      setTickets(ticketsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (window.confirm('Delete this ticket?')) {
      try {
        await ticketService.deleteTicket(id);
        setTickets(tickets.filter(t => t.id !== id));
      } catch (error) {
        alert('Failed to delete: ' + error.message);
      }
    }
  };

  const handleUpdateRequest = async (id, status) => {
    try {
      await requestService.updateRequestStatus(id, status);
      await loadDashboard();
    } catch (error) {
      alert('Failed to update: ' + error.message);
    }
  };

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Seller Dashboard</h1>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          + Upload Ticket
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <h3>{stats?.total_tickets || 0}</h3>
          <p>Total Tickets</p>
        </div>
        <div className="stat-box">
          <h3>{stats?.available_tickets || 0}</h3>
          <p>Available</p>
        </div>
        <div className="stat-box">
          <h3>{stats?.sold_tickets || 0}</h3>
          <p>Sold</p>
        </div>
      </div>

      <section className="section">
        <h2>Your Tickets</h2>
        {tickets.length === 0 ? (
          <p>No tickets yet</p>
        ) : (
          <table className="tickets-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.event_name}</td>
                  <td>{new Date(ticket.event_date).toLocaleDateString()}</td>
                  <td>₹{ticket.selling_price}</td>
                  <td>{ticket.status}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteTicket(ticket.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section">
        <h2>Purchase Requests ({requests.length})</h2>
        {requests.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <div className="requests-list">
            {requests.map(req => (
              <div key={req.id} className="request-card">
                <div>
                  <h4>{req.event_name}</h4>
                  <p>From: {req.buyer_name}</p>
                  <p>Offered: ₹{req.offered_price}</p>
                </div>
                <div className="request-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleUpdateRequest(req.id, 'Accepted')}
                  >
                    Accept
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleUpdateRequest(req.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={loadDashboard}
      />
    </div>
  );
};

export default SellerDashboard;
