import React, { useState, useEffect } from 'react';
import BreathingExercise from './components/BreathingCircle';
import MoodTrend from './components/MoodTrend';
import JournalTimeline from './components/JournalTimeline';

// --- TASK 19: FEEDBACK COMPONENT (Updated with JWT Auth) ---
const FeedbackForm = () => {
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length < 10) {
      setStatus({ success: false, text: "Feedback must be at least 10 characters." });
      return;
    }
    setIsSending(true);

    // Get the token from storage
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Auth header added
        },
        body: JSON.stringify({ type, message }) // Removed email (backend gets it from JWT)
      });

      if (response.ok) {
        setStatus({ success: true, text: "Thank you! We've received your feedback." });
        setMessage('');
      } else {
        const errorData = await response.json();
        setStatus({ success: false, text: errorData.message || "Failed to send." });
      }
    } catch (err) {
      setStatus({ success: false, text: "Server connection error." });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gray-50 p-6 rounded-[2rem] border border-indigo-50 mt-8">
      <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-4">Report an Issue / Feedback</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select 
          className="w-full p-3 bg-white rounded-xl border-none outline-none text-xs font-bold text-gray-500 shadow-sm"
          value={type} onChange={(e) => setType(e.target.value)}
        >
          <option>General</option>
          <option>Bug</option>
          <option>Suggestion</option>
        </select>
        <textarea 
          className="w-full p-4 bg-white rounded-2xl h-24 resize-none text-sm outline-none shadow-sm focus:ring-2 focus:ring-indigo-100"
          placeholder="Describe the issue or your suggestion..."
          value={message} onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={isSending} className="w-full bg-white border border-indigo-100 text-indigo-600 py-3 rounded-xl font-bold text-xs hover:bg-indigo-50 transition-all">
          {isSending ? 'Sending...' : 'Submit Feedback'}
        </button>
        {status && (
          <p className={`text-center text-[10px] font-bold mt-2 ${status.success ? 'text-green-500' : 'text-red-400'}`}>
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
};

// --- TASK 18: IMPROVED MOOD ANALYTICS COMPONENT ---
const MoodInsights = ({ data }) => {
  const hasData = data && Object.keys(data).length > 0;
  return (
    <div className="w-full mb-8">
      {!hasData ? (
        <div className="p-10 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-medium italic">Write more entries with tags to see your mood correlations ✨</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(data).map(([tag, counts]) => (
            <div key={tag} className="bg-white p-6 rounded-[2rem] border border-indigo-50 shadow-sm transition-all hover:shadow-md">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">#{tag} Impact</h4>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-bold ${counts.positive >= counts.negative ? 'text-green-500' : 'text-orange-400'}`}>
                  {counts.positive >= counts.negative ? '✨ Uplifting' : '☁️ Heavy'}
                </span>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="text-green-400">+{counts.positive}</span>
                  <span className="text-red-300">-{counts.negative}</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
                 <div style={{ width: `${(counts.positive / (counts.positive + counts.negative || 1)) * 100}%` }} className="bg-green-400 h-full transition-all duration-700"></div>
                 <div style={{ width: `${(counts.negative / (counts.positive + counts.negative || 1)) * 100}%` }} className="bg-red-300 h-full transition-all duration-700"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [view, setView] = useState('login'); 
  const [authData, setAuthData] = useState({ email: '', password: '', username: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [showProfile, setShowProfile] = useState(false);
  const [analytics, setAnalytics] = useState({});

  // Fix: Includes auth token and repairs "Invalid Date"
  const fetchEntries = async () => {
  setIsLoading(true);
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`http://localhost:5000/api/journal/entries?email=${authData.email}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
      // --- REPAIR LOGIC FOR "INVALID DATE" LOOPHOLE ---
      const validEntries = data.entries.map(entry => ({
        ...entry,
        // Fallback: If createdAt is corrupt or missing, use current time
        date: isNaN(Date.parse(entry.createdAt)) ? new Date().toISOString() : entry.createdAt
      }));
      setEntries(validEntries);
      generateInsights(validEntries);
    }
  } catch (error) { console.error("Sync Error:", error); } 
  finally { setIsLoading(false); }
};

  const generateInsights = (allEntries) => {
    const posWords = ['great', 'happy', 'good', 'amazing', 'productive', 'calm', 'love', 'super', 'superb', 'mastery'];
    const negWords = ['sad', 'tired', 'anxious', 'stress', 'bad', 'angry', 'hate', 'moodoff', 'overthink'];
    
    let correlations = {};
    allEntries.forEach(entry => {
      const combinedText = (entry.content + " " + entry.title).toLowerCase();
      const rawTags = Array.isArray(entry.tags) ? entry.tags : (entry.tags || "").split(',');
      
      rawTags.forEach(rawTag => {
        const cleanTag = rawTag.toLowerCase().trim().replace('#', '');
        if (!cleanTag) return;
        if (!correlations[cleanTag]) correlations[cleanTag] = { positive: 0, negative: 0 };
        posWords.forEach(word => { if (combinedText.includes(word)) correlations[cleanTag].positive++ });
        negWords.forEach(word => { if (combinedText.includes(word)) correlations[cleanTag].negative++ });
      });
    });
    
    const relevantInsights = Object.fromEntries(
      Object.entries(correlations)
        .filter(([_, v]) => v.positive > 0 || v.negative > 0)
        .sort((a, b) => (b[1].positive + b[1].negative) - (a[1].positive + a[1].negative))
        .slice(0, 3)
    );
    setAnalytics(relevantInsights);
  };

  useEffect(() => { if (isLoggedIn) fetchEntries(); }, [isLoggedIn]);

  // Fix: Saves token to localStorage on successful login
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
        // --- PROFESSIONAL FIX: STANDARDIZE THE KEY NAME ---
        // 1. Remove the incorrect/old key name from the audit image
        localStorage.removeItem('auth_token'); 
        
        // 2. Save the fresh token to the correct key name
        localStorage.setItem('token', data.token); 
        
        setIsLoggedIn(true);
      }
    } else {
      setAuthMessage(data.message || "Auth Error");
    }
  } catch (err) { 
    setAuthMessage("Server Connection Lost"); 
  }
};

  // Fix: Adds Auth header to save request
  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      await fetch('http://localhost:5000/api/journal/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content, tags, email: authData.email }), 
      });
      setTitle(''); setContent(''); setTags('');
      fetchEntries();
    } catch (error) { console.error(error); } 
    finally { setIsSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  const filteredEntries = entries.filter(entry => 
    entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-800">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-10">
          <h2 className="text-3xl font-extrabold mb-8 text-indigo-900">{view === 'login' ? 'Welcome Back' : 'Join MindWell'}</h2>
          <input type="text" placeholder="Email" className="w-full px-5 py-4 bg-gray-50 rounded-2xl mb-4 outline-none" onChange={(e) => setAuthData({...authData, email: e.target.value})} />
          <input type="password" placeholder="Password" className="w-full px-5 py-4 bg-gray-50 rounded-2xl mb-6 outline-none" onChange={(e) => setAuthData({...authData, password: e.target.value})} />
          <button onClick={() => handleAuthAction(view)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg transition-all">
            {view === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <button onClick={() => setView(view === 'login' ? 'signup' : 'login')} className="w-full mt-4 text-indigo-600 text-sm font-semibold">
            {view === 'login' ? 'New here? Create account' : 'Already have an account? Login'}
          </button>
          {authMessage && <p className="mt-4 text-center text-xs text-indigo-400 bg-indigo-50 py-2 rounded-lg">{authMessage}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 space-y-8">
      {/* Header */}
      <div className="max-w-4xl w-full flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-indigo-900 tracking-tighter">MindWell</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{authData.username || authData.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowProfile(!showProfile)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            {showProfile ? '📖 Dashboard' : '👤 My Profile'}
          </button>
          <button onClick={handleLogout} className="text-red-400 font-bold ml-2 text-xs hover:text-red-600 transition-colors">Logout</button>
        </div>
      </div>

      {showProfile ? (
        <div className="max-w-xl w-full space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-2xl font-bold text-gray-800">Profile Settings</h2>
              <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase">Username</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={authData.username} onChange={(e) => setAuthData({...authData, username: e.target.value})} />
              </div>
              <button className="w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:shadow-none transition-all">Update Identity</button>
              
              {/* Task 19: Feedback Form */}
              <FeedbackForm />

              <button onClick={() => setShowProfile(false)} className="w-full text-gray-300 font-bold text-sm">Return to Journal</button>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl w-full space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Express Yourself</h2>
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl mb-4 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Title..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="w-full px-4 py-3 bg-gray-50 rounded-2xl mb-4 h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-100" placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} />
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Tags: #Work, #Coding, #Superb..." value={tags} onChange={(e) => setTags(e.target.value)} />
              <button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg disabled:bg-gray-300 transition-all">
                {isSaving ? 'Encrypting...' : 'Securely Save Entry'}
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <BreathingExercise />
            </div>
          </div>

          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Live Mood Analysis</h3>
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-green-600 uppercase">Engine Running</span>
                </div>
            </div>
            <MoodInsights data={analytics} />
          </section>

          <div className="space-y-10">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Mental Wellness Trends</h3>
                <MoodTrend entries={filteredEntries} />
            </div>
            <div className="relative">
                <input type="text" placeholder="Search your past thoughts..." className="w-full py-5 pl-14 pr-8 bg-white rounded-3xl shadow-sm border-none outline-none focus:ring-2 focus:ring-indigo-200 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 grayscale opacity-40 text-xl">🔍</span>
            </div>
            {isLoading ? (
              <p className="text-center py-20 text-gray-300 font-bold animate-pulse">Syncing your private timeline...</p>
            ) : (
              <JournalTimeline entries={filteredEntries} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;