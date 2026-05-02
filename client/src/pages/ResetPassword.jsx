import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api.js';

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
      await API.post(`/auth/reset-password/${token}`, {
        password: newPassword 
      });

      setStatus("Success! Redirecting to login...");
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error) {
      const message = error.response?.data?.message || "Reset failed. Link may be expired.";
      setStatus(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream font-sans">
      <div className="glass p-10 rounded-3xl max-w-md w-full fade-in">
        <h2 className="text-3xl font-serif font-bold mb-2 text-primary">Set New Password</h2>
        <p className="text-secondary text-sm mb-8">Choose a strong password for your account.</p>
        
        <input 
          type="password"
          className="input-field glow-focus mb-6"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={isLoading}
        />
        
        <button 
          onClick={handleReset}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? 'Updating...' : 'Update Password'}
        </button>

        {status && (
          <p className={`mt-6 text-center text-sm font-medium p-3 rounded-xl ${
            status.includes('Success') 
              ? 'text-sage-dark bg-sage/10'
              : 'text-terracotta bg-terracotta/10'
          }`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
