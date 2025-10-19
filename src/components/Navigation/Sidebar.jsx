import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const handleSignOut = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    sessionStorage.clear();
    
    // Close sidebar if open
    setIsOpen(false);
    
    // Redirect to landing page
    // Note: Replace '/landing' with actual landing page route when it exists
    // For now, redirecting to '/' or '/login' to prevent app failure
    navigate('/landing');
  };

  const navItems = [
    { path: '/home', label: 'Home', icon: '/icons/home.png' },
    { path: '/map', label: 'Map', icon: '/icons/map.png' },
    { path: '/people', label: 'People', icon: '/icons/people.png' },
    { path: '/voice', label: 'Voice', icon: '/icons/mic.png' },
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
            src="/logo.png"
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
        
        <button
          className="sign-out-button"
          onClick={handleSignOut}
          aria-label="Sign out"
        >
          Sign Out
        </button>
      </aside>
    </>
  );
};

export default Sidebar;