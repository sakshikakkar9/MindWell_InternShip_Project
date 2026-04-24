import React, { useState } from 'react';

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
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type, message })
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
          placeholder="Describe the issue..."
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

export default FeedbackForm;