import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import SafeZoneMap from "../Map/SafeZoneMap";
import locationService from "../../services/locationService";

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [safeZone, setSafeZone] = useState({
    center: {
      latitude: 37.78825,
      longitude: -122.4324,
    },
    radius: 100, // 100 meters
  });
  const [trackingStatus, setTrackingStatus] = useState('stopped');

  useEffect(() => {
    // Check if location tracking is already active
    const status = locationService.getTrackingStatus();
    setIsTracking(status.isTracking);
    if (status.currentLocation) {
      setUserLocation(status.currentLocation);
    }

    // Get current location on mount
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setTrackingStatus('getting_location');
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setTrackingStatus('location_received');
      
      // Set safe zone center to current location if not set
      if (!safeZone.center || (safeZone.center.latitude === 37.78825 && safeZone.center.longitude === -122.4324)) {
        setSafeZone(prev => ({
          ...prev,
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          }
        }));
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setTrackingStatus('error');
      Alert.alert(
        'Location Error',
        'Could not get your current location. Please check your location permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const startTracking = async () => {
    try {
      setTrackingStatus('starting');
      await locationService.startLocationTracking({
        timeInterval: 5000, // 5 seconds
        distanceInterval: 10, // 10 meters
      });
      
      setIsTracking(true);
      setTrackingStatus('tracking');
      
      Alert.alert(
        'Tracking Started',
        'Location tracking is now active. SafeCircle will monitor your location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error starting tracking:', error);
      setTrackingStatus('error');
      Alert.alert(
        'Tracking Error',
        'Could not start location tracking. Please check your permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopTracking = () => {
    locationService.stopLocationTracking();
    setIsTracking(false);
    setTrackingStatus('stopped');
    
    Alert.alert(
      'Tracking Stopped',
      'Location tracking has been stopped.',
      [{ text: 'OK' }]
    );
  };

  const startBackgroundTracking = async () => {
    try {
      const success = await locationService.startBackgroundLocationTracking();
      if (success) {
        Alert.alert(
          'Background Tracking Active',
          'SafeCircle will continue monitoring your location in the background.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Background Permission Required',
          'Background location permission is needed for continuous monitoring.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error starting background tracking:', error);
      Alert.alert(
        'Background Tracking Error',
        'Could not start background tracking.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleLocationUpdate = (location) => {
    setUserLocation(location);
    
    // Check for alerts
    if (location.alert === 'SAFE_ZONE_EXIT') {
      console.log('Safe zone exit detected in MapScreen');
    }
  };

  const getStatusText = () => {
    switch (trackingStatus) {
      case 'getting_location':
        return 'Getting your location...';
      case 'location_received':
        return 'Location received';
      case 'starting':
        return 'Starting tracking...';
      case 'tracking':
        return 'Actively tracking';
      case 'stopped':
        return 'Tracking stopped';
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Safety Map</Text>
        <Text style={styles.status}>Status: {getStatusText()}</Text>
      </View>

      <View style={styles.mapContainer}>
        <SafeZoneMap
          userLocation={userLocation}
          safeZoneCenter={safeZone.center}
          safeZoneRadius={safeZone.radius}
          onLocationUpdate={handleLocationUpdate}
          showUserLocation={true}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={getCurrentLocation}
          disabled={trackingStatus === 'getting_location'}
        >
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            isTracking ? styles.dangerButton : styles.successButton
          ]}
          onPress={isTracking ? stopTracking : startTracking}
          disabled={trackingStatus === 'starting'}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={startBackgroundTracking}
        >
          <Text style={styles.buttonText}>Enable Background Tracking</Text>
        </TouchableOpacity>
      </View>

      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            Lat: {userLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Lng: {userLocation.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Updated: {new Date(userLocation.timestamp).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  status: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controls: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: "#007bff",
  },
  successButton: {
    backgroundColor: "#28a745",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
  },
  secondaryButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  locationInfo: {
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
