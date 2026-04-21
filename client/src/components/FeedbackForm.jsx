import React, { useState } from 'react';

const FeedbackForm = () => {
  const [type, setType] = useState('General');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
  e.preventDefault();
  // ... validation check ...
  setIsSending(true);

  // Get the token from the normalized key name
  const token = localStorage.getItem('token'); // This pulls the token standardized in Step 1

  try {
    const response = await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ type, message })
    });
    // ... rest of response handling ...
  } catch (err) {
    setStatus({ success: false, text: "Server connection error." });
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
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all">
          Send Feedback
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