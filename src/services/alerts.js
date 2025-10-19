// src/services/alerts.js
import { getDB, saveDB } from "./localAuth";

export function pushAlert({ toUserId, fromUserId, type, payload }) {
  const db = getDB();
  db.alerts ??= []; // [{id,toUserId,fromUserId,type,payload,ts,read:false}]
  db.alerts.push({
    id: Date.now().toString(),
    toUserId,
    fromUserId,
    type,           // e.g. "GEOFENCE_EXIT"
    payload,        // { distance, patientLat, patientLng, zone: {lat,lng,radius} }
    ts: Date.now(),
    read: false,
  });
  saveDB(db);
}

export function listAlerts(userId) {
  const db = getDB();
  return (db.alerts ?? []).filter(a => a.toUserId === userId).sort((a,b)=>b.ts-a.ts);
}

export function markAlertsRead(userId) {
  const db = getDB();
  (db.alerts ?? []).forEach(a => { if (a.toUserId === userId) a.read = true; });
  saveDB(db);
}
