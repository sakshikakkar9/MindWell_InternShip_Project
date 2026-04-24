import React, { useState, useEffect } from 'react';
import BreathingExercise from './components/BreathingCircle';
import MoodTrend from './components/MoodTrend';
import JournalTimeline from './components/JournalTimeline';
import ReminderSettings from './components/ReminderSettings';
import FeedbackForm from './components/FeedbackForm';
import MoodInsights from './components/MoodInsights';

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

  // PAGINATION STATES
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const fetchEntries = async (isInitial = false) => {
    if (isInitial) {
        setIsLoading(true);
        setPage(1); 
    } else {
        setIsFetchingNextPage(true);
    }

    const token = localStorage.getItem('token');
    const pageToFetch = isInitial ? 1 : page;

    try {
      const response = await fetch(`http://localhost:5000/api/journal/entries?page=${pageToFetch}&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        const validEntries = data.entries.map(entry => ({
          ...entry,
          date: isNaN(Date.parse(entry.createdAt)) ? new Date().toISOString() : entry.createdAt
        }));

        if (isInitial) {
          setEntries(validEntries);
          setPage(2);
        } else {
          setEntries(prev => [...prev, ...validEntries]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(data.hasMore);
        generateInsights(isInitial ? validEntries : [...entries, ...validEntries]);
      }
    } catch (error) { 
        console.error("Fetch Error:", error); 
    } finally { 
        setIsLoading(false);
        setIsFetchingNextPage(false);
    }
  };

  const generateInsights = (allEntries) => {
    const posWords = ['great', 'happy', 'good', 'amazing', 'productive', 'calm', 'love', 'super', 'mastery'];
    const negWords = ['sad', 'tired', 'anxious', 'stress', 'bad', 'angry', 'hate', 'overthink'];
    
    let correlations = {};
    allEntries.forEach(entry => {
      const combinedText = ((entry.content || "") + " " + (entry.title || "")).toLowerCase();
      const rawTags = Array.isArray(entry.tags) ? entry.tags : (entry.tags || "").split(',');
      
      rawTags.forEach(rawTag => {
        const cleanTag = rawTag.toLowerCase().trim().replace('#', '');
        if (!cleanTag) return;
        if (!correlations[cleanTag]) correlations[cleanTag] = { positive: 0, negative: 0 };
        posWords.forEach(word => { if (combinedText.includes(word)) correlations[cleanTag].positive++ });
        negWords.forEach(word => { if (combinedText.includes(word)) correlations[cleanTag].negative++ });
      });
    });
    
    setAnalytics(Object.fromEntries(
      Object.entries(correlations)
        .filter(([_, v]) => v.positive > 0 || v.negative > 0)
        .sort((a, b) => (b[1].positive + b[1].negative) - (a[1].positive + a[1].negative))
        .slice(0, 3)
    ));
  };

  useEffect(() => { 
    const savedToken = localStorage.getItem('token');
    if (savedToken && savedToken !== "undefined") {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => { if (isLoggedIn) fetchEntries(true); }, [isLoggedIn]);

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
          // IMPORTANT: Clear any 'auth_token' or 'undefined' keys
          localStorage.removeItem('auth_token');
          localStorage.setItem('token', data.token); 
          setIsLoggedIn(true);
        }
      } else {
        setAuthMessage(data.message || "Auth Error");
      }
    } catch (err) { setAuthMessage("Server Connection Lost"); }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/journal/save', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content, tags }), 
      });

      if (response.ok) {
        setTitle(''); setContent(''); setTags('');
        // This triggers the reload of the first 5 entries including the new one
        await fetchEntries(true); 
      }
    } catch (error) { 
      console.error("Save failed:", error); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears all tokens and resets the state
    setIsLoggedIn(false);
    setEntries([]);
  };

  const filteredEntries = entries.filter(entry => 
    (entry.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
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
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{authData.email}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowProfile(!showProfile)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all">
            {showProfile ? '📖 Dashboard' : '👤 My Profile'}
          </button>
          <button onClick={handleLogout} className="text-red-400 font-bold ml-2 text-xs hover:text-red-600 transition-colors">Logout</button>
        </div>
      </div>

      {showProfile ? (
        <div className="max-w-xl w-full">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 space-y-8 text-gray-800">
              <h2 className="text-2xl font-bold">Profile Settings</h2>
              <ReminderSettings />
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
              <input className="w-full px-4 py-3 bg-gray-50 rounded-2xl mb-6 outline-none focus:ring-2 focus:ring-indigo-100" placeholder="Tags: #Work, #Coding..." value={tags} onChange={(e) => setTags(e.target.value)} />
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
                <input type="text" placeholder="Search past thoughts..." className="w-full py-5 pl-14 pr-8 bg-white rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-200 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 grayscale opacity-40 text-xl">🔍</span>
            </div>

            {isLoading && page === 1 ? (
              <p className="text-center py-20 text-gray-300 font-bold animate-pulse">Syncing your private timeline...</p>
            ) : (
              <div className="space-y-8">
                <JournalTimeline entries={filteredEntries} />
                
                {hasMore && (
                  <div className="flex justify-center pt-4">
                    <button 
                      onClick={() => fetchEntries(false)}
                      disabled={isFetchingNextPage}
                      className="px-8 py-4 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-bold text-xs shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all disabled:opacity-50"
                    >
                      {isFetchingNextPage ? 'Loading...' : 'Load Older Thoughts ↓'}
                    </button>
                  </div>
                )}
                
                {!hasMore && entries.length > 0 && (
                  <p className="text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">Beginning of journey reached ✨</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;