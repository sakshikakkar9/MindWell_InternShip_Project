import React, { useState, useEffect, useRef } from 'react';

const BreathingExercise = () => {
  const [phase, setPhase] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef(null);

  // Initialize Audio Context on first interaction
 const initAudio = async () => {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }
  // CRITICAL: Browsers often start AudioContext as 'suspended'
  if (audioContextRef.current.state === 'suspended') {
    await audioContextRef.current.resume();
  }
};

  // 2. Refined Play Function
const playCue = (frequency) => {
  const ctx = audioContextRef.current;
  if (!ctx || ctx.state !== 'running') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine'; // Clean mindfulness tone
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  
  // Smooth fade-in and fade-out to prevent "clicking" sounds
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1); 
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.5);

  osc.start();
  osc.stop(ctx.currentTime + 1.5);
};

  useEffect(() => {
    let timer = null;
    if (isActive) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (phase === 'Inhale') {
              setPhase('Hold');
              playCue(523);
              return 4;
            } else if (phase === 'Hold') {
              setPhase('Exhale');
              playCue(392);
              return 4;
            } else {
              setPhase('Inhale');
              playCue(440);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActive, phase]);

  const handleToggle = () => {
    initAudio(); // Essential for browser security
    setIsActive(!isActive);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[450px] relative overflow-hidden">
      
      {/* BACKGROUND: pointer-events-none ensures this doesn't block clicks */}
      <div className={`absolute inset-0 transition-colors duration-1000 opacity-5 pointer-events-none ${
        phase === 'Inhale' ? 'bg-indigo-500' : phase === 'Hold' ? 'bg-emerald-500' : 'bg-blue-500'
      }`} />

      <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-10 z-10">
        Mindful Breathing
      </h3>

      {/* CIRCLE SECTION */}
      <div className="relative flex items-center justify-center mb-10 z-10 pointer-events-none">
        <div className={`absolute rounded-full transition-all duration-[4000ms] border-2 ${
          phase === 'Inhale' ? 'w-64 h-64 border-indigo-100 scale-110 opacity-100' : 
          phase === 'Hold' ? 'w-64 h-64 border-emerald-100 scale-105 opacity-100' : 
          'w-40 h-40 border-blue-100 scale-90 opacity-0'
        }`} />

        <div className={`flex items-center justify-center rounded-full transition-all duration-[4000ms] shadow-2xl ${
          phase === 'Inhale' ? 'w-48 h-48 bg-indigo-500' : 
          phase === 'Hold' ? 'w-48 h-48 bg-emerald-500' : 
          'w-32 h-32 bg-blue-500'
        }`}>
          <span className="text-white font-black text-4xl tabular-nums">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* TEXT SECTION */}
      <div className="text-center z-10 mb-8 pointer-events-none">
        <p className={`text-2xl font-bold transition-colors duration-500 ${
          phase === 'Inhale' ? 'text-indigo-600' : phase === 'Hold' ? 'text-emerald-600' : 'text-blue-600'
        }`}>
          {phase}
        </p>
        <p className="text-gray-400 text-sm mt-1 font-medium">
          {phase === 'Inhale' ? 'Breathe in slowly' : phase === 'Hold' ? 'Hold and be still' : 'Exhale tension'}
        </p>
      </div>

      {/* BUTTON: High z-index and explicit cursor */}
      <button 
        onClick={handleToggle}
        className={`relative z-30 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 cursor-pointer ${
          isActive 
          ? 'bg-gray-100 text-gray-500' 
          : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700'
        }`}
      >
        {isActive ? 'Pause Session' : 'Start Session'}
      </button>

      <div className="absolute bottom-4 right-6 text-[8px] font-bold text-gray-300 uppercase z-10">
        Task 13: Immersive Interaction
      </div>
    </div>
  );
};

export default BreathingExercise;