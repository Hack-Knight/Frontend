// src/services/localAuth.js
const DB_KEY = "sc_local_db";
const CURR_KEY = "sc_current_user";

// --- helpers ---
function loadDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || {}; }
  catch { return {}; }
}
export function saveDB(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}
export function getDB() {
  const db = loadDB();
  db.users ??= [];       // [{id,name,email,password,role}]
  db.pairs ??= [];       // [{id,caregiverId,patientId}]
  db.zones ??= [];       // [{patientId, latitude, longitude, radius}]
  db.locations ??= {};   // { [userId]: {latitude, longitude, accuracy, ts} }
  return db;
}

// --- auth ---
export function signUpLocal({ name, email, password, role }) {
  const db = getDB();
  if (db.users.some(u => u.email === email)) throw new Error("Email already exists");
  const user = { id: Date.now().toString(), name, email, password, role };
  db.users.push(user);
  saveDB(db);
  localStorage.setItem(CURR_KEY, user.id);
  return user;
}

export function signInLocal({ email, password }) {
  const db = getDB();
  const u = db.users.find(x => x.email === email && x.password === password);
  if (!u) throw new Error("Invalid credentials");
  localStorage.setItem(CURR_KEY, u.id);
  return u;
}

export function getCurrentUser() {
  const id = localStorage.getItem(CURR_KEY);
  if (!id) return null;
  const db = getDB();
  return db.users.find(u => u.id === id) || null;
}

export function signOutLocal() {
  localStorage.removeItem(CURR_KEY);
}
