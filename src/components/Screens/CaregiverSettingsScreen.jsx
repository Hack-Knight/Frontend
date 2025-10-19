import React from 'react';
import BottomNav from '../Layout/BottomNav';

export default function CaregiverSettingsScreen() {
  const onTap = (label) => () => alert(`${label} clicked`);

  const Card = ({ children }) => (
    <div style={{ background:'#fff', color:'#111', borderRadius:12, boxShadow:'0 1px 2px rgba(0,0,0,0.06)', border:'1px solid #eee' }}>
      {children}
    </div>
  );
  const SectionTitle = ({ children }) => (
    <div style={{ padding:'12px 16px', color:'#9ca3af', fontWeight:600, borderTop:'1px solid #f3f4f6' }}>{children}</div>
  );
  const Row = ({ label, onClick }) => (
    <button onClick={onClick} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px', background:'transparent', border:'none', borderTop:'1px solid #f3f4f6', color:'#111', fontSize:16, textAlign:'left' }}>
      <span>{label}</span>
      <span style={{ color:'#9ca3af' }}>{'>'}</span>
    </button>
  );

  return (
    <div className="screen-container" style={{ paddingBottom:72 }}>
      <div style={{ maxWidth: 420, margin:'0 auto', padding:16 }}>
        <h1 style={{ color:'#111', fontSize:22, fontWeight:700, marginBottom:12 }}>Settings</h1>

        <Card>
          <div style={{ padding:'20px 16px', fontSize:22, fontWeight:700 }}>Example Doe</div>
          <SectionTitle>Account Settings</SectionTitle>
          <Row label="Edit profile" onClick={onTap('Edit Profile')} />
          <SectionTitle>General Settings</SectionTitle>
          <Row label="Speech Speed" onClick={onTap('Speech Speed')} />
          <Row label="Font Size" onClick={onTap('Font Size')} />
          <Row label="Low Sensory Mode" onClick={onTap('Low Sensory Mode')} />
          <SectionTitle>About us</SectionTitle>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
