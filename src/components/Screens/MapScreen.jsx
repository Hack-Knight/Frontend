// src/components/Screens/MapScreen.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useLoadScript,
  DirectionsService,
  DirectionsRenderer,
} from "@react-google-maps/api";
import "./MapScreen.css";

// Local storage “DB” services (unchanged)
import { getCurrentUser } from "../../services/localAuth";
import { getZone, setZone, deleteZone } from "../../services/localZones";
import { getLocation, saveLocation } from "../../services/localLocation";
import { getPairForUser } from "../../services/localPairing";

// ---- helpers
const DEFAULT_CENTER = { lat: 40.7128, lng: -74.006 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

const haversineM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dφ = ((lat2 - lat1) * Math.PI) / 180;
  const dλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function MapScreen() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ["places"], // keep minimal
  });

  // who am I?
  const me = getCurrentUser(); // { id, name, role }
  const isCaregiver = me?.role === "caregiver";

  // pairing
  const pair = getPairForUser(me?.id); // { patientId, caregiverId } | null
  const patientId = isCaregiver ? pair?.patientId : me?.id;
  const caregiverId = isCaregiver ? me?.id : pair?.caregiverId; // eslint quiet; kept for parity

  // my position
  const [myLoc, setMyLoc] = useState(null); // {latitude, longitude, accuracy}
  const [geoError, setGeoError] = useState(null);

  // patient position
  const [patientLoc, setPatientLoc] = useState(() =>
    patientId ? getLocation(patientId) : null
  );

  // safe zone (1 per patient)
  const [zone, setZoneState] = useState(() =>
    patientId ? getZone(patientId) : null
  ); // {latitude, longitude, radius, name}
  const [status, setStatus] = useState(null);

  // map & directions
  const mapRef = useRef(null);
  const [directionsReq, setDirectionsReq] = useState(null);
  const [directionsRes, setDirectionsRes] = useState(null);

  // show helper hint if caregiver and no zone yet
  useEffect(() => {
    if (isCaregiver && patientId && !zone) {
      setStatus({
        type: "info",
        message:
          "Long-press (right-click) anywhere on the map to set the Safe Zone center, then use the slider to adjust its radius.",
      });
    }
  }, [isCaregiver, patientId, zone]);

  // watch my location and persist
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setMyLoc(coords);
        if (me?.id) saveLocation(me.id, coords);
      },
      (err) => setGeoError(err.message || "Unable to get location."),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, [me?.id]);

  // poll patient location from local store (simple sync)
  useEffect(() => {
    if (!patientId) return;
    const t = setInterval(() => {
      const loc = getLocation(patientId);
      setPatientLoc(loc || null);
    }, 1500);
    return () => clearInterval(t);
  }, [patientId]);

  // center once on my location
  useEffect(() => {
    if (!mapRef.current || !myLoc) return;
    mapRef.current.setCenter({ lat: myLoc.latitude, lng: myLoc.longitude });
    mapRef.current.setZoom(15);
  }, [myLoc]);

  // geofence check
  useEffect(() => {
    if (!patientLoc || !zone) return;
    const t = setTimeout(() => {
      const d = haversineM(
        patientLoc.latitude,
        patientLoc.longitude,
        zone.latitude,
        zone.longitude
      );
      setStatus(
        d <= zone.radius
          ? {
              type: "success",
              message: `Patient is inside "${zone.name || "Safe Zone"}"`,
            }
          : { type: "warning", message: "Patient is outside the safe zone" }
      );
    }, 250);
    return () => clearTimeout(t);
  }, [patientLoc, zone]);

  // caregiver: create/update zone
  const createZoneAt = useCallback(
    ({ latLng }) => {
      if (!isCaregiver || !patientId || !latLng) return;
      const next = {
        name: zone?.name || "Safe Zone",
        latitude: latLng.lat(),
        longitude: latLng.lng(),
        radius: zone?.radius || 150,
      };
      setZone(patientId, next);
      setZoneState(next);
      setStatus({
        type: "info",
        message:
          "Safe Zone created. Use the slider below to adjust its radius.",
      });
    },
    [isCaregiver, patientId, zone]
  );

  const updateZone = (patch) => {
    if (!isCaregiver || !patientId || !zone) return;
    const next = { ...zone, ...patch };
    setZone(patientId, next);
    setZoneState(next);
  };

  const clearZone = () => {
    if (!isCaregiver || !patientId) return;
    deleteZone(patientId);
    setZoneState(null);
    setStatus({
      type: "info",
      message:
        "Safe Zone removed. Long-press (right-click) on the map to create a new one.",
    });
  };

  // route (caregiver -> patient)
  const routeToPatient = () => {
    if (!isCaregiver || !myLoc || !patientLoc) return;
    setDirectionsRes(null);
    setDirectionsReq({
      origin: { lat: myLoc.latitude, lng: myLoc.longitude },
      destination: { lat: patientLoc.latitude, lng: patientLoc.longitude },
      travelMode: window.google.maps.TravelMode.WALKING,
    });
  };

  const mapCenter = useMemo(() => {
    if (myLoc) return { lat: myLoc.latitude, lng: myLoc.longitude };
    if (patientLoc)
      return { lat: patientLoc.latitude, lng: patientLoc.longitude };
    return DEFAULT_CENTER;
  }, [myLoc, patientLoc]);

  if (loadError) {
    return (
      <div className="screen-container">
        <div className="map-screen">
          <div className="alert alert-error">
            Failed to load Google Maps. Check your API key/domain restrictions.
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="screen-container">
        <div className="map-screen">
          <div className="alert">Loading map…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <div className="map-screen">
        <div className="map-header">
          <h1>Safety Map</h1>
          <div className="map-controls">
            <span className="role-chip">
              {isCaregiver ? "Caregiver" : "Patient"}
            </span>
            <button
              className="btn btn-dark"
              onClick={() => {
                if (mapRef.current && myLoc) {
                  mapRef.current.setCenter({
                    lat: myLoc.latitude,
                    lng: myLoc.longitude,
                  });
                  mapRef.current.setZoom(16);
                }
              }}
            >
              Recenter
            </button>
            {isCaregiver && patientLoc && (
              <button className="btn btn-primary" onClick={routeToPatient}>
                Route to Patient
              </button>
            )}
          </div>
        </div>

        {/* Instruction / status banner */}
        {status && (
          <div className={`alert alert-${status.type}`}>
            {status.message}
            <button className="alert-close" onClick={() => setStatus(null)}>
              ×
            </button>
          </div>
        )}
        {geoError && <div className="alert alert-error">{geoError}</div>}

        <div className="map-container">
          <GoogleMap
            center={mapCenter}
            zoom={13}
            mapContainerStyle={MAP_CONTAINER_STYLE}
            onLoad={(map) => (mapRef.current = map)}
            options={{
              streetViewControl: false,
              fullscreenControl: false,
              mapTypeControl: false,
            }}
            // Long press on mobile triggers right-click; desktop right-click works too
            onRightClick={(e) => isCaregiver && createZoneAt(e)}
          >
            {/* My location */}
            {myLoc && (
              <>
                <Marker
                  position={{ lat: myLoc.latitude, lng: myLoc.longitude }}
                  label={{ text: "You", color: "#ffffff" }}
                  icon={{
                    url: "https://maps.gstatic.com/mapfiles/ms2/micons/red-dot.png",
                  }}
                />
                {Number.isFinite(myLoc.accuracy) &&
                  myLoc.accuracy > 0 &&
                  myLoc.accuracy < 200 && (
                    <Circle
                      center={{ lat: myLoc.latitude, lng: myLoc.longitude }}
                      radius={Math.max(20, myLoc.accuracy)}
                      options={{
                        strokeColor: "#2563EB",
                        fillColor: "#2563EB",
                        fillOpacity: 0.15,
                      }}
                    />
                  )}
              </>
            )}

            {/* Patient location */}
            {patientLoc && (
              <Marker
                position={{
                  lat: patientLoc.latitude,
                  lng: patientLoc.longitude,
                }}
                label={{ text: "Patient", color: "#ffffff" }}
                icon={{
                  url: "https://maps.gstatic.com/mapfiles/ms2/micons/green-dot.png",
                }}
              />
            )}

            {/* Safe zone */}
            {zone && (
              <>
                <Circle
                  center={{ lat: zone.latitude, lng: zone.longitude }}
                  radius={zone.radius}
                  options={{
                    strokeColor: "#dc2626",
                    fillColor: "#dc2626",
                    fillOpacity: 0.15,
                  }}
                />
                <Marker
                  position={{ lat: zone.latitude, lng: zone.longitude }}
                  draggable={isCaregiver}
                  onDragEnd={(e) =>
                    isCaregiver &&
                    updateZone({
                      latitude: e.latLng.lat(),
                      longitude: e.latLng.lng(),
                    })
                  }
                  label={{ text: zone.name || "Safe Zone", color: "#ffffff" }}
                  icon={{
                    url: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
                  }}
                />
              </>
            )}

            {/* Directions */}
            {directionsReq && (
              <DirectionsService
                options={directionsReq}
                callback={(res, status) => {
                  if (status === "OK") setDirectionsRes(res);
                  else
                    setStatus({
                      type: "error",
                      message: `Routing failed: ${status}`,
                    });
                }}
              />
            )}
            {directionsRes && (
              <DirectionsRenderer
                options={{
                  directions: directionsRes,
                  preserveViewport: false,
                  suppressMarkers: true, // we already show our own markers
                }}
              />
            )}
          </GoogleMap>
        </div>

        {/* Caregiver-only radius editor */}
        {isCaregiver && zone && (
          <div className="card editor">
            <div className="row">
              <strong>Edit: {zone.name || "Safe Zone"}</strong>
            </div>
            <div className="row">
              <label style={{ width: 110 }}>Radius: {zone.radius} m</label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={zone.radius}
                onChange={(e) => updateZone({ radius: Number(e.target.value) })}
                style={{ flex: 1 }}
              />
              <button className="btn btn-ghost" onClick={() => setStatus(null)}>
                Done
              </button>
            </div>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn btn-danger" onClick={clearZone}>
                Remove Zone
              </button>
            </div>
          </div>
        )}

        {/* Caregiver-only: hint when no zone exists */}
        {isCaregiver && !zone && (
          <div className="card editor">
            <div className="row">
              <strong>No Safe Zone yet</strong>
            </div>
            <div className="row">
              Long-press (right-click) anywhere on the map to set the Safe Zone
              center. Once created, a slider will appear here to change its
              radius.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
