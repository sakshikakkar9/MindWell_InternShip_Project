import React, { useState, useEffect } from 'react';
import API from '../../api.js';

const ReminderSettings = () => {
  const [reminders, setReminders] = useState([]);
  const [activity, setActivity] = useState('journaling');
  const [time, setTime] = useState('09:00');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReminders = async () => {
    const token = localStorage.getItem('token');
    try {
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
      await API.post('/reminders', 
        { activity, time, days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setMessage("Reminder added!");
      fetchReminders();
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setMessage("Failed to add reminder");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await API.delete(`/reminders/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchReminders();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/40 shadow-soft mt-6">
      <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Daily Intentions</h3>

      <form onSubmit={handleAddReminder} className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="flex-1 p-3 bg-white/80 rounded-2xl border-none outline-none text-sm font-medium text-primary shadow-soft min-h-[44px]"
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
            className="p-3 bg-white/80 rounded-2xl border-none outline-none text-sm font-medium text-primary shadow-soft min-h-[44px]"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="btn-primary w-full"
        >
          {isSaving ? 'Adding...' : '+ Set Reminder'}
        </button>
        {message && <p className="text-[10px] text-center font-bold text-sage-dark bg-sage/10 py-2 rounded-xl">{message}</p>}
      </form>

      <div className="space-y-3">
        {reminders.map((r) => (
          <div key={r._id} className="flex justify-between items-center p-4 bg-white/60 rounded-2xl border border-white/20 shadow-soft">
            <div>
              <p className="text-sm font-bold text-primary capitalize">{r.activity}</p>
              <p className="text-[11px] font-medium text-secondary italic">Daily at {r.time}</p>
            </div>
            <button
              onClick={() => handleDelete(r._id)}
              className="text-terracotta hover:text-terracotta-dark p-2 text-xs font-bold transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              Remove
            </button>
          </div>
        ))}
        {reminders.length === 0 && (
          <p className="text-center text-[10px] text-secondary/40 font-bold italic py-4">No reminders set yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReminderSettings;
