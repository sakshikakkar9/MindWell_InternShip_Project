import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api.js'; // Adjust the path as needed

const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!newPassword) {
      setStatus("Please enter a new password.");
      return;
    }

    setIsLoading(true);
    setStatus("");

    try {
      // Replaced fetch with API.post
      // The endpoint is simplified because baseURL handles '/api'
      const response = await API.post(`/auth/reset-password/${token}`, { 
        password: newPassword 
      });

      // Axios considers 2xx as success automatically
      setStatus("Success! Redirecting to login...");
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error) {
      // Extract the error message from the backend response
      const message = error.response?.data?.message || "Reset failed. Link may be expired.";
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2 text-slate-900">Set New Password</h2>
        <p className="text-gray-400 text-sm mb-8">Choose a strong password for your account.</p>
        
        <input 
          type="password"
          className="w-full px-4 py-3 border border-slate-100 bg-slate-50 rounded-2xl mb-6 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
        />
        
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-100 ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'
          }`}
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>

        {status && (
          <p className={`mt-6 text-center text-sm font-medium p-3 rounded-xl ${
            status.includes('Success') 
              ? 'text-green-600 bg-green-50' 
              : 'text-red-600 bg-red-50'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;