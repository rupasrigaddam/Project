import './Homepage.css';

function Homepage({ user, onNavigate }) {
  return (
    <div className="homepage">
      <div className="hero-section">
        <h1>Welcome to the Vignan University Bus Tracking System</h1>
        <p className="hero-subtitle">
          Welcome back, <span className="user-name">{user?.name}</span>!
        </p>
        <p className="hero-description">
          Experience seamless and efficient bus tracking with our advanced system.
        </p>
      </div>

      <div className="image-grid">
        <div className="grid-item">
          <div className="bus-image">
            <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&h=400&fit=crop" alt="University Bus" />
          </div>
        </div>
        <div className="grid-item">
          <div className="campus-image">
            <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=500&h=400&fit=crop" alt="Campus View" />
          </div>
        </div>
      </div>

      <div className="benefits-section">
        <h2>Benefits of Our Service</h2>
        <div className="benefits-list">
          <div className="benefit-item">
            <span className="benefit-icon">⏱️</span>
            <p>Real-time bus tracking to ensure timely arrivals.</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">🔒</span>
            <p>Enhanced safety and security features.</p>
          </div>
          <div className="benefit-item">
            <span className="benefit-icon">👤</span>
            <p>User-friendly interface for easy navigation.</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-cards">
          <div className="action-card" onClick={() => onNavigate('tracker')}>
            <div className="action-icon">📍</div>
            <h3>Track Bus</h3>
            <p>Find your bus location in real-time</p>
          </div>
          <div className="action-card" onClick={() => onNavigate('schedule')}>
            <div className="action-icon">📅</div>
            <h3>View Schedule</h3>
            <p>Check bus timings and routes</p>
          </div>
          <div className="action-card" onClick={() => onNavigate('notifications')}>
            <div className="action-icon">🔔</div>
            <h3>Notifications</h3>
            <p>Stay updated with alerts</p>
          </div>
        </div>
      </div>

      <footer className="homepage-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: support@example.com</p>
            <p>Phone: +123 456 7890</p>
          </div>
          <div className="footer-section">
            <h3>Address</h3>
            <p>Vignan University, Guntur, India</p>
          </div>
          <div className="footer-social">
            <a href="#" className="social-icon">📘</a>
            <a href="#" className="social-icon">🐦</a>
            <a href="#" className="social-icon">📷</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Homepage;