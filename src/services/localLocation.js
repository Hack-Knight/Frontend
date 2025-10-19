
import { getDB, saveDB } from "./localAuth.js";

export function saveLocation(userId, coords) {
  const db = getDB();
  db.locations[userId] = { ...coords, ts: Date.now() };
  saveDB(db);
}

export function getLocation(userId) {
  const db = getDB();
  return db.locations[userId] || null;
}
