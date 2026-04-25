import React, { useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';
import BreathingExercise from './components/BreathingCircle';
import MoodTrend from './components/MoodTrend';
import JournalTimeline from './components/JournalTimeline';
import ReminderSettings from './components/ReminderSettings';
import FeedbackForm from './components/FeedbackForm';
import MoodInsights from './components/MoodInsights';
import { saveOfflineEntry, getOfflineEntries, clearOfflineEntries } from './utils/db';

const SECRET_KEY = 'your-secret-key-123'; 

function App() {
  // --- STATE MANAGEMENT ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [view, setView] = useState('login'); 
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [analytics, setAnalytics] = useState({});

  // --- REMINDER ENGINE ---
  useEffect(() => {
    if (isLoggedIn) {
      // Request browser permission for notifications
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

      const interval = setInterval(checkReminders, 60000); // Check every minute
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
      const response = await fetch(`http://localhost:5000/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData),
      });
      const data = await response.json();
      if (response.ok) {
        if (endpoint === 'signup') { 
          setAuthMessage("Account Ready! Login now."); 
          setView('login'); 
        } else {
          localStorage.setItem('token', data.token); 
          setIsLoggedIn(true);
        }
      } else {
        setAuthMessage(data.message || "Invalid Credentials");
      }
    } catch (err) { setAuthMessage("Server connection failed."); }
  };

  const handleSync = async () => {
    const offlineData = await getOfflineEntries();
    if (offlineData.length > 0) {
      const token = localStorage.getItem('token');
      try {
        for (const entry of offlineData) {
          await fetch('http://localhost:5000/api/journal/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(entry),
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
      const response = await fetch(`http://localhost:5000/api/journal/entries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const decoded = data.entries.map(entry => {
          try {
            const bytes = CryptoJS.AES.decrypt(entry.content, SECRET_KEY);
            return { ...entry, content: bytes.toString(CryptoJS.enc.Utf8) };
          } catch (e) { return entry; }
        });
        setEntries(decoded);
        generateInsights(decoded);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    const encrypted = CryptoJS.AES.encrypt(content, SECRET_KEY).toString();
    const entryData = { title, content: encrypted, tags };

    if (!isOnline) {
      await saveOfflineEntry(entryData);
      setAuthMessage("Saved offline.");
      setContent(''); setTitle(''); setTags('');
      setIsSaving(false);
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/journal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(entryData),
      });
      if (res.ok) { setContent(''); setTitle(''); setTags(''); fetchEntries(); }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
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

  // --- RENDER ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 border border-slate-100">
          <h2 className="text-3xl font-black text-indigo-950 mb-6 text-center">MindWell</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
            <input type="password" placeholder="Password" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
            <button onClick={() => handleAuthAction(view)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
              {view === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
            <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="w-full text-indigo-600/60 text-xs font-bold uppercase tracking-widest pt-2">
              {view === 'login' ? 'Create Account' : 'Back to Login'}
            </button>
          </div>
          {authMessage && <p className="mt-6 text-center text-xs text-indigo-500 font-bold bg-indigo-50 py-3 rounded-xl">{authMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFF] flex flex-col items-center py-8 px-4">
      <nav className="max-w-6xl w-full flex justify-between items-center bg-white px-8 py-5 rounded-2xl shadow-sm border border-slate-100 mb-10">
        <div>
          <span className="text-xl font-black text-indigo-950">MindWell</span>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
        </div>
        <div className="flex gap-6 items-center">
          <button onClick={() => setShowProfile(!showProfile)} className="text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600">
            {showProfile ? 'Dashboard' : 'Profile'}
          </button>
          <button onClick={() => { localStorage.clear(); setIsLoggedIn(false); }} className="px-5 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg">Logout</button>
        </div>
      </nav>

      {showProfile ? (
        <div className="max-w-2xl w-full bg-white p-12 rounded-[2rem] shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-8">Account Settings</h2>
          <ReminderSettings />
          <div className="my-8 h-px bg-slate-50"></div>
          <FeedbackForm />
          <button onClick={() => setShowProfile(false)} className="mt-8 text-indigo-600 font-bold text-xs uppercase">← Return</button>
        </div>
      ) : (
        <main className="max-w-6xl w-full space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-10 shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
              <input className="w-full px-0 text-3xl font-black placeholder:text-slate-200 border-none outline-none mb-4 text-indigo-950" placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="w-full px-0 py-2 text-slate-600 placeholder:text-slate-300 border-none outline-none flex-grow resize-none leading-relaxed text-lg" placeholder="How are you feeling?" value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="mt-8 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-50">
                <input className="flex-grow px-4 py-3 bg-slate-50 rounded-xl text-sm outline-none" placeholder="Tags #peace" value={tags} onChange={(e) => setTags(e.target.value)} />
                <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-700">
                  {isSaving ? 'Saving...' : 'Save Entry'}
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center p-8 text-center min-h-[450px] shadow-sm">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Mindful Breathing</h3>
               <BreathingExercise />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Mood Insights</h4>
                {Object.keys(analytics).length > 0 ? <MoodInsights data={analytics} /> : <div className="py-10 text-center text-slate-300 italic text-xs">Unlock insights with more entries...</div>}
             </div>
             <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Mood Trajectory</h4>
                <MoodTrend entries={entries} />
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 px-2">
              <h3 className="text-2xl font-black text-indigo-950 tracking-tight">History</h3>
              <div className="relative w-full md:w-80">
                <input type="text" placeholder="Search..." className="w-full py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>
            <JournalTimeline entries={entries.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()) || e.title.toLowerCase().includes(searchQuery.toLowerCase()))} />
          </div>
        </main>
      )}
    </div>
  );
}

export default App;