import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import TrackingSection from './components/TrackingSection';
import LearningSection from './components/LearningSection';
import AnalyticsSection from './components/AnalyticsSection';

function App() {
  const [activeSection, setActiveSection] = useState('tracking');
  const [trackingData, setTrackingData] = useState([]);

  // Google Auth State
  const [user, setUser] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [consentedEmails, setConsentedEmails] = useState(() => {
    const saved = localStorage.getItem('bjjConsentedEmails');
    return saved ? JSON.parse(saved) : [];
  });
  const googleButtonRef = useRef(null);

  // Load user-specific tracking data when user changes
  useEffect(() => {
    if (user && user.email) {
      const userKey = `bjjTrackingData_${user.email}`;
      const saved = localStorage.getItem(userKey);
      setTrackingData(saved ? JSON.parse(saved) : []);
    } else {
      setTrackingData([]);
    }
  }, [user]);

  // Save tracking data to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (user && user.email) {
      const userKey = `bjjTrackingData_${user.email}`;
      localStorage.setItem(userKey, JSON.stringify(trackingData));
    }
  }, [trackingData, user]);

  // Save consented emails to localStorage
  useEffect(() => {
    localStorage.setItem('bjjConsentedEmails', JSON.stringify(consentedEmails));
  }, [consentedEmails]);

  // Google Sign-In initialization
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current && !user) {
        window.google.accounts.id.initialize({
          client_id: '399520755866-n43nvjctj1mnohaerndl8k3i50jn2olj.apps.googleusercontent.com', // TODO: Replace with your actual Google Client ID
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
        });
        setGoogleLoaded(true);
      }
    };

    // Try to initialize immediately
    initializeGoogleSignIn();

    // If Google script isn't loaded yet, wait for it
    if (!window.google) {
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogleLoaded);
          initializeGoogleSignIn();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
    }

    // Cleanup function
    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, []); // Remove user dependency to prevent re-initialization

  // Handle button rendering when user state changes
  useEffect(() => {
    if (!user && window.google && googleButtonRef.current && googleLoaded) {
      // Re-render the button when user signs out
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 300,
      });
    }
  }, [user, googleLoaded]);

  const handleGoogleResponse = (response) => {
    // Decode JWT to get user info
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const userInfo = JSON.parse(jsonPayload);
    setUser({
      name: userInfo.name,
      email: userInfo.email,
      picture: userInfo.picture,
    });
    setShowConsent(true);
  };

  const handleConsent = (consent) => {
    setShowConsent(false);
    if (consent && user && user.email) {
      setConsentedEmails((prev) =>
        prev.includes(user.email) ? prev : [...prev, user.email]
      );
    }
  };

  const addTrackingEntry = (entry) => {
    // Check if entry is an array (for updates) or single object (for new entry)
    if (Array.isArray(entry)) {
      setTrackingData(entry);
    } else {
      setTrackingData(prev => [...prev, { ...entry, id: Date.now() }]);
    }
  };

  // Show sign-in page if user is not authenticated
  if (!user) {
    return (
      <div className="signin-page">
        <div className="signin-container">
          <div className="signin-content">
            <h1>Mōst Dope BJJ Tracker</h1>
            <p className="signin-subtitle">Track your training, learn techniques, and analyze your progress</p>
            <div className="signin-form">
              <h2>Sign in to continue</h2>
              <div ref={googleButtonRef} style={{ margin: '2rem 0' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show main app content after authentication
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-flex">
          <div className="user-name">{user.name}</div>
          <h1>Mōst Dope BJJ Tracker</h1>
        </div>
        <button className="signout-btn" onClick={() => setUser(null)}>
          Sign out
        </button>
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

      {/* Consent Popup */}
      {showConsent && user && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🎉 Welcome to BJJ Tracker!</h3>
            <p>
              Hi <b>{user.name}</b>! We're excited to help you track your BJJ journey.
            </p>
            <p>
              To provide you with the best experience, we'd like to save your email address (<b>{user.email}</b>) for:
            </p>
            <div style={{ 
              textAlign: 'left', 
              margin: '1.5rem 0',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>✅ <strong>Save your training progress</strong></div>
              <div style={{ marginBottom: '0.5rem' }}>✅ <strong>Sync data across devices</strong></div>
              <div style={{ marginBottom: '0.5rem' }}>✅ <strong>Personalize your experience</strong></div>
              <div>✅ <strong>Future app updates and features</strong></div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '1rem' }}>
              Your data is stored locally and never shared with third parties.
            </p>
            <div className="consent-actions">
              <button className="consent-btn" onClick={() => handleConsent(true)}>
                Yes, I consent
              </button>
              <button className="consent-btn" onClick={() => handleConsent(false)}>
                No, thanks
              </button>
            </div>
          </div>
        </div>
      )}

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
