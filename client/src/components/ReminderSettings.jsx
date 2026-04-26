import React, { useState, useEffect } from 'react';
import API from '../../api.js'; // Adjust the path based on your folder structure

const ReminderSettings = () => {
  const [reminders, setReminders] = useState([]);
  const [activity, setActivity] = useState('journaling');
  const [time, setTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReminders = async () => {
    const token = localStorage.getItem('token');
    try {
      // Replaced fetch with API.get
      const response = await API.get('/reminders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReminders(response.data);
    } catch (err) {
      console.error("Failed to fetch reminders", err);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('token');
    try {
      // Replaced fetch with API.post
      await API.post('/reminders', 
        { activity, time, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage("Reminder added!");
      fetchReminders();
    } catch (err) {
      setMessage("Failed to add reminder");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      // Replaced fetch with API.delete
      await API.delete(`/reminders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-indigo-50 shadow-sm mt-6">
      <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest mb-4">Wellness Reminders</h3>

      <form onSubmit={handleAddReminder} className="space-y-3 mb-6">
        <div className="flex gap-2">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="flex-1 p-3 bg-gray-50 rounded-xl border-none outline-none text-xs font-bold text-gray-500"
          >
            <option value="journaling">Journaling</option>
            <option value="meditation">Meditation</option>
            <option value="breathing">Breathing</option>
            <option value="other">Other Activity</option>
          </select>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="p-3 bg-gray-50 rounded-xl border-none outline-none text-xs font-bold text-gray-500"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-md"
        >
          {isSaving ? 'Adding...' : '+ Add Reminder'}
        </button>
        {message && <p className="text-[10px] text-center font-bold text-indigo-400">{message}</p>}
      </form>

      <div className="space-y-2">
        {reminders.map((r) => (
          <div key={r._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="text-xs font-black text-gray-700 capitalize">{r.activity}</p>
              <p className="text-[10px] font-bold text-gray-400">Daily at {r.time}</p>
            </div>
            <button
              onClick={() => handleDelete(r._id)}
              className="text-red-300 hover:text-red-500 text-xs font-bold transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-center text-[10px] text-gray-300 font-bold italic">No reminders set yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReminderSettings;