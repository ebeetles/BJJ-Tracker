import React, { useState, useEffect } from 'react';
import './App.css';
import TrackingSection from './components/TrackingSection';
import LearningSection from './components/LearningSection';
import AnalyticsSection from './components/AnalyticsSection';

function App() {
  const [activeSection, setActiveSection] = useState('tracking');
  const [trackingData, setTrackingData] = useState(() => {
    const saved = localStorage.getItem('bjjTrackingData');
    return saved ? JSON.parse(saved) : [];
  });

  // Save tracking data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bjjTrackingData', JSON.stringify(trackingData));
  }, [trackingData]);

  const addTrackingEntry = (entry) => {
    // Check if entry is an array (for updates) or single object (for new entry)
    if (Array.isArray(entry)) {
      setTrackingData(entry);
    } else {
      setTrackingData(prev => [...prev, { ...entry, id: Date.now() }]);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>BJJ Tracker</h1>
        <nav className="nav-tabs">
          <button 
            className={`nav-tab ${activeSection === 'tracking' ? 'active' : ''}`}
            onClick={() => setActiveSection('tracking')}
          >
            📊 Tracking
          </button>
          <button 
            className={`nav-tab ${activeSection === 'learning' ? 'active' : ''}`}
            onClick={() => setActiveSection('learning')}
          >
            📚 Learning
          </button>
          <button 
            className={`nav-tab ${activeSection === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveSection('analytics')}
          >
            📈 Analytics
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeSection === 'tracking' && (
          <TrackingSection 
            trackingData={trackingData}
            onAddEntry={addTrackingEntry}
          />
        )}
        {activeSection === 'learning' && (
          <LearningSection />
        )}
        {activeSection === 'analytics' && (
          <AnalyticsSection trackingData={trackingData} />
        )}
      </main>
    </div>
  );
}

export default App;
