import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import TrackingSection from './components/TrackingSection';
import LearningSection from './components/LearningSection';
import AnalyticsSection from './components/AnalyticsSection';
import { supabase } from './supabase';

function App() {
  const [activeSection, setActiveSection] = useState('tracking');
  const [trackingData, setTrackingData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Google Auth State
  const [user, setUser] = useState(null);
  const [showConsent, setShowConsent] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const googleButtonRef = useRef(null);

  // Initialize Supabase auth listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email,
          email: session.user.email,
          picture: session.user.user_metadata?.avatar_url
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            name: session.user.user_metadata?.full_name || session.user.email,
            email: session.user.email,
            picture: session.user.user_metadata?.avatar_url
          });
        } else {
          setUser(null);
          setTrackingData([]);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load user-specific tracking data when user changes
  const loadTrackingData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_entries')
        .select('*')
        .eq('user_email', user.email)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading data:', error);
        return;
      }

      setTrackingData(data || []);
    } catch (error) {
      console.error('Error loading tracking data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email) {
      loadTrackingData();
    }
  }, [user, loadTrackingData]);

  // Save tracking data to Supabase whenever it changes
  const saveTrackingData = useCallback(async (data) => {
    try {
      // Delete existing entries for this user
      await supabase
        .from('tracking_entries')
        .delete()
        .eq('user_email', user.email);

      // Insert new entries
      if (data.length > 0) {
        const entriesToInsert = data.map(entry => ({
          user_email: user.email,
          date: entry.date,
          hours: entry.hours,
          submissions_got: entry.submissionsGot,
          submissions_received: entry.submissionsReceived,
          notes: entry.notes
        }));

        const { error } = await supabase
          .from('tracking_entries')
          .insert(entriesToInsert);

        if (error) {
          console.error('Error saving data:', error);
        }
      }
    } catch (error) {
      console.error('Error saving tracking data:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user?.email && trackingData.length > 0) {
      saveTrackingData(trackingData);
    }
  }, [trackingData, user, saveTrackingData]);

  // Google Sign-In initialization
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && googleButtonRef.current && !user) {
        window.google.accounts.id.initialize({
          client_id: '399520755866-n43nvjctj1mnohaerndl8k3i50jn2olj.apps.googleusercontent.com',
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

    // Only initialize if user is not signed in
    if (!user) {
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
    }

    // Cleanup function
    return () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user]);

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

  const handleGoogleResponse = async (response) => {
    try {
      // Sign in with Supabase using Google token
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.credential,
      });

      if (error) {
        console.error('Error signing in:', error);
        return;
      }

      setShowConsent(true);
    } catch (error) {
      console.error('Error during sign in:', error);
    }
  };

  const handleConsent = (consent) => {
    setShowConsent(false);
    // Consent is handled automatically by Supabase
  };

  const addTrackingEntry = (entry) => {
    // Check if entry is an array (for updates) or single object (for new entry)
    if (Array.isArray(entry)) {
      setTrackingData(entry);
    } else {
      setTrackingData(prev => [...prev, { ...entry, id: Date.now() }]);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

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
        <button className="signout-btn" onClick={handleSignOut}>
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
