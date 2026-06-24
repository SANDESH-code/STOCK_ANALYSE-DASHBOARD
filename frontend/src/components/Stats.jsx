import React from 'react';
import { useFetch } from '../hooks/useFetch';
import '../styles/stats.css';

const Stats = () => {
  const { data: stats } = useFetch('/api/tickets/stats');

  return (
    <section className="stats">
      <h2>TicketBridge Stats</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.total_tickets || 0}</h3>
          <p>Total Tickets</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.available_tickets || 0}</h3>
          <p>Available</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.sold_tickets || 0}</h3>
          <p>Sold</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;
