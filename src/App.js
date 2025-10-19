import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import screens
import HomeScreen from './components/Screens/HomeScreen';
import MapScreen from './components/Screens/MapScreen';
import PeopleScreen from './components/Screens/PeopleScreen';
import VoiceScreen from './components/Screens/VoiceScreen';

// Import navigation components
import Sidebar from './components/Navigation/Sidebar';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/people" element={<PeopleScreen />} />
            <Route path="/voice" element={<VoiceScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;