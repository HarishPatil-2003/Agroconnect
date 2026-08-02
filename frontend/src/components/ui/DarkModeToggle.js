import React from 'react';
import { Sun, Moon } from 'lucide-react';
import './DarkModeToggle.css';

const DarkModeToggle = ({ mode, setMode }) => {
  const handleToggle = (e) => {
    setMode(mode === 'light' ? 'dark' : 'light');
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'theme-toggle-ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  };

  return (
    <button
      className={`theme-toggle-pill ${mode === 'dark' ? 'theme-toggle-pill--dark' : ''}`}
      onClick={handleToggle}
      aria-label="Toggle dark mode"
      role="switch"
      aria-checked={mode === 'dark'}
    >
      <span className="theme-toggle-thumb">
        {mode === 'light' ? <Moon size={14} color="#64748b" /> : <Sun size={14} color="#1FA64B" />}
      </span>
    </button>
  );
};

export default DarkModeToggle;
