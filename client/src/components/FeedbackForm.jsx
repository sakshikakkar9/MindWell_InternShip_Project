import React, { useState } from 'react';
import API from '../../api.js'; // Adjust the path based on your folder structure

const FeedbackForm = () => {
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [isSending, setIsSending] = useState(false); // Added missing state

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    const token = localStorage.getItem('token');

    try {
      // Replaced fetch with API.post
      await API.post('/feedback', 
        { type, message },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setStatus({ success: true, text: "Feedback sent! Thank you." });
      setMessage('');
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
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Help us improve MindWell</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <select 
          className="w-full p-3 bg-gray-50 rounded-xl outline-none text-sm font-medium"
          value={type} onChange={(e) => setType(e.target.value)}
        >
          <option>General</option>
          <option>Bug</option>
          <option>Suggestion</option>
        </select>
        <textarea 
          className="w-full p-4 bg-gray-50 rounded-2xl h-24 resize-none text-sm outline-none focus:ring-2 focus:ring-indigo-100"
          placeholder="What's on your mind?"
          value={message} onChange={(e) => setMessage(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={isSending}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSending ? 'Sending...' : 'Send Feedback'}
        </button>
        {status && (
          <p className={`text-center text-xs font-bold mt-2 ${status.success ? 'text-green-500' : 'text-red-400'}`}>
            {status.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default FeedbackForm;