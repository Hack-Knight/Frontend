import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOutLocal } from "../../services/localAuth"; // ✅ add this import
import "./Sidebar.css";

const navItems = [
  { path: "/home",  label: "Home",   icon: "icons/home.png" },
  { path: "/map",   label: "Map",    icon: "icons/map.png" },
  { path: "/people",label: "People", icon: "icons/people.png" },
  { path: "/pair",  label: "Pair",   icon: "icons/people.png" },
  { path: "/voice", label: "Voice",  icon: "icons/mic.png" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  const toggleSidebar = () => setIsOpen(o => !o);
  const closeSidebar = () => setIsOpen(false);

  useEffect(() => { closeSidebar(); }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeSidebar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Toggle a class on <body> while the sidebar is open (to disable map pointer events)
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
    return () => document.body.classList.remove('sidebar-open');
  }, [isOpen]);

  const handleLogout = () => {
    signOutLocal();
    nav("/auth/login", { replace: true });
  };

  const base = process.env.PUBLIC_URL || "";
  const onIconError = (e) => {
    const fallback = `${base}/icons/people.png`;
    if (e?.target && e.target.src !== fallback) {
      e.target.src = fallback;
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        className={`menu-toggle ${isOpen ? "open" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
      >
        <span></span>
      </button>

      {/* Overlay for mobile */}
      <div className={`overlay ${isOpen ? "show" : ""}`} onClick={closeSidebar} aria-hidden={!isOpen} />

      {/* Sidebar */}
      <aside id="app-sidebar" className={`sidebar ${isOpen ? "open" : ""}`} role="navigation" aria-label="Main">
        <div className="sidebar-header">
          <img
            src={`${base}/logo.png`}
            alt="SafeCircle logo"
            className="sidebar-logo"
            onError={(e) => {
              const fb = `${base}/icons/people.png`;
              if (e?.target && e.target.src !== fb) e.target.src = fb;
            }}
          />
          <h2 className="sidebar-title">SafeCircle</h2>
          <p className="sidebar-subtitle">Stay Safe, Stay Connected</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={closeSidebar}
              end={item.path === "/home" || item.path === "/"}
            >
              <img
                src={`${base}/${item.icon}`}
                alt=""
                className="nav-icon"
                aria-hidden="true"
                onError={onIconError}
              />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn btn-danger logout-btn" onClick={handleLogout} aria-label="Sign out">Sign out</button>
        </div>
      </aside>
    </>
  );
}
