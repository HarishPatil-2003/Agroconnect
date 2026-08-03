import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import DarkModeToggle from '../components/ui/DarkModeToggle';
import './AuthLayout.css';

/* ── Particle config ──────────────────────────────────── */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 85 + 5}%`,
  left: `${Math.random() * 85 + 5}%`,
  size: Math.random() * 5 + 2,
  animIndex: (i % 6) + 1,
  duration: `${Math.random() * 10 + 8}s`,
  delay: `${Math.random() * 5}s`,
  opacity: Math.random() * 0.35 + 0.1,
}));

/**
 * AuthLayout — Premium animated glass card layout for Login/Register
 */
const AuthLayout = ({ title, subtitle, children, cardClassName = '', mode, setMode }) => {
  const layoutRef = useRef(null);
  const cardRef   = useRef(null);
  const glowRef   = useRef(null);
  const [mounted, setMounted] = useState(false);

  /* Stagger-mount trigger */
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  /* Mouse parallax + glow */
  const handleMouseMove = useCallback((e) => {
    const rect = layoutRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Cursor glow
    if (glowRef.current) {
      glowRef.current.style.transform =
        `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
    }

    // Card subtle tilt
    if (cardRef.current) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      cardRef.current.style.transform =
        `perspective(1000px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    }
  }, []);

  useEffect(() => {
    const el = layoutRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return (
    <div className={`auth-layout${mounted ? ' auth-layout--mounted' : ''}`} ref={layoutRef}>

      {/* ── Aurora Background ── */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg__blob auth-bg__blob--1" />
        <div className="auth-bg__blob auth-bg__blob--2" />
        <div className="auth-bg__blob auth-bg__blob--3" />
        <div className="auth-bg__blob auth-bg__blob--4" />
        <div className="auth-bg__mesh" />
      </div>

      {/* ── Particles ── */}
      <div className="auth-particles" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="auth-particle"
            style={{
              top: p.top, left: p.left,
              width: `${p.size}px`, height: `${p.size}px`,
              opacity: p.opacity,
              animationName: `particle-float-${p.animIndex}`,
              animationDuration: p.duration,
              animationDelay: p.delay,
              animationIterationCount: 'infinite',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        ))}
      </div>

      {/* ── Cursor Glow (desktop only) ── */}
      <div ref={glowRef} className="auth-cursor-glow" aria-hidden="true" />

      {/* ── Card ── */}
      <div
        className={`auth-card ${cardClassName}`.trim()}
        ref={cardRef}
        style={{ animation: mounted ? 'auth-card-enter 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both' : 'none' }}
      >
        {/* Inner glass highlight edge */}
        <div className="auth-card__highlight" aria-hidden="true" />

        {/* Dark Mode Toggle pinned to the authentication container */}
        {mode && setMode && (
          <div className="auth-card__theme-toggle">
            <DarkModeToggle mode={mode} setMode={setMode} />
          </div>
        )}

        {/* ── Card Header ── */}
        <div className="auth-card__header">
          <div className="auth-card__header-glow" aria-hidden="true" />

          {/* Logo */}
          <Link
            to="/"
            className="auth-card__logo"
            style={{ animation: mounted ? 'badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' : 'none' }}
            aria-label="Go to AgroConnect home"
          >
            <div className="auth-card__logo-icon">
              <Leaf size={22} strokeWidth={2.5} />
            </div>
            <span className="auth-card__logo-text">AgroConnect</span>
          </Link>

          {/* Title */}
          {title && (
            <h1
              className="auth-card__title"
              style={{ animation: mounted ? 'hero-word-reveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both' : 'none' }}
            >
              {title}
            </h1>
          )}

          {/* Subtitle */}
          {subtitle && (
            <p
              className="auth-card__subtitle"
              style={{ animation: mounted ? 'ds-fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s both' : 'none' }}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* ── Card Body ── */}
        <div className="auth-card__body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
