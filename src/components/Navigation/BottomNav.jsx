import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const base = process.env.PUBLIC_URL || '';

  const items = [
    { path: '/', label: 'Home', icon: `${base}/icons/home.png` },
    { path: '/people', label: 'People', icon: `${base}/icons/people.png` },
    { path: '/map', label: 'Map', icon: `${base}/icons/map.png` },
  ];

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main">
      {items.map((item) => {
        const isHome = item.path === '/';
        const active = location.pathname === item.path || (isHome && location.pathname === '/home');
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            aria-label={item.label}
          >
            <img src={item.icon} alt="" className="bottom-nav-icon" aria-hidden="true" />
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
