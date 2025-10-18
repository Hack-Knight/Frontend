// components/Screens/MapScreen.jsx
import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import ScreenWrapper from "../Layout/ScreenWrapper";
import Header from "../Layout/Header";
import BottomNav from "../Navigation/BottomNav";
import useGeolocation from "../../hooks/useGeolocation";
import SafeZone from "../Map/SafeZone"; 

export default function MapScreen() {
  const { coords, error } = useGeolocation({ highAccuracy: true, intervalMs: 3000 });
  const mapRef = useRef(null);

  // ⬇️ simple demo safe-zone (replace with backend values later)
  const [safeCenter] = useState({ lat: 37.7755, lng: -122.4183 });
  const [safeRadius] = useState(200); // meters

  const region = useMemo(() => {
    if (!coords) {
      return { latitude: 37.7749, longitude: -122.4194, latitudeDelta: 0.02, longitudeDelta: 0.02 };
    }
    return { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  }, [coords]);

  const recenter = () => {
    if (mapRef.current && coords) {
      mapRef.current.animateToRegion(
        { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        300
      );
    }
  };

  return (
    <ScreenWrapper style={{ backgroundColor: "#fff" }}>
      <Header title="Map" />

      <View style={styles.body}>
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          region={region}
          showsUserLocation={!!coords}
          showsMyLocationButton={false}
        >
          {/* Your live position */}
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
                  strokeColor="rgba(37, 99, 235, 0.9)"
                  fillColor="rgba(37, 99, 235, 0.15)"
                  strokeWidth={2}
                />
              )}
            </>
          )}

          {/* 👇 Safe zone */}
          <SafeZone
            center={safeCenter}
            radius={safeRadius}
            coords={coords}
            bufferM={15}
            onExit={(d) => console.log(`Exited safe zone (dist ${d.toFixed(1)}m)`)}
            onEnter={(d) => console.log(`Re-entered safe zone (dist ${d.toFixed(1)}m)`)}

          />
        </MapView>

        {/* Recenter & status */}
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.recenter} onPress={recenter}>
            <Text style={styles.recenterText}>Recenter</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>

      <BottomNav />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: "stretch", justifyContent: "center", padding: 0 },
  overlay: { position: "absolute", top: 12, right: 12, left: 12, gap: 8, alignItems: "flex-end" },
  recenter: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, opacity: 0.9 },
  recenterText: { color: "#fff", fontWeight: "700" },
  error: { alignSelf: "flex-start", color: "#EF4444", backgroundColor: "#FEE2E2", padding: 8, borderRadius: 8 },
});
