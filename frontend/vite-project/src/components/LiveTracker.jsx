import { useState, useEffect } from 'react';
import axios from 'axios';
import './LiveTracker.css';

const API_URL = 'http://localhost:5000/api';

function LiveTracker({ onNavigate }) {
  const [buses, setBuses] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBus, setSelectedBus] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchBusesByCity();
    } else {
      fetchAllBuses();
    }
  }, [selectedCity]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const citiesRes = await axios.get(`${API_URL}/cities`, { headers });
      setCities(citiesRes.data);
      fetchAllBuses();
    } catch (err) {
      setError('Failed to fetch data');
    }
  };

  const fetchAllBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const busesRes = await axios.get(`${API_URL}/buses`, { headers });
      setBuses(busesRes.data);
    } catch (err) {
      setError('Failed to fetch buses');
    }
  };

  const fetchBusesByCity = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const busesRes = await axios.get(`${API_URL}/buses`, { headers });
      const filtered = busesRes.data.filter(bus => bus.fromCity === selectedCity);
      setBuses(filtered);
    } catch (err) {
      setError('Failed to fetch buses for selected city');
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
        },
        (err) => {
          console.error('Error getting location:', err);
          setUserLocation({ latitude: 16.4419, longitude: 80.5189 });
        }
      );
    } else {
      setUserLocation({ latitude: 16.4419, longitude: 80.5189 });
    }
  };

  const handleBusClick = async (bus) => {
    if (!userLocation) {
      setError('Unable to get your location. Please enable location services.');
      return;
    }

    setLoading(true);
    setError('');
    setSelectedBus(bus);

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.post(
        `${API_URL}/buses/track`,
        {
          busNumber: bus.busNumber,
          userLatitude: userLocation.latitude,
          userLongitude: userLocation.longitude
        },
        { headers }
      );

      setTrackingData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to track bus');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (speed) => {
    if (speed === 0) return '#e74c3c';
    if (speed < 30) return '#f39c12';
    return '#2ecc71';
  };

  const getStatusText = (speed) => {
    if (speed === 0) return 'Stopped';
    if (speed < 30) return 'Slow';
    return 'Moving';
  };

  return (
    <div className="live-tracker">
      <div className="tracker-header">
        <h1>🚌 Live Bus Tracker</h1>
        <p>Track buses from different cities in real-time</p>
      </div>

      <div className="tracker-main">
        <div className="tracker-sidebar">
          <div className="filter-section">
            <h3>Filter by City</h3>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setSelectedBus(null);
                setTrackingData(null);
              }}
              className="city-filter"
            >
              <option value="">All Cities ({buses.length} buses)</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="buses-list">
            <h3>Available Buses</h3>
            {error && <div className="error-message">{error}</div>}
            
            {buses.length === 0 ? (
              <div className="no-buses">No buses available</div>
            ) : (
              <div className="bus-cards">
                {buses.map(bus => (
                  <div
                    key={bus._id}
                    className={`bus-card ${selectedBus?.busNumber === bus.busNumber ? 'selected' : ''}`}
                    onClick={() => handleBusClick(bus)}
                  >
                    <div className="bus-card-header">
                      <div className="bus-number-badge">{bus.busNumber}</div>
                      <div 
                        className="bus-status"
                        style={{ backgroundColor: getStatusColor(bus.currentSpeed) }}
                      >
                        {getStatusText(bus.currentSpeed)}
                      </div>
                    </div>
                    <div className="bus-card-body">
                      <div className="bus-route">
                        <span className="route-icon">📍</span>
                        <span>{bus.fromCity} → {bus.toCity}</span>
                      </div>
                      <div className="bus-info-row">
                        <span className="info-label">Route:</span>
                        <span className="info-value">{bus.route}</span>
                      </div>
                      <div className="bus-info-row">
                        <span className="info-label">Speed:</span>
                        <span className="info-value">{bus.currentSpeed} km/h</span>
                      </div>
                      <div className="bus-info-row">
                        <span className="info-label">Driver:</span>
                        <span className="info-value">{bus.driverName}</span>
                      </div>
                    </div>
                    <div className="bus-card-footer">
                      <small>Last updated: {new Date(bus.lastUpdated).toLocaleTimeString()}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="tracker-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner">🔄</div>
              <p>Tracking bus...</p>
            </div>
          ) : trackingData ? (
            <>
              <div className="tracking-details">
                <h2>🎯 Tracking: {trackingData.bus.busNumber}</h2>
                
                <div className="detail-cards">
                  <div className="detail-card primary">
                    <div className="card-icon">🚌</div>
                    <div className="card-content">
                      <h3>Bus Information</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Route:</span>
                          <span className="value">{trackingData.bus.route}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">From:</span>
                          <span className="value">{trackingData.bus.fromCity}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">To:</span>
                          <span className="value">{trackingData.bus.toCity}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Speed:</span>
                          <span className="value">{trackingData.bus.currentSpeed} km/h</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-card">
                    <div className="card-icon">👨‍✈️</div>
                    <div className="card-content">
                      <h3>Driver Details</h3>
                      <div className="info-grid">
                        <div className="info-item">
                          <span className="label">Name:</span>
                          <span className="value">{trackingData.bus.driverName}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Contact:</span>
                          <span className="value">{trackingData.bus.driverPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="distance-cards">
                  <div className="distance-card arrival">
                    <div className="distance-icon">⏱️</div>
                    <div className="distance-info">
                      <h4>Arrival Time to You</h4>
                      <div className="distance-value">
                        {trackingData.estimatedArrivalToUser} mins
                      </div>
                      <p className="distance-label">
                        {trackingData.distanceFromUser} km away
                      </p>
                    </div>
                  </div>

                  <div className="distance-card destination">
                    <div className="distance-icon">🎯</div>
                    <div className="distance-info">
                      <h4>Arrival to Destination</h4>
                      <div className="distance-value">
                        {trackingData.estimatedArrivalToDestination} mins
                      </div>
                      <p className="distance-label">
                        {trackingData.distanceToDestination} km remaining
                      </p>
                    </div>
                  </div>
                </div>

                <div className="map-visualization">
                  <h3>📍 Location Details</h3>
                  <div className="location-grid">
                    <div className="location-card">
                      <h4>🚌 Bus Location</h4>
                      <p>Lat: {trackingData.bus.currentLocation.latitude.toFixed(4)}</p>
                      <p>Lng: {trackingData.bus.currentLocation.longitude.toFixed(4)}</p>
                    </div>
                    <div className="location-card">
                      <h4>📍 Your Location</h4>
                      <p>Lat: {trackingData.userLocation.latitude.toFixed(4)}</p>
                      <p>Lng: {trackingData.userLocation.longitude.toFixed(4)}</p>
                    </div>
                    <div className="location-card">
                      <h4>🎯 Destination</h4>
                      <p>Lat: {trackingData.bus.destination.latitude.toFixed(4)}</p>
                      <p>Lng: {trackingData.bus.destination.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                </div>

                <div className="map-placeholder">
                  <div className="map-content">
                    <h3>🗺️ Interactive Map View</h3>
                    <p>Bus is currently traveling from {trackingData.bus.fromCity} to {trackingData.bus.toCity}</p>
                    <div className="map-markers">
                      <div className="marker-item">
                        <span className="marker-icon">🚌</span>
                        <span>Bus Location</span>
                      </div>
                      <div className="marker-item">
                        <span className="marker-icon">📍</span>
                        <span>Your Location</span>
                      </div>
                      <div className="marker-item">
                        <span className="marker-icon">🎯</span>
                        <span>University</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-selection">
              <div className="no-selection-icon">🚌</div>
              <h3>Select a Bus to Track</h3>
              <p>Click on any bus from the list to see its live location and estimated arrival time</p>
              <div className="instructions">
                <div className="instruction-item">
                  <span className="step">1</span>
                  <p>Choose a city or view all buses</p>
                </div>
                <div className="instruction-item">
                  <span className="step">2</span>
                  <p>Click on a bus card to track it</p>
                </div>
                <div className="instruction-item">
                  <span className="step">3</span>
                  <p>View real-time location and arrival time</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveTracker;