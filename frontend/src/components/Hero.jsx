import React from 'react';
import '../styles/hero.css';

const Hero = ({ onSellClick, onBrowseClick, isAuthenticated }) => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Don't Waste Tickets. Resell Them Instantly.</h1>
        <p>Join thousands of users buying and selling tickets safely</p>
        
        <div className="hero-buttons">
          <button className="btn btn-primary" onClick={onBrowseClick}>
            👀 Browse Tickets
          </button>
          {isAuthenticated ? (
            <button className="btn btn-secondary" onClick={onSellClick}>
              📤 Sell Tickets
            </button>
          ) : (
            <a href="/signup?role=seller" className="btn btn-secondary">
              📤 Start Selling
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
