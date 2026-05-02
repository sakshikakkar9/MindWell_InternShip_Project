import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import API from '../api.js';

import BreathingExercise from './components/BreathingCircle';
import MoodTrend from './components/MoodTrend';
import JournalTimeline from './components/JournalTimeline';
import ReminderSettings from './components/ReminderSettings';
import FeedbackForm from './components/FeedbackForm';
import MoodInsights from './components/MoodInsights';
import WellnessResources from './components/WellnessResources';
import WellnessReport from './components/WellnessReport';
import VersionComparison from './components/VersionComparison';
import { useRef } from 'react';
import { saveOfflineEntry, getOfflineEntries, clearOfflineEntries, verifyDataConsistency } from './utils/db';

const SECRET_KEY = 'your-secret-key-123'; 

function App() {
  // --- STATE MANAGEMENT ---
  const mainContentRef = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [view, setView] = useState('login'); 
  const [mainView, setMainView] = useState('dashboard'); // dashboard, profile, resources
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [comparingEntry, setComparingEntry] = useState(null);
  const [analytics, setAnalytics] = useState({});

  // --- REMINDER ENGINE ---
  useEffect(() => {
    if (isLoggedIn) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

      const checkReminders = () => {
        const savedReminders = JSON.parse(localStorage.getItem('wellness_reminders') || '[]');
        const now = new Date();
        const currentTime = now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit', 
          hour12: true 
        });

        savedReminders.forEach(reminder => {
          if (reminder.time === currentTime) {
            new Notification("MindWell Reminder", {
              body: `It's time for your ${reminder.type} session!`,
              icon: "/vite.svg" 
            });
          }
        });
      };

      const interval = setInterval(checkReminders, 60000); 
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // --- NETWORK MONITOR ---
  useEffect(() => {
    const updateStatus = () => {
      setIsOnline(navigator.onLine);
      if (navigator.onLine) handleSync();
    };
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  // --- AUTH & DATA LOGIC ---
  const handleAuthAction = async (endpoint) => {
    setAuthMessage("");
    try {
      const payload = endpoint === 'login' 
        ? { email: authData.email, password: authData.password }
        : { username: authData.username, email: authData.email, password: authData.password };

      const response = await API.post(`/auth/${endpoint}`, payload);
      
      if (endpoint === 'signup') { 
        setAuthMessage("Account Ready! Login now."); 
        setView('login'); 
      } else {
        localStorage.setItem('token', response.data.token); 
        setIsLoggedIn(true);
      }
    } catch (err) { 
      setAuthMessage(err.response?.data?.message || "Server connection failed."); 
    }
  };

  const handleSync = async () => {
    const offlineData = await getOfflineEntries();
    if (offlineData.length > 0) {
      const token = localStorage.getItem('token');
      try {
        for (const entry of offlineData) {
          await API.post('/journal/save', entry, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        await clearOfflineEntries();
        fetchEntries(); 
      } catch (err) { console.error(err); }
    }
  };

  const fetchEntries = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await API.get(`/journal/entries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      verifyDataConsistency(response.data.entries.length);
      
      const decoded = response.data.entries.map(entry => {
        try {
          const bytes = CryptoJS.AES.decrypt(entry.content, SECRET_KEY);
          const decryptedContent = bytes.toString(CryptoJS.enc.Utf8);

          let decryptedHistory = [];
          if (entry.versionHistory) {
            decryptedHistory = entry.versionHistory.map(v => {
              try {
                const vBytes = CryptoJS.AES.decrypt(v.content, SECRET_KEY);
                return { ...v, content: vBytes.toString(CryptoJS.enc.Utf8) };
              } catch { return v; }
            });
          }

          return { ...entry, content: decryptedContent, versionHistory: decryptedHistory };
        } catch { return entry; }
      });
      setEntries(decoded);
      generateInsights(decoded);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    const positiveWords = ['happy', 'joy', 'excited', 'wonderful', 'great', 'content', 'peaceful', 'calm', 'grateful', 'blessed', 'productive', 'love', 'amazing'];
    const negativeWords = ['sad', 'angry', 'stressed', 'anxious', 'worried', 'tired', 'frustrated', 'bad', 'awful', 'terrible', 'lonely', 'depressed', 'hate'];
    const words = content.toLowerCase().split(/\W+/);
    let score = 3;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 0.5;
      if (negativeWords.includes(word)) score -= 0.5;
    });
    const sentimentScore = Math.max(1, Math.min(5, Math.round(score)));

    const encrypted = CryptoJS.AES.encrypt(content, SECRET_KEY).toString();
    const entryData = { title, content: encrypted, tags, sentimentScore };

    const token = localStorage.getItem('token');
    try {
      if (editingEntryId) {
        await API.put(`/journal/${editingEntryId}`, entryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setEditingEntryId(null);
      } else {
        if (!isOnline) {
          await saveOfflineEntry(entryData);
          setAuthMessage("Saved offline.");
          setContent(''); setTitle(''); setTags('');
          setIsSaving(false);
          return;
        }

        await API.post('/journal/save', entryData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      setContent(''); setTitle(''); setTags('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      fetchEntries();
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  const handleEdit = (entry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setTags(Array.isArray(entry.tags) ? entry.tags.join(', ') : entry.tags);
    setEditingEntryId(entry._id);
    setMainView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompare = (entry) => {
    setComparingEntry(entry);
  };

  const generateInsights = (allEntries) => {
    let correlations = {};
    allEntries.forEach(entry => {
      const rawTags = (entry.tags || "").split(',');
      rawTags.forEach(tag => {
        const cleanTag = tag.trim().replace('#', '').toLowerCase();
        if (!cleanTag) return;
        correlations[cleanTag] = (correlations[cleanTag] || 0) + 1;
      });
    });
    setAnalytics(correlations);
  };

  useEffect(() => { 
    const savedToken = localStorage.getItem('token');
    if (savedToken) setIsLoggedIn(true);
  }, []);

  useEffect(() => { if (isLoggedIn) fetchEntries(); }, [isLoggedIn]);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
      window.scrollTo(0, 0);
    }
  }, [mainView]);

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full glass rounded-3xl p-10 fade-in">
          <h2 className="text-4xl font-serif font-bold text-primary mb-2 text-center">MindWell</h2>
          <p className="text-secondary text-center mb-8">Your peaceful space for reflection.</p>
          <div className="space-y-4">
            {view === 'signup' && (
              <input 
                type="text" 
                placeholder="Username" 
                className="input-field glow-focus"
                value={authData.username}
                onChange={(e) => setAuthData({...authData, username: e.target.value})} 
              />
            )}
            
            <input 
              type="text" 
              placeholder="Email" 
              className="input-field glow-focus"
              value={authData.email}
              onChange={(e) => setAuthData({...authData, email: e.target.value})} 
            />
            
            <input 
              type="password" 
              placeholder="Password" 
              className="input-field glow-focus"
              value={authData.password}
              onChange={(e) => setAuthData({...authData, password: e.target.value})} 
            />
            
            <button onClick={() => handleAuthAction(view)} className="btn-primary w-full text-lg mt-4">
              {view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="w-full text-sage font-bold text-sm uppercase tracking-widest mt-4 hover:text-sage-dark transition-colors">
              {view === 'login' ? 'Create Account' : 'Back to Login'}
            </button>
          </div>
          {authMessage && <p className="mt-6 text-center text-sm text-sage-dark font-medium bg-sage/10 py-3 rounded-xl">{authMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center font-sans pb-24 md:pb-8">
      {/* Desktop Navigation */}
      <nav className="hidden md:flex max-w-6xl w-full justify-between items-center bg-white/60 backdrop-blur-md px-8 py-4 rounded-3xl mt-6 shadow-soft border border-white/40">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-serif font-bold text-primary">MindWell</span>
          <div className="flex items-center gap-1.5 bg-white/50 px-3 py-1 rounded-full border border-white/30">
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-sage' : 'bg-terracotta animate-pulse'}`}></div>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">{isOnline ? 'Online' : 'Offline'}</span>
          </div>
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setMainView('dashboard')} className={`px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${mainView === 'dashboard' ? 'text-sage' : 'text-secondary hover:text-sage'} min-h-[44px]`}>
            Journal
          </button>
          <button onClick={() => setMainView('resources')} className={`px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${mainView === 'resources' ? 'text-sage' : 'text-secondary hover:text-sage'} min-h-[44px]`}>
            Resources
          </button>
          <button onClick={() => setMainView('profile')} className={`px-4 py-3 text-sm font-bold uppercase tracking-widest transition-colors ${mainView === 'profile' ? 'text-sage' : 'text-secondary hover:text-sage'} min-h-[44px]`}>
            Profile
          </button>
          <button onClick={() => { localStorage.clear(); setIsLoggedIn(false); }} className="px-5 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-soft active:scale-95 min-h-[44px]">Logout</button>
        </div>
      </nav>

      {/* Mobile Header */}
      <header className="md:hidden w-full px-6 pt-6 flex justify-between items-center">
        <span className="text-2xl font-serif font-bold text-primary">MindWell</span>
        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-sage' : 'bg-terracotta animate-pulse'}`}></div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl px-4 mt-8">
        {mainView === 'profile' && (
          <div
            ref={mainContentRef}
            tabIndex="-1"
            className="max-w-2xl mx-auto glass p-8 md:p-12 rounded-3xl outline-none fade-in"
          >
            <h2 className="text-3xl font-serif font-bold text-primary mb-8">Account Settings</h2>
            <ReminderSettings />
            <div className="my-8 h-px bg-secondary/10"></div>
            <FeedbackForm />
            <button onClick={() => setMainView('dashboard')} className="mt-8 text-sage font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform">
              ← Return to Journal
            </button>
          </div>
        )}

        {mainView === 'resources' && (
          <div
            ref={mainContentRef}
            tabIndex="-1"
            className="outline-none fade-in"
          >
            <WellnessReport />
            <WellnessResources />
          </div>
        )}

        {mainView === 'dashboard' && (
          <main
            ref={mainContentRef}
            tabIndex="-1"
            className="space-y-8 outline-none fade-in"
          >
            {isLoading ? (
              <div className="py-20 text-center text-secondary italic">Loading your peaceful space...</div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 bg-gradient-to-br from-white/80 to-sage/5 rounded-3xl p-6 md:p-10 flex flex-col min-h-[450px] shadow-soft border border-white/40 relative">
                    {showSuccess && (
                      <div className="absolute top-4 right-4 bg-sage text-white px-4 py-2 rounded-xl text-xs font-bold animate-bounce shadow-soft">
                        Reflection Saved ✨
                      </div>
                    )}
                    <input
                      className="w-full bg-transparent px-0 text-3xl md:text-4xl font-serif font-bold placeholder:text-secondary/20 border-none outline-none mb-6 text-primary focus:ring-0"
                      placeholder="Today's reflection..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                      className="w-full bg-transparent px-4 py-3 text-primary placeholder:text-secondary/30 border-none outline-none flex-grow resize-none leading-relaxed text-lg glow-focus rounded-2xl transition-all"
                      placeholder="How are you feeling today?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-secondary/5">
                      <input
                        className="flex-grow px-6 py-3 bg-white/40 rounded-2xl text-sm outline-none border border-transparent focus:border-sage transition-all"
                        placeholder="Tags (e.g. #calm, #grateful)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                      <div className="flex gap-2">
                        {editingEntryId && (
                          <button
                            onClick={() => { setEditingEntryId(null); setTitle(''); setContent(''); setTags(''); }}
                            className="px-6 py-3 bg-terracotta/20 text-terracotta-dark rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-terracotta/30 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="btn-primary flex-1 sm:flex-none min-w-[140px]"
                        >
                          {isSaving ? 'Saving...' : (editingEntryId ? 'Update' : 'Save Entry')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-3xl flex flex-col items-center justify-center p-8 text-center min-h-[450px]">
                     <h3 className="text-xs font-bold text-secondary uppercase tracking-widest mb-10">Mindful Breathing</h3>
                     <BreathingExercise />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="glass rounded-3xl p-8">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">Mood Insights</h4>
                      {Object.keys(analytics).length > 0 ? <MoodInsights data={analytics} /> : <div className="py-10 text-center text-secondary/40 italic text-sm">Reflect more to see your patterns...</div>}
                   </div>
                   <div className="glass rounded-3xl p-8">
                      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-6">Mood Trajectory</h4>
                      <MoodTrend entries={entries} />
                   </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
                    <h3 className="text-3xl font-serif font-bold text-primary tracking-tight">Your History</h3>
                    <div className="relative w-full md:w-80">
                      <input
                        type="text"
                        placeholder="Search your reflections..."
                        className="w-full py-4 px-6 bg-white/60 border border-white/40 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-sage/10 focus:border-sage transition-all shadow-soft"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <JournalTimeline
                    entries={entries.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()) || e.title.toLowerCase().includes(searchQuery.toLowerCase()))}
                    onEdit={handleEdit}
                    onCompare={handleCompare}
                  />
                </div>
              </>
            )}
          </main>
        )}
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/40 px-6 py-3 flex justify-around items-center z-50">
        <button onClick={() => setMainView('dashboard')} className={`flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] ${mainView === 'dashboard' ? 'text-sage' : 'text-secondary'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Journal</span>
        </button>
        <button onClick={() => setMainView('resources')} className={`flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] ${mainView === 'resources' ? 'text-sage' : 'text-secondary'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Resources</span>
        </button>
        <button onClick={() => setMainView('profile')} className={`flex flex-col items-center gap-1 p-2 min-w-[64px] min-h-[44px] ${mainView === 'profile' ? 'text-sage' : 'text-secondary'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </nav>

      {comparingEntry && (
        <VersionComparison
          current={comparingEntry}
          history={comparingEntry.versionHistory}
          onClose={() => setComparingEntry(null)}
        />
      )}
    </div>
  );
}

export default App;
