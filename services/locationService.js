import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const LOCATION_TASK_NAME = 'background-location-task';
const BACKEND_API_URL = Constants.expoConfig?.extra?.BACKEND_API_URL || 'http://localhost:5000';

class LocationService {
  constructor() {
    this.currentLocation = null;
    this.locationSubscription = null;
    this.isTracking = false;
    this.listeners = new Set();
  }

  // Request location permissions
  async requestPermissions() {
    try {
      // Request foreground permissions first
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      // Request background permissions for continuous tracking
      const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus.status !== 'granted') {
        console.warn('Background location permission not granted');
        return { foreground: true, background: false };
      }

      return { foreground: true, background: true };
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      throw error;
    }
  }

  // Get current location
  async getCurrentLocation() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  }

  // Start watching location changes
  async startLocationTracking(options = {}) {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.foreground) {
        throw new Error('Location permissions required');
      }

      const trackingOptions = {
        accuracy: Location.Accuracy.High,
        timeInterval: options.timeInterval || 5000, // 5 seconds
        distanceInterval: options.distanceInterval || 10, // 10 meters
        ...options
      };

      this.locationSubscription = await Location.watchPositionAsync(
        trackingOptions,
        (location) => {
          this.currentLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };

          // Notify all listeners
          this.notifyListeners(this.currentLocation);
          
          // Validate safe zone
          this.validateSafeZone(this.currentLocation);
        }
      );

      this.isTracking = true;
      console.log('Location tracking started');
      
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      throw error;
    }
  }

  // Stop location tracking
  stopLocationTracking() {
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    this.isTracking = false;
    console.log('Location tracking stopped');
  }

  // Start background location tracking
  async startBackgroundLocationTracking() {
    try {
      const permissions = await this.requestPermissions();
      
      if (!permissions.background) {
        console.warn('Background location permission not granted');
        return false;
      }

      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // 30 seconds for background
        distanceInterval: 50, // 50 meters for background
        foregroundService: {
          notificationTitle: 'SafeCircle is monitoring your location',
          notificationBody: 'We are keeping you safe by tracking your location',
        },
      });

      console.log('Background location tracking started');
      return true;
    } catch (error) {
      console.error('Error starting background location tracking:', error);
      throw error;
    }
  }

  // Stop background location tracking
  async stopBackgroundLocationTracking() {
    try {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log('Background location tracking stopped');
    } catch (error) {
      console.error('Error stopping background location tracking:', error);
    }
  }

  // Add location change listener
  addLocationListener(callback) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Notify all listeners of location changes
  notifyListeners(location) {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Validate if user is within safe zone
  async validateSafeZone(location) {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(`${BACKEND_API_URL}/api/zones/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          currentLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        }),
      });

      const result = await response.json();
      
      if (!result.isInSafeZone) {
        this.handleSafeZoneExit(location, result.safeZone);
      }

      return result;
    } catch (error) {
      console.error('Error validating safe zone:', error);
    }
  }

  // Handle safe zone exit
  async handleSafeZoneExit(location, safeZone) {
    console.log('User has exited safe zone!', { location, safeZone });
    
    // Store the alert locally
    const alert = {
      type: 'SAFE_ZONE_EXIT',
      location,
      safeZone,
      timestamp: Date.now(),
    };
    
    await this.storeAlert(alert);
    
    // Notify listeners
    this.notifyListeners({
      ...location,
      alert: 'SAFE_ZONE_EXIT',
    });
  }

  // Store alert locally
  async storeAlert(alert) {
    try {
      const alerts = await this.getStoredAlerts();
      alerts.push(alert);
      await AsyncStorage.setItem('location_alerts', JSON.stringify(alerts));
    } catch (error) {
      console.error('Error storing alert:', error);
    }
  }

  // Get stored alerts
  async getStoredAlerts() {
    try {
      const alertsJson = await AsyncStorage.getItem('location_alerts');
      return alertsJson ? JSON.parse(alertsJson) : [];
    } catch (error) {
      console.error('Error getting stored alerts:', error);
      return [];
    }
  }

  // Clear stored alerts
  async clearStoredAlerts() {
    try {
      await AsyncStorage.removeItem('location_alerts');
    } catch (error) {
      console.error('Error clearing stored alerts:', error);
    }
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      currentLocation: this.currentLocation,
      hasLocationSubscription: !!this.locationSubscription,
    };
  }
}

// Background task definition
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }
  
  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      
      // Store the location and validate safe zone
      locationService.validateSafeZone(locationData);
    }
  }
});

// Create and export singleton instance
const locationService = new LocationService();
export default locationService;

// Export individual methods for convenience
export const {
  requestPermissions,
  getCurrentLocation,
  startLocationTracking,
  stopLocationTracking,
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
  addLocationListener,
  calculateDistance,
  validateSafeZone,
  getTrackingStatus,
  getStoredAlerts,
  clearStoredAlerts,
} = locationService;