import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onDone }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out at 1.1s
    const fadeTimer = setTimeout(() => setFadeOut(true), 1100);
    // Unmount + call onDone at 1.6s (after transition completes)
    const doneTimer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 1600);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className={`loading-screen${fadeOut ? ' fade-out' : ''}`} aria-hidden="true">
      {/* Aurora background */}
      <div className="loading-screen__bg">
        <div className="loading-screen__blob loading-screen__blob--1" />
        <div className="loading-screen__blob loading-screen__blob--2" />
        <div className="loading-screen__blob loading-screen__blob--3" />
      </div>

      {/* Logo */}
      <div className="loading-screen__logo">
        <div className="loading-screen__icon-wrap">
          <svg className="loading-screen__icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <div className="loading-screen__brand">AgroConnect</div>
        <div className="loading-screen__tagline">Grow Together, Prosper Together</div>
      </div>

      {/* Progress Bar */}
      <div className="loading-screen__progress-wrap">
        <div className="loading-screen__progress-bar" />
      </div>
    </div>
  );
};

export default LoadingScreen;
