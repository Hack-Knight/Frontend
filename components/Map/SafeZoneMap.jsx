import React, { useState, useEffect } from 'react';
import NotificationCard from '../Alerts/NotificationCard';

const SafeZoneMap = ({ userLocation, safeZoneCenter, safeZoneRadius }) => {
  const [alert, setAlert] = useState(null);

  // Calculate distance between user and safe zone
  const getDistance = (loc1, loc2) => {
    const R = 6371e3; // meters
    const lat1 = loc1.lat * Math.PI / 180;
    const lat2 = loc2.lat * Math.PI / 180;
    const deltaLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const deltaLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
  };

  useEffect(() => {
    if (!userLocation || !safeZoneCenter) return;
    const distance = getDistance(userLocation, safeZoneCenter);

    if (distance > safeZoneRadius) {
      setAlert({
        type: 'SOS',
        message: 'User has exited the safe zone!',
        time: 'Just now',
      });
    } else if (alert?.type === 'SOS' && distance <= safeZoneRadius) {
      setAlert({
        type: 'SafeZone',
        message: 'User returned to the safe zone.',
        time: 'Just now',
      });
    }
  }, [userLocation]);

  return (
    <div className="relative">
      {/* Google Map here */}
      {alert && (
        <div className="absolute top-4 right-4 z-50">
          <NotificationCard
            type={alert.type}
            message={alert.message}
            time={alert.time}
          />
        </div>
      )}
    </div>
  );
};

export default SafeZoneMap;
