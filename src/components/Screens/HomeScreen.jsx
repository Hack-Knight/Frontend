import React, { useState, useEffect, useMemo } from 'react';
import './HomeScreen.css';
import { getCurrentUser } from "../../services/localAuth";
import { getPairForUser } from "../../services/localPairing";
import { getZone } from "../../services/localZones";
import { getLocation } from "../../services/localLocation";
import MapScreen from "./MapScreen";
import VoiceAgent from "./VoiceAgent";

const haversineM = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const dφ = ((lat2 - lat1) * Math.PI) / 180;
  const dλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dλ/2)**2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const HomeScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [me, setMe] = useState(null);
  const [status, setStatus] = useState({ state: 'checking', text: 'Checking location...' });

  useEffect(() => { setMe(getCurrentUser()); }, []);
  // Update time less frequently to avoid re-rendering the map every second
  useEffect(() => { const t=setInterval(()=>setCurrentTime(new Date()),60000); return ()=>clearInterval(t); }, []);

  // Poll saved locations/zones to compute inside/outside
  useEffect(() => {
    if (!me?.id) return;
    const isCaregiver = me.role === 'caregiver';

    const compute = () => {
      try {
        if (isCaregiver) {
          const pair = getPairForUser(me.id);
          const patientId = pair?.patientId;
          if (!patientId) { setStatus({ state:'info', text:'Pair with a patient to begin.' }); return; }
          const z = getZone(patientId);
          const loc = getLocation(patientId);
          if (!z) { setStatus({ state:'info', text:'No safe zone set yet.' }); return; }
          if (!loc) { setStatus({ state:'warning', text:'Waiting for patient location...' }); return; }
          const d = haversineM(loc.latitude, loc.longitude, z.latitude, z.longitude);
          const outside = d > z.radius;
          setStatus(outside ? { state:'outside', text:'Outside SafeCircle' } : { state:'inside', text:'Inside SafeCircle' });
        } else {
          const z = getZone(me.id);
          const loc = getLocation(me.id);
          if (!z) { setStatus({ state:'info', text:'No safe zone set yet.' }); return; }
          if (!loc) { setStatus({ state:'warning', text:'Locating you...' }); return; }
          const d = haversineM(loc.latitude, loc.longitude, z.latitude, z.longitude);
          const outside = d > z.radius;
          setStatus(outside ? { state:'outside', text:'Outside SafeCircle' } : { state:'inside', text:'Inside SafeCircle' });
        }
      } catch {
        setStatus({ state:'checking', text:'Checking location...' });
      }
    };

    compute();
    const t = setInterval(compute, 1500);
    return () => clearInterval(t);
  }, [me?.id, me?.role]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const isCaregiver = me?.role === 'caregiver';
  const isPatient = me?.role === 'patient';

  // Memoize the embedded map so it doesn’t re-render on unrelated state changes
  const mapEmbed = useMemo(() => (
    <MapScreen hideHeader hideBanner hideErrors embed />
   ), [//me?.role
   ]);

  return (
    <div className="screen-container">
      <div className="home-screen">
        <div className="welcome-section">
          <h1 className="greeting">{getGreeting()}!</h1>
          <p className="current-time">
            {currentTime.toLocaleDateString()} - {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Safety Zone Status */}
        <div>
          <h2 className="zone-status-title">Safety Zone Status</h2>
          <div className={`zone-pill ${status.state}`} aria-live="polite">{status.text}</div>
        </div>

        {/* Caregiver: recent activities map */}
        {isCaregiver && (
          <div style={{ marginTop: 16 }}>
            <h2 className="recent-title">Recent Activities</h2>
            {mapEmbed}
          </div>
        )}

        {/* Patient: AI agent big button */}
        {isPatient && (
          <div style={{ marginTop: 16 }}>
            <VoiceAgent />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;