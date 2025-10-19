import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";

const USERS_KEY = "sc_users_v1";
const CURRENT_KEY = "sc_current_user_v1";

// simple helper
async function loadUsers() {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}
async function saveUsers(users) {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// derive a deterministic hash for demo purposes
async function hashPassword(email, password) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${email}:${password}`
  );
}

// ---------- Public API ----------

export async function signUpLocal({ name, email, password, role = "user" }) {
  const users = await loadUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw new Error("An account with this email already exists.");

  const id = `u_${Date.now().toString(36)}`;
  const passHash = await hashPassword(email, password);

  // store password hash in SecureStore keyed by email (or id)
  await SecureStore.setItemAsync(`sc_pwd_${email.toLowerCase()}`, passHash);

  const user = { id, name, email, role, createdAt: Date.now() };
  users.push(user);
  await saveUsers(users);

  await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, email: user.email }));
  return user;
}

export async function signInLocal({ email, password }) {
  const users = await loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error("No account found for this email.");

  const stored = await SecureStore.getItemAsync(`sc_pwd_${email.toLowerCase()}`);
  const incoming = await hashPassword(email, password);
  if (!stored || stored !== incoming) throw new Error("Invalid credentials.");

  await AsyncStorage.setItem(CURRENT_KEY, JSON.stringify({ id: user.id, email: user.email }));
  return user;
}

export async function signOutLocal() {
  await AsyncStorage.removeItem(CURRENT_KEY);
}

export async function getCurrentUserLocal() {
  const raw = await AsyncStorage.getItem(CURRENT_KEY);
  if (!raw) return null;
  const { id } = JSON.parse(raw);
  const users = await loadUsers();
  return users.find(u => u.id === id) || null;
}

export async function upsertUserLocal(partial) {
  const users = await loadUsers();
  const idx = users.findIndex(u => u.id === partial.id);
  if (idx === -1) throw new Error("User not found");
  users[idx] = { ...users[idx], ...partial };
  await saveUsers(users);
  return users[idx];
}
