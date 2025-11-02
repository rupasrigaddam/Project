import { useState, useEffect } from 'react';
import axios from 'axios';
import './BusSchedule.css';

const API_URL = 'http://localhost:5000/api';

function BusSchedule({ onNavigate }) {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [areas, setAreas] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterBuses();
  }, [selectedRoute, selectedArea, selectedDay, buses]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [busesRes, areasRes, routesRes] = await Promise.all([
        axios.get(`${API_URL}/buses`, { headers }),
        axios.get(`${API_URL}/areas`, { headers }),
        axios.get(`${API_URL}/routes`, { headers })
      ]);

      setBuses(busesRes.data);
      setFilteredBuses(busesRes.data);
      setAreas(areasRes.data);
      setRoutes(routesRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch bus data');
      setLoading(false);
    }
  };

  const filterBuses = () => {
    let filtered = [...buses];

    if (selectedRoute) {
      filtered = filtered.filter(bus => bus.route === selectedRoute);
    }

    if (selectedArea) {
      filtered = filtered.filter(bus => bus.area === selectedArea);
    }

    setFilteredBuses(filtered);
  };

  const getUniqueRoutes = () => {
    return [...new Set(buses.map(bus => bus.route))];
  };

  const handleViewDetails = (busNumber) => {
    alert(`View details for bus ${busNumber}`);
  };

  if (loading) {
    return <div className="loading">Loading bus schedule...</div>;
  }

  return (
    <div className="bus-schedule">
      <div className="schedule-header">
        <h1>Bus Schedule</h1>
      </div>

      <div className="schedule-container">
        <aside className="filters-sidebar">
          <h2>Filters</h2>
          
          <div className="filter-group">
            <h3>Routes</h3>
            <div className="filter-options">
              {getUniqueRoutes().map(route => (
                <label key={route} className="filter-checkbox">
                  <input
                    type="radio"
                    name="route"
                    value={route}
                    checked={selectedRoute === route}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                  />
                  <span>Route {route}</span>
                </label>
              ))}
              {selectedRoute && (
                <button 
                  className="clear-filter"
                  onClick={() => setSelectedRoute('')}
                >
                  Clear Route Filter
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <h3>Areas</h3>
            <div className="filter-options">
              {areas.map(area => (
                <label key={area} className="filter-checkbox">
                  <input
                    type="radio"
                    name="area"
                    value={area}
                    checked={selectedArea === area}
                    onChange={(e) => setSelectedArea(e.target.value)}
                  />
                  <span>{area}</span>
                </label>
              ))}
              {selectedArea && (
                <button 
                  className="clear-filter"
                  onClick={() => setSelectedArea('')}
                >
                  Clear Area Filter
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <h3>Days</h3>
            <div className="filter-options">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                <label key={day} className="filter-checkbox">
                  <input
                    type="radio"
                    name="day"
                    value={day}
                    checked={selectedDay === day}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  />
                  <span>{day}</span>
                </label>
              ))}
              {selectedDay && (
                <button 
                  className="clear-filter"
                  onClick={() => setSelectedDay('')}
                >
                  Clear Day Filter
                </button>
              )}
            </div>
          </div>
        </aside>

        <div className="schedule-content">
          <h2>Bus Schedule</h2>
          {error && <div className="error-message">{error}</div>}
          
          {filteredBuses.length === 0 ? (
            <div className="no-buses">No buses found matching your filters</div>
          ) : (
            <div className="schedule-table">
              <table>
                <thead>
                  <tr>
                    <th>Bus No</th>
                    <th>Route</th>
                    <th>Area</th>
                    <th>Departure Time</th>
                    <th>Info</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map((bus, index) => (
                    <tr key={bus._id}>
                      <td>{bus.busNumber}</td>
                      <td>{bus.route}</td>
                      <td>{bus.area}</td>
                      <td>{`0${8 + (index % 3)}:${index % 2 === 0 ? '00' : '30'} AM`}</td>
                      <td>
                        <button 
                          className="details-btn"
                          onClick={() => handleViewDetails(bus.busNumber)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <footer className="schedule-footer">
        <p>© 2023 VignanBusTracker. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Help</a>
        </div>
      </footer>
    </div>
  );
}

export default BusSchedule;