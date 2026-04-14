import React, { useState, useEffect } from 'react';
import { formatTitleForUI, formatTagsForUI } from './utils/formatters';
import BreathingExercise from './components/BreathingCircle';
import MoodTrend from './components/MoodTrend';
import JournalTimeline from './components/JournalTimeline';

function App() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Task 12: Search State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/journal/entries');
      const data = await response.json();
      
      if (response.ok && data.entries) {
        const formattedEntries = data.entries.map(entry => ({
          ...entry,
          date: entry.date || entry.createdAt 
        }));
        setEntries(formattedEntries); 
      } else {
        setEntries([]); 
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Task 12: Real-time Filtering Logic
  const filteredEntries = entries.filter(entry => {
    const query = searchQuery.toLowerCase();
    const matchesText = (entry.title?.toLowerCase().includes(query)) || 
                        (entry.content?.toLowerCase().includes(query));
    const matchesTags = entry.tags?.some(tag => tag.toLowerCase().includes(query));
    const matchesDate = new Date(entry.date).toLocaleDateString().toLowerCase().includes(query);

    return matchesText || matchesTags || matchesDate;
  });

  const handleSave = async () => {
    if (!title || !content) return alert("Please provide both a title and content.");
    setIsSaving(true);
    try {
      const response = await fetch('http://localhost:5000/api/journal/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });
      if (response.ok) {
        setTitle(''); setContent(''); setTags('');
        fetchEntries(); 
      }
    } catch (error) {
      console.error("Connection Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 space-y-8 text-gray-800">
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Entry Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-fit">
          <h1 className="text-2xl font-bold mb-6">New Journal Entry</h1>
          <input 
            type="text"
            className="w-full px-4 py-2 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea 
            className="w-full px-4 py-2 border rounded-xl mb-4 h-32 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <input 
            type="text"
            className="w-full px-4 py-2 border rounded-xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            {isSaving ? 'Saving...' : 'Securely Save Entry'}
          </button>
        </div>

        <BreathingExercise />
      </div>

      {/* Task 12: Search Bar */}
      <div className="max-w-4xl w-full relative group">
        <span className="absolute left-4 top-4 text-gray-400">🔍</span>
        <input 
          type="text"
          placeholder="Search by keyword, tag, or date..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 shadow-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Professional Trend Graph (Task 12 Enhanced) */}
      {filteredEntries.length > 0 && (
        <div className="max-w-4xl w-full bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <MoodTrend entries={filteredEntries} />
        </div>
      )}

      {/* Timeline View */}
      <div className="max-w-4xl w-full">
        {isLoading ? (
          <div className="text-center py-20 animate-pulse text-gray-400 font-medium">Syncing with your journey...</div>
        ) : filteredEntries.length > 0 ? (
          <JournalTimeline entries={filteredEntries} />
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
            <p className="text-gray-400 italic">No entries match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;