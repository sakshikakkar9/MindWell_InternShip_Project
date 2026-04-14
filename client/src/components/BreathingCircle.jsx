import React, { useState, useEffect } from 'react';

const BreathingExercise = () => {
  const [isInhale, setIsInhale] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsInhale((prev) => !prev);
    }, 4000); // 4 seconds for inhale, 4 seconds for exhale
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">Mindful Breathing</h3>
      
      <div className="relative flex items-center justify-center h-64 w-64">
        {/* Outer Pulsing Glow */}
        <div 
          className={`absolute rounded-full bg-indigo-100 transition-all duration-[4000ms] ease-in-out ${
            isInhale ? 'scale-150 opacity-40' : 'scale-100 opacity-10'
          } w-32 h-32`}
        />
        
        {/* Main Breathing Circle */}
        <div 
          className={`rounded-full bg-indigo-500 shadow-xl transition-all duration-[4000ms] ease-in-out flex items-center justify-center ${
            isInhale ? 'w-48 h-48' : 'w-24 h-24'
          }`}
        >
          <span className="text-white font-medium text-sm transition-opacity duration-500">
            {isInhale ? 'Inhale' : 'Exhale'}
          </span>
        </div>
      </div>
      
      <p className="mt-6 text-gray-500 text-sm italic">Focus on your breath...</p>
    </div>
  );
};

export default BreathingExercise;