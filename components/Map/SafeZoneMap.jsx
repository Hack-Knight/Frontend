import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import NotificationCard from '../Alerts/NotificationCard';
import locationService from '../../services/locationService';
//commit
const SafeZoneMap = ({ 
  userLocation, 
  safeZoneCenter, 
  safeZoneRadius = 100,
  onLocationUpdate,
  showUserLocation = true 
}) => {
  const [alert, setAlert] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  // Calculate distance between user and safe zone using locationService
  const getDistance = (loc1, loc2) => {
    if (!loc1 || !loc2) return 0;
    return locationService.calculateDistance(
      loc1.latitude, 
      loc1.longitude, 
      loc2.latitude, 
      loc2.longitude
    );
  };

  // Handle location updates
  useEffect(() => {
    const unsubscribe = locationService.addLocationListener((location) => {
      setCurrentLocation(location);
      if (onLocationUpdate) {
        onLocationUpdate(location);
      }
    });

    return unsubscribe;
  }, [onLocationUpdate]);

  // Monitor safe zone status
  useEffect(() => {
    if (!currentLocation || !safeZoneCenter) return;

    const distance = getDistance(currentLocation, safeZoneCenter);

    if (distance > safeZoneRadius) {
      const newAlert = {
        type: 'SOS',
        message: 'User has exited the safe zone!',
        time: 'Just now',
        distance: Math.round(distance),
      };
      
      setAlert(newAlert);
      
      // Show native alert
      Alert.alert(
        'Safe Zone Alert',
        `You have left your safe zone! You are ${Math.round(distance)}m away.`,
        [{ text: 'OK' }]
      );
    } else if (alert?.type === 'SOS' && distance <= safeZoneRadius) {
      const returnAlert = {
        type: 'SafeZone',
        message: 'User returned to the safe zone.',
        time: 'Just now',
      };
      
      setAlert(returnAlert);
      
      // Show return alert
      Alert.alert(
        'Safe Zone Alert',
        'Welcome back! You have returned to your safe zone.',
        [{ text: 'OK' }]
      );
    }
  }, [currentLocation, safeZoneCenter, safeZoneRadius, alert]);

  // Default region for map
  const getMapRegion = () => {
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else if (safeZoneCenter) {
      return {
        latitude: safeZoneCenter.latitude,
        longitude: safeZoneCenter.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    } else {
      // Default to a general location
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={getMapRegion()}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        toolbarEnabled={false}
      >
        {/* Safe Zone Circle */}
        {safeZoneCenter && (
          <>
            <Circle
              center={{
                latitude: safeZoneCenter.latitude,
                longitude: safeZoneCenter.longitude,
              }}
              radius={safeZoneRadius}
              strokeColor="rgba(0, 150, 255, 0.8)"
              fillColor="rgba(0, 150, 255, 0.2)"
              strokeWidth={2}
            />
            
            {/* Safe Zone Center Marker */}
            <Marker
              coordinate={{
                latitude: safeZoneCenter.latitude,
                longitude: safeZoneCenter.longitude,
              }}
              title="Safe Zone Center"
              description={`Radius: ${safeZoneRadius}m`}
              pinColor="blue"
            />
          </>
        )}

        {/* Current Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
            title="Your Location"
            description="Current position"
            pinColor="red"
          />
        )}
      </MapView>

      {/* Alert Notification */}
      {alert && (
        <View style={styles.alertContainer}>
          <NotificationCard
            type={alert.type}
            message={alert.message}
            time={alert.time}
            distance={alert.distance}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  alertContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000, // For Android
  },
});

export default SafeZoneMap;
