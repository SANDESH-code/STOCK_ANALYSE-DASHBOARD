import React from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/navbar.css';

const Navbar = ({ theme, onThemeChange }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand">
          <h1>🎫 TicketBridge</h1>
        </div>

        <div className="nav-center">
          <a href="/">Browse</a>
          {user?.role === 'seller' && <a href="/seller/dashboard">Dashboard</a>}
        </div>

        <div className="nav-right">
          <button className="theme-btn" onClick={onThemeChange}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user ? (
            <div className="nav-user">
              <span>{user.name}</span>
              <button onClick={logout} className="btn-secondary btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <a href="/login" className="btn-secondary btn-sm">Login</a>
              <a href="/signup" className="btn-primary btn-sm">Sign Up</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
