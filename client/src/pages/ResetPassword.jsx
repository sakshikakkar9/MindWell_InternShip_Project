import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus("Success! Redirecting to login...");
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus(data.message || "Reset failed.");
      }
    } catch (error) {
      setStatus("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2">Set New Password</h2>
        <p className="text-gray-400 text-sm mb-8">Choose a strong password for your account.</p>
        
        <input 
          type="password"
          className="w-full px-4 py-3 border rounded-2xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        
        <button 
          onClick={handleReset}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-shadow shadow-lg shadow-indigo-100"
        >
          Update Password
        </button>

        {status && (
          <p className={`mt-6 text-center text-sm font-medium ${status.includes('Success') ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;