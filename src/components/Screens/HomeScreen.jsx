import React, { useState, useEffect } from 'react';
import './HomeScreen.css';
import MapScreen from "./MapScreen";
import { getCurrentUser } from "../../services/localAuth";


const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState(null);
  const [safeZoneStatus, setSafeZoneStatus] = useState('unknown');
   const [me, setMe] = useState(null);


   useEffect(() => {
    setMe(getCurrentUser());
  }, []);

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
      case 'safe': return 'You are in safe zone';
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
         {/* Only caregivers see MapScreen */}
        {me?.role === "caregiver" && (
          <div className="map-wrapper">
            <MapScreen />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;