import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

// Screens
import HomeScreen from "./components/Screens/HomeScreen";
import MapScreen from "./components/Screens/MapScreen";
import PeopleScreen from "./components/Screens/PeopleScreen";
import VoiceScreen from "./components/Screens/VoiceScreen";

// Auth pages
import Signup from "./auth/Signup";
import Login from "./auth/Login";

// Navigation
import Sidebar from "./components/Navigation/Sidebar";

// Local auth
import { getCurrentUser } from "./services/localAuth";

// ---------- Guards ----------
function RequireAuth({ children }) {
  const user = getCurrentUser();
  return user ? children : <Navigate to="/auth/signup" replace />;
}

function PublicOnly({ children }) {
  const user = getCurrentUser();
  return user ? <Navigate to="/" replace /> : children;
}

// ---------- Frame wrapper ----------
function Layout({ children }) {
  const { pathname } = useLocation();
  const isAuthRoute = pathname.startsWith("/auth/");
  return (
    <div className="app">
      {!isAuthRoute && <Sidebar />}
      <main className="main-content">{children}</main>
    </div>
  );
}

// ---------- App ----------
export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Auth routes (public-only) */}
          <Route
            path="/auth/signup"
            element={
              <PublicOnly>
                <Signup />
              </PublicOnly>
            }
          />
          <Route
            path="/auth/login"
            element={
              <PublicOnly>
                <Login />
              </PublicOnly>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomeScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/home"
            element={
              <RequireAuth>
                <HomeScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/map"
            element={
              <RequireAuth>
                <MapScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/people"
            element={
              <RequireAuth>
                <PeopleScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/voice"
            element={
              <RequireAuth>
                <VoiceScreen />
              </RequireAuth>
            }
          />

          {/* Catch-all → signup if logged out, else home */}
          <Route
            path="*"
            element={
              getCurrentUser() ? <Navigate to="/" replace /> : <Navigate to="/auth/signup" replace />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
