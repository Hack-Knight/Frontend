import React from 'react';
import VoiceAgent from './VoiceAgent';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <VoiceAgent inline showHeader={false} />
    </div>
  );
};

export default LandingPage;