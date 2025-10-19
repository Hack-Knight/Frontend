import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const base = process.env.PUBLIC_URL || '';

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: `${base}/icons/home.png` },
    { path: '/map', label: 'Map', icon: `${base}/icons/map.png` },
    { path: '/people', label: 'People', icon: `${base}/icons/people.png` },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className={`menu-toggle ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle navigation menu"
      >
        <span></span>
      </button>

      {/* Overlay for mobile */}
      <div 
        className={`overlay ${isOpen ? 'show' : ''}`} 
        onClick={closeSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img 
            src={`${base}/logo.png`} 
            alt="SafeCircle Logo" 
            className="sidebar-logo"
          />
          <h2 className="sidebar-title">SafeCircle</h2>
          <p className="sidebar-subtitle">Stay Safe, Stay Connected</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <img 
                src={item.icon} 
                alt={`${item.label} icon`} 
                className="nav-icon"
              />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;