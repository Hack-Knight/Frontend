import React, { useState, useEffect } from 'react';
import './HomeScreen.css';

const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [safeZoneStatus, setSafeZoneStatus] = useState('unknown');

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setSafeZoneStatus('safe'); // Mock status
        },
        (error) => {
          console.error('Error getting location:', error);
          setSafeZoneStatus('error');
        }
      );
    }

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getStatusColor = () => {
    switch (safeZoneStatus) {
      case 'safe': return '#28a745';
      case 'warning': return '#ffc107';
      case 'danger': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (safeZoneStatus) {
      case 'safe': return 'You are in a safe zone';
      case 'warning': return 'Approaching safe zone boundary';
      case 'danger': return 'Outside safe zone';
      case 'error': return 'Unable to determine location';
      default: return 'Checking location...';
    }
  };

  return (
    <div className="screen-container">
      <div className="home-screen">
        {/* Welcome Header */}
        <div className="welcome-section">
          <h1 className="greeting">{getGreeting()}!</h1>
          <p className="current-time">
            {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Status Card */}
        <div className="card status-card">
          <div className="status-indicator">
            <div 
              className="status-dot"
              style={{ backgroundColor: getStatusColor() }}
            ></div>
            <h2 className="status-title">Safety Status</h2>
          </div>
          <p className="status-text" style={{ color: getStatusColor() }}>
            {getStatusText()}
          </p>
          {userLocation && (
            <div className="location-info">
              <small>
                Lat: {userLocation.latitude.toFixed(6)}, 
                Lng: {userLocation.longitude.toFixed(6)}
              </small>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-grid">
            <button className="action-btn btn-primary">
              <img src="/assets/icons/map.png" alt="Map" className="action-icon" />
              View Map
            </button>
            <button className="action-btn btn-danger">
              <img src="/assets/icons/mic.png" alt="SOS" className="action-icon" />
              Emergency SOS
            </button>
            <button className="action-btn btn-secondary">
              <img src="/assets/icons/people.png" alt="Contacts" className="action-icon" />
              Emergency Contacts
            </button>
            <button className="action-btn btn-secondary">
              <img src="/assets/icons/home.png" alt="Safe Zone" className="action-icon" />
              Add Safe Zone
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon safe">✓</div>
              <div className="activity-content">
                <p className="activity-title">Entered Safe Zone</p>
                <p className="activity-time">2 minutes ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon info">i</div>
              <div className="activity-content">
                <p className="activity-title">Location updated</p>
                <p className="activity-time">5 minutes ago</p>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-icon warning">!</div>
              <div className="activity-content">
                <p className="activity-title">Battery low warning</p>
                <p className="activity-time">1 hour ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Button */}
        <div className="emergency-section">
          <button className="emergency-btn">
            <span className="emergency-text">EMERGENCY</span>
            <span className="emergency-subtext">Tap and hold for 3 seconds</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;