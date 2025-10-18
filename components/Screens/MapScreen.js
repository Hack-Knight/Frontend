// components/Screens/MapScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import Slider from "@react-native-community/slider"; // npx expo install @react-native-community/slider
import useGeolocation from "../../hooks/useGeolocation";
import SafeZone from "../Map/SafeZone";

/**
 * Accepts role via:
 *   - prop: canEdit
 *   - or navigation param: route.params.canEdit
 * Also accepts initialZone & onSaveZone for persistence.
 */
export default function MapScreen({ route, canEdit: canEditProp, initialZone, onSaveZone }) {
  const canEdit = typeof canEditProp === "boolean" ? canEditProp : !!route?.params?.canEdit;

  const mapRef = useRef(null);
  const { coords, error } = useGeolocation({ highAccuracy: true, intervalMs: 3000, distanceM: 1 });

  // seed from backend if provided
  const [safeCenter, setSafeCenter] = useState(initialZone?.center ?? null); // { lat, lng }
  const [radius, setRadius] = useState(initialZone?.radius ?? 150);
  const [saving, setSaving] = useState(false);
  const [savedOnce, setSavedOnce] = useState(!!initialZone);

  const initialRegion = useMemo(() => ({
    latitude: coords?.latitude ?? 37.7749,
    longitude: coords?.longitude ?? -122.4194,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  }), [coords]);

  useEffect(() => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      300
    );
  }, [coords]);

  const recenter = () => {
    if (!coords || !mapRef.current) return;
    mapRef.current.animateToRegion(
      { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 },
      300
    );
  };

  const onLongPress = (e) => {
    if (!canEdit) return; // patients can’t set
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSafeCenter({ lat: latitude, lng: longitude });
    setSavedOnce(false);
  };

  const handleSave = async () => {
    if (!canEdit || !safeCenter) return;
    try {
      setSaving(true);
      await (onSaveZone?.({ center: safeCenter, radius }) ?? Promise.resolve());
      setSavedOnce(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={!!coords}
        showsMyLocationButton={false}
        onLongPress={onLongPress} // ignored if !canEdit
      >
        {/* User position */}
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

        {/* Safe Circle (editable only for caregivers) */}
        {safeCenter && (
          <>
            <Marker
              coordinate={{ latitude: safeCenter.lat, longitude: safeCenter.lng }}
              draggable={canEdit}
              onDragEnd={(e) => {
                if (!canEdit) return;
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setSafeCenter({ lat: latitude, lng: longitude });
                setSavedOnce(false);
              }}
              title={canEdit ? "Drag to adjust center" : "Safe Zone Center"}
            />
            <Circle
              center={{ latitude: safeCenter.lat, longitude: safeCenter.lng }}
              radius={radius}
              strokeColor="rgba(220,38,38,1)"     // red
              fillColor="rgba(220,38,38,0.15)"
              strokeWidth={2}
            />
            <SafeZone
              center={safeCenter}
              radius={radius}
              coords={coords}
              bufferM={15}
              circleColors={{ stroke: "rgba(220,38,38,1)", fill: "rgba(220,38,38,0.15)" }}
              onExit={(d) => console.log(`🚨 Exited safe zone (${d.toFixed(1)}m)`)}
              onEnter={(d) => console.log(`✅ Re-entered safe zone (${d.toFixed(1)}m)`)}
            />
          </>
        )}
      </MapView>

      {/* Overlay (always shown) */}
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

      {/* Caregiver-only editor */}
      {canEdit && (
        <View style={styles.editor}>
          <Text style={styles.editorTitle}>Safe Circle</Text>
          <Text style={styles.helpText}>
            Long-press to set center. Drag the red pin to adjust.
          </Text>

          <View style={styles.sliderRow}>
            <Text style={styles.sliderLabel}>Radius: {radius} m</Text>
            <Slider
              style={{ flex: 1, marginLeft: 12 }}
              minimumValue={50}
              maximumValue={1000}
              step={10}
              value={radius}
              onValueChange={(v) => { setRadius(v); setSavedOnce(false); }}
              disabled={!safeCenter}
            />
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, (!safeCenter || saving) && styles.btnDisabled]}
              onPress={handleSave}
              disabled={!safeCenter || saving}
            >
              <Text style={styles.btnPrimaryText}>
                {saving ? "Saving..." : savedOnce ? "Saved" : "Save Zone"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              onPress={() => { setSafeCenter(null); setSavedOnce(false); }}
            >
              <Text style={styles.btnGhostText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  overlay: { position: "absolute", top: 12, right: 12, left: 12, gap: 8, alignItems: "flex-end" },
  recenter: { backgroundColor: "#111827", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, opacity: 0.9 },
  recenterText: { color: "#fff", fontWeight: "700" },
  loadingRow: { alignSelf: "flex-start", flexDirection: "row", gap: 8, alignItems: "center" },
  loadingText: { color: "#374151" },
  error: { alignSelf: "flex-start", color: "#EF4444", backgroundColor: "#FEE2E2", padding: 8, borderRadius: 8 },
  editor: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  editorTitle: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  helpText: { color: "#6b7280", marginBottom: 12 },
  sliderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  sliderLabel: { color: "#111827", fontWeight: "600", width: 110 },
  row: { flexDirection: "row", gap: 12 },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#dc2626" },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },
  btnGhost: { borderWidth: 1, borderColor: "#e5e7eb" },
  btnGhostText: { color: "#374151", fontWeight: "700" },
  btnDisabled: { opacity: 0.6 },
});
