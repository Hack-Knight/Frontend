
import { getDB, saveDB } from "./localAuth.js";

// Make / update a caregiver↔patient link (idempotent)
export function pairUsers(caregiverId, patientId) {
  const db = getDB();
  if (!db.pairs.some(p => p.caregiverId === caregiverId && p.patientId === patientId)) {
    db.pairs.push({ id: Date.now().toString(), caregiverId, patientId });
    saveDB(db);
  }
}

// All patients for a caregiver
export function myPatients(caregiverId) {
  const db = getDB();
  const ids = db.pairs.filter(p => p.caregiverId === caregiverId).map(p => p.patientId);
  return db.users.filter(u => ids.includes(u.id));
}

// Caregiver for a patient
export function myCaregiver(patientId) {
  const db = getDB();
  const link = db.pairs.find(p => p.patientId === patientId);
  if (!link) return null;
  return db.users.find(u => u.id === link.caregiverId) || null;
}

// Return the pair record for ANY user (caregiver or patient)
export function getPairForUser(userId) {
  const db = getDB();
  // if user is caregiver, return first pair where they’re caregiver
  let link = db.pairs.find(p => p.caregiverId === userId);
  if (link) return link;
  // otherwise if user is patient, return their pair
  link = db.pairs.find(p => p.patientId === userId);
  return link || null;
}

// Unpair specific caregiver↔patient
export function unpair(caregiverId, patientId) {
  const db = getDB();
  db.pairs = db.pairs.filter(p => !(p.caregiverId === caregiverId && p.patientId === patientId));
  saveDB(db);
}
