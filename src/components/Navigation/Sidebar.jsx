import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { signOutLocal } from "../../services/localAuth"; // ✅ add this import
import "./Sidebar.css";

const navItems = [
  { path: "/home",  label: "Home",   icon: "/assets/icons/home.png" },
  { path: "/map",   label: "Map",    icon: "/assets/icons/map.png" },
  { path: "/people",label: "People", icon: "/assets/icons/people.png" },
  { path: "/pair",  label: "Pair",   icon: "/assets/icons/link.png" }, // use a distinct icon if you have one
  { path: "/voice", label: "Voice",  icon: "/assets/icons/mic.png" },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const nav = useNavigate();

  const toggleSidebar = () => setIsOpen(o => !o);
  const closeSidebar = () => setIsOpen(false);

  // Close the sidebar whenever the route changes (helpful on mobile)
  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeSidebar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    signOutLocal();
    nav("/auth/login", { replace: true });
    // If state lingers, uncomment:
    // window.location.reload();
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
      <div
        className={`overlay ${isOpen ? "show" : ""}`}
        onClick={closeSidebar}
        aria-hidden={!isOpen}
      />

      {/* Sidebar */}
      <aside
        id="app-sidebar"
        className={`sidebar ${isOpen ? "open" : ""}`}
        role="navigation"
        aria-label="Main"
      >
        <div className="sidebar-header">
          <img
            src="/assets/logo.png"
            alt="SafeCircle logo"
            className="sidebar-logo"
          />
          <h2 className="sidebar-title">SafeCircle</h2>
          <p className="sidebar-subtitle">Stay Safe, Stay Connected</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
              onClick={closeSidebar}
              end={item.path === "/home" || item.path === "/"} // tighter match for home
            >
              <img
                src={item.icon}
                alt=""
                className="nav-icon"
                aria-hidden="true"
              />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer actions */}
        <div className="sidebar-footer">
          <button
            className="btn btn-danger logout-btn"
            onClick={handleLogout}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
