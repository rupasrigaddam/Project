import { useState, useEffect } from 'react';
import './Notifications.css';

function Notifications({ onNavigate }) {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'delay',
      title: 'Bus Delay Alert',
      message: 'Bus #101 is running 10 minutes late due to traffic.',
      time: '5 mins ago',
      read: false
    },
    {
      id: 2,
      type: 'arrival',
      title: 'Bus Arriving Soon',
      message: 'Bus #102 will arrive at your stop in 5 minutes.',
      time: '15 mins ago',
      read: false
    },
    {
      id: 3,
      type: 'schedule',
      title: 'Schedule Update',
      message: 'Tomorrow\'s morning schedule has been updated. Check the new timings.',
      time: '1 hour ago',
      read: true
    },
    {
      id: 4,
      type: 'maintenance',
      title: 'Maintenance Notice',
      message: 'Bus #103 will be under maintenance on November 5th. Alternative arrangements made.',
      time: '2 hours ago',
      read: true
    },
    {
      id: 5,
      type: 'route',
      title: 'Route Change',
      message: 'Route B will have a temporary diversion near the library due to construction.',
      time: '3 hours ago',
      read: true
    }
  ]);

  const [filter, setFilter] = useState('all');

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(notif => !notif.read);
    }
    return notifications;
  };

  const getIcon = (type) => {
    const icons = {
      delay: '⏰',
      arrival: '🚌',
      schedule: '📅',
      maintenance: '🔧',
      route: '🗺️'
    };
    return icons[type] || '🔔';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notification-stats">
          <span className="unread-badge">{unreadCount} unread</span>
        </div>
      </div>

      <div className="notifications-container">
        <div className="notifications-toolbar">
          <div className="filter-buttons">
            <button 
              className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('all')}
            >
              All Notifications
            </button>
            <button 
              className={filter === 'unread' ? 'filter-btn active' : 'filter-btn'}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <button className="mark-all-btn" onClick={markAllAsRead}>
            Mark All as Read
          </button>
        </div>

        <div className="notifications-list">
          {getFilteredNotifications().length === 0 ? (
            <div className="no-notifications">
              <div className="no-notif-icon">🔔</div>
              <h3>No notifications</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            getFilteredNotifications().map(notification => (
              <div 
                key={notification.id} 
                className={notification.read ? 'notification-item read' : 'notification-item'}
              >
                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{notification.title}</h3>
                    <span className="notification-time">{notification.time}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button 
                        className="action-btn"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="notification-settings">
        <h2>Notification Preferences</h2>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h3>Bus Arrival Alerts</h3>
              <p>Get notified when your bus is approaching</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Delay Notifications</h3>
              <p>Receive alerts about bus delays</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Schedule Changes</h3>
              <p>Stay updated with schedule modifications</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Route Updates</h3>
              <p>Get notified about route changes</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" defaultChecked />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;