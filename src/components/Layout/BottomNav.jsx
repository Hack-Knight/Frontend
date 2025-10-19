import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Globe, Settings } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const items = [
    { to: '/home', icon: Home, label: 'Home' },
    { to: '/people', icon: Users, label: 'People' },
    { to: '/map', icon: Globe, label: 'Map' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav
      className="bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: '#fff',
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb',
        zIndex: 1000,
      }}
      role="navigation"
      aria-label="Bottom"
    >
      {items.map(({ to, icon: Icon, label }) => {
        const active = location.pathname === to || (to === '/home' && location.pathname === '/');
        return (
          <Link key={to} to={to} aria-label={label} title={label} style={{ textDecoration: 'none' }}>
            <Icon size={24} color={active ? '#a855f7' : '#111827'} />
          </Link>
        );
      })}
    </nav>
  );
}
