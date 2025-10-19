// src/components/Screens/MapScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapScreen.css";

// Fix Leaflet marker icons (works with bundlers/CDNs)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Icons
const userLocationIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const safeZoneIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helpers
const LS_KEY = "sc_safezones_v1";
const DEFAULT_CENTER = [40.7128, -74.006];
const haversineM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dφ = ((lat2 - lat1) * Math.PI) / 180;
  const dλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Long-press detector for Leaflet (works on mouse & touch)
function LongPressToAdd({ onLongPress, pressMs = 500 }) {
  const downRef = useRef(null);

  useMapEvents({
    mousedown(e) {
      downRef.current = { t: Date.now(), latlng: e.latlng, type: "mouse" };
    },
    mouseup(e) {
      const d = downRef.current;
      if (!d || d.type !== "mouse") return;
      const held = Date.now() - d.t;
      if (held >= pressMs) onLongPress(d.latlng);
      downRef.current = null;
    },
    touchstart(e) {
      const latlng = e.latlng || (e.originalEvent?.latlng ?? null);
      downRef.current = { t: Date.now(), latlng, type: "touch" };
    },
    touchend() {
      const d = downRef.current;
      if (!d || d.type !== "touch") return;
      const held = Date.now() - d.t;
      if (held >= pressMs && d.latlng) onLongPress(d.latlng);
      downRef.current = null;
    },
    // Right-click (contextmenu) also counts as “long press”
    contextmenu(e) {
      onLongPress(e.latlng);
    },
  });

  return null;
}

export default function MapScreen() {
  // position
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const mapRef = useRef(null);

  // zones
  const [safeZones, setSafeZones] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [selectedZoneId, setSelectedZoneId] = useState(null); // zone currently being edited (slider)
  const [status, setStatus] = useState(null); // banner

  // persist zones
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(safeZones));
  }, [safeZones]);

  // watchPosition
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords || {};
        setUserLocation({ latitude, longitude, accuracy });
      },
      (err) => setGeoError(err.message || "Unable to get location."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // recenter on first fix
  useEffect(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(
        [userLocation.latitude, userLocation.longitude],
        15,
        { animate: true }
      );
    }
  }, [userLocation]);

  // geofence check (debounced)
  useEffect(() => {
    if (!userLocation) return;
    const t = setTimeout(() => {
      let inside = null;
      for (const z of safeZones) {
        const d = haversineM(
          userLocation.latitude,
          userLocation.longitude,
          z.latitude,
          z.longitude
        );
        if (d <= z.radius) {
          inside = z;
          break;
        }
      }
      setStatus(
        inside
          ? { type: "success", message: `You're in the "${inside.name}" safe zone` }
          : { type: "warning", message: "You are outside all safe zones" }
      );
    }, 250);
    return () => clearTimeout(t);
  }, [userLocation, safeZones]);

  const mapCenter = useMemo(
    () => (userLocation ? [userLocation.latitude, userLocation.longitude] : DEFAULT_CENTER),
    [userLocation]
  );

  const recenter = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.setView([userLocation.latitude, userLocation.longitude], 16, {
      animate: true,
    });
  };

  // Long-press adds a zone at that point
  const handleLongPress = ({ lat, lng }) => {
    const id = Date.now();
    const newZone = {
      id,
      name: `Safe Zone ${safeZones.length + 1}`,
      latitude: lat,
      longitude: lng,
      radius: 150,
    };
    setSafeZones((prev) => [...prev, newZone]);
    setSelectedZoneId(id);
    setStatus({ type: "info", message: "Safe zone created. Use the slider to adjust radius." });
  };

  const updateZone = (id, patch) => {
    setSafeZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const removeZone = (id) => {
    setSafeZones((prev) => prev.filter((z) => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
    setStatus({ type: "info", message: "Safe zone removed" });
  };

  const selectedZone = safeZones.find((z) => z.id === selectedZoneId) || null;

  return (
    <div className="screen-container">
      <div className="map-screen">
        <div className="map-header">
          <h1>Safety Map</h1>
          <div className="map-controls">
            <button className="btn btn-dark" onClick={recenter}>Recenter</button>
          </div>
        </div>

        {status && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
            <button className="alert-close" onClick={() => setStatus(null)}>×</button>
          </div>
        )}
        {geoError && <div className="alert alert-error">{geoError}</div>}

        <div className="map-container">
          <MapContainer
            center={mapCenter}
            zoom={13}
            className="map-root"
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* LONG-PRESS anywhere to add a zone */}
            <LongPressToAdd onLongPress={handleLongPress} />

            {/* User position */}
            {userLocation && (
              <>
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
                {Number.isFinite(userLocation.accuracy) &&
                  userLocation.accuracy > 0 &&
                  userLocation.accuracy < 200 && (
                    <Circle
                      center={[userLocation.latitude, userLocation.longitude]}
                      radius={Math.max(20, userLocation.accuracy)}
                      pathOptions={{
                        color: "rgba(37,99,235,0.9)",
                        fillColor: "rgba(37,99,235,0.15)",
                      }}
                    />
                  )}
              </>
            )}

            {/* Zones: draggable center + circle */}
            {safeZones.map((z) => (
              <React.Fragment key={z.id}>
                <Circle
                  center={[z.latitude, z.longitude]}
                  radius={z.radius}
                  pathOptions={{
                    color: "rgba(220,38,38,1)",
                    fillColor: "rgba(220,38,38,0.15)",
                  }}
                />
                <Marker
                  position={[z.latitude, z.longitude]}
                  icon={safeZoneIcon}
                  draggable
                  eventHandlers={{
                    dragstart: () => setSelectedZoneId(z.id),
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      updateZone(z.id, { latitude: lat, longitude: lng });
                    },
                    click: () => setSelectedZoneId(z.id),
                  }}
                >
                  <Popup>
                    <div className="zone-popup">
                      <strong>{z.name}</strong><br />
                      Radius: {z.radius}m<br />
                      <button className="btn btn-danger btn-small" onClick={() => removeZone(z.id)}>
                        Remove Zone
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {/* Radius editor for the selected zone */}
        {selectedZone && (
          <div className="card editor">
            <div className="row">
              <strong>Edit: {selectedZone.name}</strong>
            </div>
            <div className="row">
              <label style={{ width: 110 }}>Radius: {selectedZone.radius} m</label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={selectedZone.radius}
                onChange={(e) =>
                  updateZone(selectedZone.id, { radius: Number(e.target.value) })
                }
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost" onClick={() => setSelectedZoneId(null)}>
                Done
              </button>
            </div>
          </div>
        )}

        {/* Zones list (optional quick controls) */}
        <div className="card safe-zones-list">
          <h3>Your Safe Zones</h3>
          {safeZones.length === 0 ? (
            <p className="no-zones">Long-press on the map to create a Safe Zone.</p>
          ) : (
            <div className="zones-grid">
              {safeZones.map((z) => (
                <div key={z.id} className="zone-card">
                  <div className="zone-info" onClick={() => setSelectedZoneId(z.id)}>
                    <h4>{z.name}</h4>
                    <p>Radius: {z.radius}m</p>
                    <p className="zone-coords">
                      {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="zone-actions">
                    <button className="btn btn-danger btn-small" onClick={() => removeZone(z.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
