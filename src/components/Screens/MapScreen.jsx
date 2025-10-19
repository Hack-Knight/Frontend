import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapScreen.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom icon for safe zone center
const safeZoneIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapScreen = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [safeZones, setSafeZones] = useState([
    {
      id: 1,
      name: 'Home',
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 100
    },
    {
      id: 2,
      name: 'Work',
      latitude: 40.7589,
      longitude: -73.9851,
      radius: 150
    }
  ]);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: 100
  });
  const [alert, setAlert] = useState(null);

  // Default map center (New York)
  const defaultCenter = [40.7128, -74.0060];

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          checkSafeZoneStatus(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          setAlert({
            type: 'error',
            message: 'Unable to get your location. Please enable location services.'
          });
        }
      );
    }
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  // Check if user is in any safe zone
  const checkSafeZoneStatus = (location) => {
    if (!location) return;

    for (const zone of safeZones) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        zone.latitude,
        zone.longitude
      );

      if (distance <= zone.radius) {
        setAlert({
          type: 'success',
          message: `You are in the "${zone.name}" safe zone`
        });
        return;
      }
    }

    // User is not in any safe zone
    setAlert({
      type: 'warning',
      message: 'You are outside all safe zones'
    });
  };

  const handleAddZone = (e) => {
    e.preventDefault();
    if (newZone.name && newZone.latitude && newZone.longitude) {
      const zone = {
        id: Date.now(),
        name: newZone.name,
        latitude: parseFloat(newZone.latitude),
        longitude: parseFloat(newZone.longitude),
        radius: parseInt(newZone.radius)
      };
      setSafeZones([...safeZones, zone]);
      setNewZone({ name: '', latitude: '', longitude: '', radius: 100 });
      setShowAddZone(false);
      setAlert({
        type: 'success',
        message: `Safe zone "${zone.name}" added successfully`
      });
    }
  };

  const handleDeleteZone = (zoneId) => {
    setSafeZones(safeZones.filter(zone => zone.id !== zoneId));
    setAlert({
      type: 'info',
      message: 'Safe zone removed'
    });
  };

  const mapCenter = userLocation ? [userLocation.latitude, userLocation.longitude] : defaultCenter;

  return (
    <div className="screen-container">
      <div className="map-screen">
        <div className="map-header">
          <h1>Safety Map</h1>
          <div className="map-controls">
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddZone(!showAddZone)}
            >
              Add Safe Zone
            </button>
          </div>
        </div>

        {/* Alert */}
        {alert && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
            <button 
              className="alert-close"
              onClick={() => setAlert(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Add Zone Form */}
        {showAddZone && (
          <div className="card add-zone-form">
            <h3>Add New Safe Zone</h3>
            <form onSubmit={handleAddZone}>
              <div className="form-group">
                <label>Zone Name</label>
                <input
                  type="text"
                  value={newZone.name}
                  onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                  placeholder="e.g., Home, Work, School"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newZone.latitude}
                    onChange={(e) => setNewZone({...newZone, latitude: e.target.value})}
                    placeholder="40.7128"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newZone.longitude}
                    onChange={(e) => setNewZone({...newZone, longitude: e.target.value})}
                    placeholder="-74.0060"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Radius (meters)</label>
                <input
                  type="number"
                  value={newZone.radius}
                  onChange={(e) => setNewZone({...newZone, radius: e.target.value})}
                  min="50"
                  max="1000"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">Add Zone</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAddZone(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Map Container */}
        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            {userLocation && (
              <Marker 
                position={[userLocation.latitude, userLocation.longitude]}
                icon={userLocationIcon}
              >
                <Popup>
                  <strong>Your Location</strong><br />
                  Lat: {userLocation.latitude.toFixed(6)}<br />
                  Lng: {userLocation.longitude.toFixed(6)}
                </Popup>
              </Marker>
            )}

            {/* Safe Zone Markers and Circles */}
            {safeZones.map((zone) => (
              <React.Fragment key={zone.id}>
                <Circle
                  center={[zone.latitude, zone.longitude]}
                  radius={zone.radius}
                  fillColor="blue"
                  fillOpacity={0.2}
                  color="blue"
                  weight={2}
                />
                <Marker 
                  position={[zone.latitude, zone.longitude]}
                  icon={safeZoneIcon}
                >
                  <Popup>
                    <div className="zone-popup">
                      <strong>{zone.name}</strong><br />
                      Radius: {zone.radius}m<br />
                      <button 
                        className="btn btn-danger btn-small"
                        onClick={() => handleDeleteZone(zone.id)}
                      >
                        Remove Zone
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {/* Safe Zones List */}
        <div className="card safe-zones-list">
          <h3>Your Safe Zones</h3>
          {safeZones.length === 0 ? (
            <p className="no-zones">No safe zones configured. Add one above to get started.</p>
          ) : (
            <div className="zones-grid">
              {safeZones.map((zone) => (
                <div key={zone.id} className="zone-card">
                  <div className="zone-info">
                    <h4>{zone.name}</h4>
                    <p>Radius: {zone.radius}m</p>
                    <p className="zone-coords">
                      {zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}
                    </p>
                  </div>
                  <button 
                    className="btn btn-danger btn-small"
                    onClick={() => handleDeleteZone(zone.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapScreen;