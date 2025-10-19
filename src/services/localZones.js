
import { getDB, saveDB } from "./localAuth.js";

export function getZone(patientId) {
  const db = getDB();
  return db.zones.find(z => z.patientId === patientId) || null;
}

export function setZone(patientId, zone) {
  const db = getDB();
  const existing = db.zones.find(z => z.patientId === patientId);
  if (existing) Object.assign(existing, zone);
  else db.zones.push({ patientId, ...zone });
  saveDB(db);
}

export function deleteZone(patientId) {
  const db = getDB();
  db.zones = db.zones.filter(z => z.patientId !== patientId);
  saveDB(db);
}
