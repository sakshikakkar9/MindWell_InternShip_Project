import React, { useState } from 'react';
import API from '../../api.js';

const FeedbackForm = () => {
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem('token');

    try {
      await API.post('/feedback', 
        { type, message },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setStatus({ success: true, text: "Feedback sent! Thank you." });
      setMessage('');
      setTimeout(() => setStatus(null), 5000);
    } catch (err) {
      setStatus({ 
        success: false, 
        text: err.response?.data?.message || "Server connection error." 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-sm p-6 rounded-3xl border border-white/40 shadow-soft">
      <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6 text-center">Help us grow</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="feedback-type" className="sr-only">Feedback Type</label>
          <select
            id="feedback-type"
            className="w-full p-3 bg-white/80 rounded-2xl border-none outline-none text-sm font-medium text-primary shadow-soft min-h-[44px]"
            value={type} onChange={(e) => setType(e.target.value)}
          >
            <option>General</option>
            <option>Bug</option>
            <option>Suggestion</option>
          </select>
        </div>
        <div>
          <label htmlFor="feedback-message" className="sr-only">Your Feedback</label>
          <textarea
            id="feedback-message"
            className="w-full p-4 bg-white/80 rounded-2xl h-24 resize-none text-sm outline-none focus:ring-2 focus:ring-sage/20 shadow-soft transition-all"
            placeholder="What's on your mind?"
            value={message} onChange={(e) => setMessage(e.target.value)}
            aria-describedby={status ? "feedback-status" : undefined}
          />
        </div>
        <button 
          type="submit" 
          disabled={isSending}
          className="btn-secondary w-full"
        >
          {isSending ? 'Sending...' : 'Send Feedback'}
        </button>
        {status && (
          <p id="feedback-status" role="alert" className={`text-center text-[10px] font-bold mt-4 py-2 px-4 rounded-xl ${status.success ? 'text-sage-dark bg-sage/10' : 'text-terracotta bg-terracotta/10'}`}>
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;
