import React, { useState, useEffect, useRef } from 'react';

const BreathingExercise = () => {
  const [phase, setPhase] = useState('Inhale');
  const [timeLeft, setTimeLeft] = useState(4);
  const [isActive, setIsActive] = useState(false);
  const audioContextRef = useRef(null);

  const initAudio = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
  };

  const playCue = (frequency) => {
    const ctx = audioContextRef.current;
    if (!ctx || ctx.state !== 'running') return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

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
    initAudio();
    setIsActive(!isActive);
  };

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden w-full">
      
      {/* BACKGROUND EFFECTS */}
      <div className={`absolute inset-0 transition-colors duration-1000 opacity-10 pointer-events-none rounded-3xl ${
        phase === 'Inhale' ? 'bg-sage' : phase === 'Hold' ? 'bg-terracotta' : 'bg-primary'
      }`} />

      {/* CIRCLE SECTION */}
      <div className="relative flex items-center justify-center mb-10 z-10 pointer-events-none">
        <div className={`absolute rounded-full transition-all duration-[4000ms] border-2 ${
          phase === 'Inhale' ? 'w-64 h-64 border-sage/20 scale-110 opacity-100' :
          phase === 'Hold' ? 'w-64 h-64 border-terracotta/20 scale-105 opacity-100' :
          'w-40 h-40 border-primary/20 scale-90 opacity-0'
        }`} />

        <div className={`flex items-center justify-center rounded-full transition-all duration-[4000ms] shadow-soft ${
          phase === 'Inhale' ? 'w-48 h-48 bg-sage' :
          phase === 'Hold' ? 'w-48 h-48 bg-terracotta' :
          'w-32 h-32 bg-primary'
        }`}>
          <span className="text-white font-bold text-4xl tabular-nums">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* TEXT SECTION */}
      <div className="text-center z-10 mb-8 pointer-events-none">
        <p className={`text-3xl font-serif font-bold transition-colors duration-500 ${
          phase === 'Inhale' ? 'text-sage' : phase === 'Hold' ? 'text-terracotta-dark' : 'text-primary'
        }`}>
          {phase}
        </p>
        <p className="text-secondary text-sm mt-2 font-medium">
          {phase === 'Inhale' ? 'Breathe in slowly' : phase === 'Hold' ? 'Hold and be still' : 'Exhale tension'}
        </p>
      </div>

      {/* BUTTON */}
      <button 
        onClick={handleToggle}
        aria-label={isActive ? 'Pause breathing exercise' : 'Start breathing exercise'}
        className={`relative z-30 btn-primary min-w-[180px] ${
          isActive 
          ? 'bg-cream text-secondary border border-secondary/10 hover:bg-white'
          : ''
        }`}
      >
        {isActive ? 'Pause Session' : 'Start Session'}
      </button>

      <div className="sr-only" aria-live="polite">
        {isActive ? `Phase: ${phase}, Time remaining: ${timeLeft} seconds` : 'Breathing exercise paused'}
      </div>
    </div>
  );
};

export default BreathingExercise;
