// components/Screens/MapScreen.js
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";

export default function MapScreen() {
  const mapRef = useRef(null);
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);

  // ask permission + start watching location
  useEffect(() => {
    let watchSub = null;
    let cancelled = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setError("Location permission not granted");
          return;
        }

        const first = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!cancelled) setCoords(first.coords);

        watchSub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 3000,
            distanceInterval: 1,
          },
          (update) => !cancelled && setCoords(update.coords)
        );
      } catch (e) {
        setError(e?.message || "Location error");
      }
    })();

    return () => {
      cancelled = true;
      watchSub?.remove();
    };
  }, []);

  // smooth recenter on every update
  useEffect(() => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300
      );
    }
  }, [coords]);

  const recenter = () => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      300
    );
  };

  const fallbackRegion = {
    latitude: coords?.latitude ?? 37.7749,
    longitude: coords?.longitude ?? -122.4194,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={fallbackRegion}
        showsUserLocation={!!coords}
        showsMyLocationButton={false}
      >
        {coords && (
          <>
            <Marker
              coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
              title="You"
              pinColor="#2563EB"
            />
            {Number.isFinite(coords.accuracy) && coords.accuracy > 0 && coords.accuracy < 200 && (
              <Circle
                center={{ latitude: coords.latitude, longitude: coords.longitude }}
                radius={Math.max(20, coords.accuracy)}
                strokeColor="rgba(37,99,235,0.9)"
                fillColor="rgba(37,99,235,0.15)"
                strokeWidth={2}
              />
            )}
          </>
        )}
      </MapView>

      {/* Overlay */}
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.recenter} onPress={recenter}>
          <Text style={styles.recenterText}>Recenter</Text>
        </TouchableOpacity>

        {!coords && !error && (
          <View style={styles.loadingRow}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>Getting location…</Text>
          </View>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  overlay: {
    position: "absolute",
    top: 12,
    right: 12,
    left: 12,
    gap: 8,
    alignItems: "flex-end",
  },
  recenter: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    opacity: 0.9,
  },
  recenterText: { color: "#fff", fontWeight: "700" },
  loadingRow: { alignSelf: "flex-start", flexDirection: "row", gap: 8, alignItems: "center" },
  loadingText: { color: "#374151" },
  error: { alignSelf: "flex-start", color: "#EF4444", backgroundColor: "#FEE2E2", padding: 8, borderRadius: 8 },
});
