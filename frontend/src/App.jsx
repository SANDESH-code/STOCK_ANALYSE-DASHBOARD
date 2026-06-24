import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SellerDashboard from './pages/SellerDashboard';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';
import './styles/responsive.css';

const ProtectedRoute = ({ element, requiredRole }) => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" />;
  }

  return element;
};

function App() {
  const [theme, setTheme] = React.useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  React.useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Navbar theme={theme} onThemeChange={toggleTheme} />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/seller/dashboard" 
            element={<ProtectedRoute element={<SellerDashboard />} requiredRole="seller" />} 
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
