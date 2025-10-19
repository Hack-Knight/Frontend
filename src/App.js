import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import screens
import HomeScreen from './components/Screens/HomeScreen';
import MapScreen from './components/Screens/MapScreen';
import PeopleScreen from './components/Screens/PeopleScreen';
import LandingPage from './components/Screens/LandingPage';

// Import navigation components
import Sidebar from './components/Navigation/Sidebar';
import BottomNav from './components/Navigation/BottomNav';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="/people" element={<PeopleScreen />} />
          </Routes>
        </main>
        {/* Fixed mobile bottom navigation */}
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;