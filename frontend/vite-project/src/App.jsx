import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Homepage from './components/Homepage';
import BusSchedule from './components/BusSchedule';
import LiveTracker from './components/LiveTracker';
import Notifications from './components/Notifications';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
      setCurrentPage('home');
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setCurrentPage('login');
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      if (currentPage === 'register') {
        return <Register onSwitchToLogin={() => setCurrentPage('login')} onRegister={handleLogin} />;
      }
      return <Login onSwitchToRegister={() => setCurrentPage('register')} onLogin={handleLogin} />;
    }

    switch (currentPage) {
      case 'home':
        return <Homepage user={user} onNavigate={setCurrentPage} />;
      case 'schedule':
        return <BusSchedule onNavigate={setCurrentPage} />;
      case 'tracker':
        return <LiveTracker onNavigate={setCurrentPage} />;
      case 'notifications':
        return <Notifications onNavigate={setCurrentPage} />;
      default:
        return <Homepage user={user} onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {isAuthenticated && (
        <nav className="navbar">
          <div className="nav-brand">
            <span className="bus-icon">🚌</span>
            <span className="brand-name">VignanBusTracker</span>
          </div>
          <div className="nav-links">
            <button 
              className={currentPage === 'home' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('home')}
            >
              Home
            </button>
            <button 
              className={currentPage === 'schedule' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('schedule')}
            >
              Bus Schedule
            </button>
            <button 
              className={currentPage === 'tracker' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('tracker')}
            >
              Live Tracker
            </button>
            <button 
              className={currentPage === 'notifications' ? 'nav-link active' : 'nav-link'}
              onClick={() => setCurrentPage('notifications')}
            >
              Notifications
            </button>
            <button className="nav-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </nav>
      )}
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;