// src/components/Screens/MapScreen.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, Popup, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapScreen.css";

import { getCurrentUser } from "../../services/localAuth";
import { getPairForUser } from "../../services/localPairing";
import { getZone, setZone, deleteZone } from "../../services/localZones";
import { getLocation, saveLocation } from "../../services/localLocation";
import { pushAlert, listAlerts, markAlertsRead } from "../../services/alerts"; // NEW

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Icons
const meIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const patientIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const zoneIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

// Helpers
const DEFAULT_CENTER = [40.7128, -74.006];
const haversineM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dφ = ((lat2 - lat1) * Math.PI) / 180;
  const dλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Long-press util
function LongPressToAdd({ onLongPress, pressMs = 500 }) {
  const downRef = useRef(null);
  useMapEvents({
    mousedown(e){ downRef.current = {t:Date.now(), latlng:e.latlng, type:"mouse"}; },
    mouseup(){ const d=downRef.current; if(d?.type!=="mouse") return; if(Date.now()-d.t>=pressMs) onLongPress(d.latlng); downRef.current=null; },
    touchstart(e){ downRef.current = {t:Date.now(), latlng:e.latlng||e.originalEvent?.latlng, type:"touch"}; },
    touchend(){ const d=downRef.current; if(d?.type!=="touch") return; if(Date.now()-d.t>=pressMs && d.latlng) onLongPress(d.latlng); downRef.current=null; },
    contextmenu(e){ onLongPress(e.latlng); },
  });
  return null;
}

export default function MapScreen({ hideHeader = false, headerTitle = 'Safety Map', hideBanner = false, hideErrors = false, embed = false }) {
  const mapRef = useRef(null);

  // Auth + pair
  const [me] = useState(() => getCurrentUser());
  const [pair, setPair] = useState(null);
  const isCaregiver = me?.role === "caregiver";
  const isPatient   = me?.role === "patient";

  // My live location (always saved to DB)
  const [myLoc, setMyLoc] = useState(null);
  const [geoError, setGeoError] = useState("");

  // Patient zone (one per patient)
  const [zone, setZoneState] = useState(null); // {latitude,longitude,radius}
  const [editing, setEditing] = useState(false);

  // Patient live loc (caregiver view)
  const [patientLoc, setPatientLoc] = useState(null);

  // Alerts (caregiver view)
  const [alerts, setAlerts] = useState([]);

  // Route polyline (caregiver view)
  const [routeCoords, setRouteCoords] = useState(null);

  // --- Load pair on mount
  useEffect(() => { setPair(getPairForUser(me?.id)); }, [me?.id]);

  const patientId = useMemo(() => {
    if (!pair) return null;
    return pair.patientId; // whether I'm caregiver or patient, this is the patient's id
  }, [pair]);

  const caregiverId = useMemo(() => {
    if (!pair) return null;
    return pair.caregiverId;
  }, [pair]);

  // --- Load patient zone (kept in db.zones keyed by patientId)
  const refreshZone = useCallback(() => {
    if (!patientId) return;
    const z = getZone(patientId);
    setZoneState(z || null);
  }, [patientId]);

  useEffect(() => { refreshZone(); }, [refreshZone]);

  // --- Geolocation watcher (always track my position and save to DB)
  useEffect(() => {
    if (!("geolocation" in navigator)) { setGeoError("Geolocation not supported"); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy };
        setMyLoc(coords);
        if (me?.id) saveLocation(me.id, coords); // persist my current position
      },
      (err)=> setGeoError(err?.message || "Unable to get location"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [me?.id]);

  // --- Caregiver: poll patient location + alerts
  useEffect(() => {
    if (!isCaregiver || !patientId) return;
    let t = setInterval(() => {
      setPatientLoc(getLocation(patientId));
      setAlerts(listAlerts(me.id));
    }, 1500);
    return () => clearInterval(t);
  }, [isCaregiver, patientId, me?.id]);

  // --- Patient: geofence check → push alert to caregiver on exit (debounced)
  const lastAlertRef = useRef(0);
  useEffect(() => {
    if (!isPatient || !zone || !myLoc || !caregiverId) return;
    const d = haversineM(myLoc.latitude, myLoc.longitude, zone.latitude, zone.longitude);
    const outside = d > zone.radius;
    if (outside) {
      const now = Date.now();
      if (now - lastAlertRef.current > 30000) { // one alert / 30s
        pushAlert({
          toUserId: caregiverId,
          fromUserId: me.id,
          type: "GEOFENCE_EXIT",
          payload: { distance: Math.round(d), patientLat: myLoc.latitude, patientLng: myLoc.longitude, zone },
        });
        lastAlertRef.current = now;
      }
    }
  }, [isPatient, zone, myLoc, caregiverId, me?.id]);

  // --- Web Notification API for caregivers (optional nicety)
  useEffect(() => {
    if (!isCaregiver) return;
    if (Notification && Notification.permission === "default") {
      Notification.requestPermission().catch(()=>{});
    }
  }, [isCaregiver]);

  useEffect(() => {
    if (!isCaregiver || alerts.length === 0) return;
    const newest = alerts[0];
    if (!newest?.read && Notification?.permission === "granted") {
      if (newest.type === "GEOFENCE_EXIT") {
        const dist = newest.payload?.distance;
        new Notification("Patient left safe zone", { body: dist ? `~${dist}m away` : undefined });
        markAlertsRead(me.id);
        setAlerts(listAlerts(me.id));
      } else if (newest.type === "SOS") {
        const msg = newest.payload?.message || "Patient requested help";
        new Notification("SOS from patient", { body: msg });
        markAlertsRead(me.id);
        setAlerts(listAlerts(me.id));
      }
    }
  }, [alerts, isCaregiver, me?.id]);

  // --- Caregiver: create / move / resize the patient’s zone
  const addOrMoveZone = useCallback(({ lat, lng }) => {
    if (!isCaregiver || !patientId) return;
    const next = { latitude: lat, longitude: lng, radius: zone?.radius ?? 150 };
    setZone(patientId, next);
    setZoneState(next);
    setEditing(true);
  }, [isCaregiver, patientId, zone?.radius]);

  const updateRadius = (r) => {
    if (!isCaregiver || !patientId) return;
    const next = { ...(zone || {}), radius: r };
    setZone(patientId, next);
    setZoneState(next);
  };

  const removeZone = () => {
    if (!isCaregiver || !patientId) return;
    deleteZone(patientId);
    setZoneState(null);
    setEditing(false);
  };

  // --- Map utilities
  const mapCenter = useMemo(() => {
    if (myLoc) return [myLoc.latitude, myLoc.longitude];
    return DEFAULT_CENTER;
  }, [myLoc]);

  const recenter = () => {
    if (!mapRef.current || !myLoc) return;
    mapRef.current.setView([myLoc.latitude, myLoc.longitude], 15, { animate: true });
  };

  // --- Caregiver: fetch driving route (shortest path) via OSRM
  const routeToPatient = async () => {
    if (!isCaregiver || !myLoc || !patientLoc) return;
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${myLoc.longitude},${myLoc.latitude};${patientLoc.longitude},${patientLoc.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates || null;
      if (coords) {
        // GeoJSON coords are [lng, lat] — convert to Leaflet [lat, lng]
        setRouteCoords(coords.map(([lng, lat]) => [lat, lng]));
      }
    } catch (e) {
      console.error(e);
      setRouteCoords(null);
    }
  };

  // UI banners
  const banner = useMemo(() => {
    if (isCaregiver) {
      if (!pair) return { type: "info", text: "Pair with a patient to begin." };
      if (!patientLoc) return { type: "warning", text: "Waiting for patient location..." };
      if (!zone) return { type: "info", text: "Long-press to set a safe zone for your patient." };
      const d = patientLoc ? Math.round(haversineM(patientLoc.latitude, patientLoc.longitude, zone.latitude, zone.longitude)) : null;
      const outside = d != null ? d > zone.radius : false;
      return outside
        ? { type: "error", text: `Patient is OUTSIDE the safe zone (~${d} m from center)` }
        : { type: "success", text: "Patient is inside the safe zone." };
    } else if (isPatient) {
      if (!zone) return { type: "info", text: "Your caregiver hasn’t set a safe zone yet." };
      if (!myLoc)  return { type: "warning", text: "Locating you..." };
      const d = Math.round(haversineM(myLoc.latitude, myLoc.longitude, zone.latitude, zone.longitude));
      const outside = d > zone.radius;
      return outside
        ? { type: "error", text: `You are OUTSIDE your safe zone (~${d} m from center).` }
        : { type: "success", text: "You are inside your safe zone." };
    }
    return null;
  }, [isCaregiver, isPatient, pair, patientLoc, myLoc, zone]);

  const Wrapper = ({ children }) => embed ? (<div className="map-screen embedded">{children}</div>) : (
    <div className="screen-container"><div className="map-screen">{children}</div></div>
  );

  return (
    <Wrapper>
      {!hideHeader && (
        <div className="map-header">
          <h1>{headerTitle}</h1>
          <div className="map-controls">
            <button className="btn btn-dark" onClick={recenter}>Recenter</button>
            {isCaregiver && patientLoc && (
              <button className="btn" onClick={routeToPatient} style={{ marginLeft: 8 }}>
                Route to patient
              </button>
            )}
          </div>
        </div>
      )}
      {!hideBanner && banner && (
        <div className={`alert alert-${banner.type}`}>
          {banner.text}
        </div>
      )}
      {!hideErrors && geoError && <div className="alert alert-error">{geoError}</div>}

      <div className="map-container">
        <MapContainer center={mapCenter} zoom={13} className="map-root" ref={mapRef}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* CAREGIVER: long-press to set/move zone center. PATIENT: disabled. */}
          {isCaregiver && <LongPressToAdd onLongPress={({lat,lng}) => addOrMoveZone({lat,lng})} />}

          {/* My marker (green) */}
          {myLoc && (
            <>
              <Marker position={[myLoc.latitude, myLoc.longitude]} icon={meIcon}>
                <Popup><strong>Me ({me?.role})</strong></Popup>
              </Marker>
              {Number.isFinite(myLoc.accuracy) && myLoc.accuracy>0 && myLoc.accuracy<200 && (
                <Circle center={[myLoc.latitude, myLoc.longitude]} radius={Math.max(20,myLoc.accuracy)}
                  pathOptions={{ color:"rgba(37,99,235,0.9)", fillColor:"rgba(37,99,235,0.15)" }} />
              )}
            </>
          )}

          {/* Patient marker (red) visible to caregiver */}
          {isCaregiver && patientLoc && (
            <Marker position={[patientLoc.latitude, patientLoc.longitude]} icon={patientIcon}>
              <Popup><strong>Patient</strong></Popup>
            </Marker>
          )}

          {/* Single patient zone */}
          {zone && (
            <>
              <Circle center={[zone.latitude, zone.longitude]} radius={zone.radius}
                pathOptions={{ color:"rgba(220,38,38,1)", fillColor:"rgba(220,38,38,0.15)" }} />
              <Marker position={[zone.latitude, zone.longitude]} icon={zoneIcon}
                      draggable={isCaregiver}
                      eventHandlers={isCaregiver ? {
                        dragend: (e) => {
                          const { lat, lng } = e.target.getLatLng();
                          addOrMoveZone({ lat, lng });
                        }
                      } : {}}>
                <Popup>
                  <div className="zone-popup">
                    <strong>Safe Zone</strong><br/>
                    Radius: {zone.radius}m<br/>
                    {isCaregiver && <button className="btn btn-danger btn-small" onClick={removeZone}>Remove Zone</button>}
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Caregiver route polyline */}
          {isCaregiver && routeCoords && <Polyline positions={routeCoords} />}
        </MapContainer>
      </div>

      {/* CAREGIVER: radius slider */}
      {isCaregiver && zone && (
        <div className="card editor">
          <div className="row"><strong>Edit Safe Zone</strong></div>
          <div className="row">
            <label style={{ width: 120 }}>Radius: {zone.radius} m</label>
            <input type="range" min="50" max="1000" step="10" value={zone.radius}
                   onChange={(e)=>updateRadius(Number(e.target.value))} style={{ flex: 1 }} />
            <button className="btn btn-ghost" onClick={()=>setEditing(false)}>Done</button>
          </div>
        </div>
      )}

      {/* Removed Alerts UI per caregiver design */}

      {/* PATIENT: small note that zone is caregiver-controlled */}
      {isPatient && (
        <div className="card" style={{ marginTop: 12 }}>
          <p>Your caregiver controls your safe zone. You cannot edit it.</p>
        </div>
      )}
    </Wrapper>
  );
}
