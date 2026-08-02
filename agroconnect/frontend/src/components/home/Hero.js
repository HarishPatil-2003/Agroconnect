import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Tractor, Users, TrendingUp, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import './Hero.css';

/* ── Easing helper ─────────────────────────────────────────── */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/* ── Animated counter hook ─────────────────────────────────── */
const useCountUp = (target, duration = 1400, started = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started || !target) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, started]);
  return count;
};

/* ── Particle system ───────────────────────────────────────── */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 90 + 5}%`,
  left: `${Math.random() * 90 + 5}%`,
  size: Math.random() * 4 + 2,
  animIndex: (i % 6) + 1,
  duration: `${Math.random() * 8 + 6}s`,
  delay: `${Math.random() * 4}s`,
  opacity: Math.random() * 0.4 + 0.15,
}));

/* ═══════════════════════════════════════════════════════════ */
const Hero = () => {
  const [stats, setStats] = useState({
    farmersConnected: 0,
    registeredBuyers: 0,
    equipmentAvailable: 0,
    runningAuctions: 0,
  });
  const [countStarted, setCountStarted] = useState(false);
  const heroRef = useRef(null);
  const dashboardRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { t } = useLanguage();

  /* Load stats */
  useEffect(() => {
    axios.get('/api/stats')
      .then(res => {
        setStats(res.data);
        setCountStarted(true);
      })
      .catch(() => setCountStarted(true));
  }, []);

  /* Mouse parallax */
  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    mouseRef.current = { x: dx, y: dy };

    // Cursor glow follow
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.transform =
        `translate(${e.clientX - rect.left}px, ${e.clientY - rect.top}px) translate(-50%, -50%)`;
    }

    // Dashboard tilt
    if (dashboardRef.current) {
      const rx = dy * -6;
      const ry = dx * 6;
      dashboardRef.current.style.transform =
        `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dashboardRef.current) {
      dashboardRef.current.style.transform =
        `perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    }
  }, []);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.addEventListener('mousemove', handleMouseMove, { passive: true });
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const totalUsersCount = (stats.farmersConnected || 0) + (stats.registeredBuyers || 0);
  const farmerCount = useCountUp(stats.farmersConnected, 1400, countStarted);
  const buyerCount  = useCountUp(stats.registeredBuyers,  1400, countStarted);

  return (
    <section className="hero" aria-label="Introduction hero section" ref={heroRef}>
      {/* ── Aurora Background ── */}
      <div className="hero__aurora" aria-hidden="true">
        <div className="hero__blob hero__blob--1" />
        <div className="hero__blob hero__blob--2" />
        <div className="hero__blob hero__blob--3" />
        <div className="hero__blob hero__blob--4" />
        <div className="hero__blob hero__blob--5" />
      </div>

      {/* ── Particle System ── */}
      <div className="hero__particles" aria-hidden="true">
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="hero__particle"
            style={{
              top: p.top,
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
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
      <div ref={cursorGlowRef} className="hero__cursor-glow" aria-hidden="true" />

      <div className="container hero__container">
        {/* ── Left Column ── */}
        <div className="hero__content">

          {/* Badge */}
          <div className="hero__badge" role="note" style={{ animation: 'badge-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' }}>
            <span className="hero__badge-dot" aria-hidden="true" />
            <span>{t('home.hero.badge')}</span>
          </div>

          {/* Headline — word-by-word reveal */}
          <h1 className="hero__heading" aria-label="Welcome to the future of Agriculture">
            {(() => {
              const prefix = t('home.hero.titlePrefix', { returnObjects: true });
              const words = Array.isArray(prefix) ? prefix : (typeof prefix === 'string' ? prefix.split(' ') : ['Welcome', 'to', 'the', 'future', 'of']);
              return words.map((word, i) => (
                <span key={word + i} className="hero__word-wrap" aria-hidden="true">
                  <span className="hero__word" style={{ animationDelay: `${350 + i * 80}ms` }}>
                    {word}{' '}
                  </span>
                </span>
              ));
            })()}
            <span className="hero__word-wrap hero__gradient-wrap" aria-hidden="true">
              <span className="hero__word hero__word--gradient" style={{ animationDelay: '750ms' }}>
                {t('home.hero.titleHighlight')}
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero__subtitle" style={{ animation: 'ds-fade-in-up 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s both' }}>
            {t('home.hero.subtitle')}
          </p>

          {/* Feature Pills */}
          <div className="hero__pills" role="list" aria-label="Key highlights">
            {Array.isArray(t('home.hero.features', { returnObjects: true })) && t('home.hero.features', { returnObjects: true }).map((item, idx) => (
              <div
                key={item.label}
                className="hero__pill"
                role="listitem"
                style={{ animation: `ds-fade-in-up 0.6s cubic-bezier(0.16,1,0.3,1) ${1000 + idx * 100}ms both` }}
              >
                <CheckCircle size={14} className="hero__pill-check" />
                <div>
                  <div className="hero__pill-label">{item.label}</div>
                  <div className="hero__pill-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hero__actions">
            <Link
              to="/register"
              className="btn btn-primary hero__btn-main hero__btn-glow"
              aria-label="Create account as farmer"
              style={{ animation: 'ds-slide-left 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both' }}
            >
              {t('home.hero.joinAsFarmer')}
              <ArrowRight size={18} className="hero__btn-arrow" />
              <span className="hero__btn-ripple" aria-hidden="true" />
            </Link>
            <Link
              to="/bidding"
              className="btn btn-secondary hero__btn-sub hero__btn-border"
              aria-label="Explore auctions"
              style={{ animation: 'ds-slide-right 0.7s cubic-bezier(0.16,1,0.3,1) 1.2s both' }}
            >
              {t('home.hero.browseMarketplace')}
              <Zap size={15} className="hero__btn-icon-sub" />
            </Link>
          </div>

          {/* Social Proof */}
          <div className="hero__social-proof" style={{ animation: 'ds-fade-in 0.8s ease 1.5s both' }}>
            <div className="hero__avatars" aria-hidden="true">
              {['🌾', '🚜', '🌱', '🌽'].map((av, i) => (
                <div key={i} className="hero__avatar-circle">{av}</div>
              ))}
            </div>
            <div className="hero__social-text">
              <strong>{totalUsersCount > 0 ? `${totalUsersCount.toLocaleString()}+` : 'Verified'}</strong>{' '}
              {t('home.hero.socialProofPrefix')}
            </div>
          </div>
        </div>

        {/* ── Right Column: Dashboard ── */}
        <div className="hero__visual" style={{ animation: 'mockup-enter 1s cubic-bezier(0.16,1,0.3,1) 1.4s both' }}>
          <div className="hero__mockup-container">
            {/* Main Dashboard Panel */}
            <div className="hero__mockup glass" ref={dashboardRef}>
              {/* Inner highlight */}
              <div className="hero__mockup-highlight" aria-hidden="true" />

              {/* Header */}
              <div className="mockup__header">
                <div className="mockup__controls" aria-hidden="true">
                  <span className="mockup__dot mockup__dot--red" />
                  <span className="mockup__dot mockup__dot--yellow" />
                  <span className="mockup__dot mockup__dot--green" />
                </div>
                <div className="mockup__title">{t('home.hero.engineTitle')}</div>
              </div>

              {/* Body */}
              <div className="mockup__body">
                {/* Main Live Bid Card */}
                <div className="mockup__card mockup__card--main">
                  <div className="mockup__card-header">
                    <span className="mockup__badge-live">
                      <span className="mockup__badge-live-dot" /> {t('home.hero.liveMarketplace')}
                    </span>
                    <span className="mockup__time">{stats.runningAuctions || 0} {t('home.hero.activeAuctions')}</span>
                  </div>
                  <h3 className="mockup__crop-name">{t('home.hero.directBidding')}</h3>
                  <div className="mockup__location">{t('home.hero.location')}</div>

                  {/* Pricing Grid — animated count-up */}
                  <div className="mockup__price-grid">
                    <div>
                      <div className="mockup__price-lbl">{t('home.hero.connectedFarmers')}</div>
                      <div className="mockup__price-val">{farmerCount}</div>
                    </div>
                    <div>
                      <div className="mockup__price-lbl">{t('home.hero.registeredBuyers')}</div>
                      <div className="mockup__price-val text-gradient-green">{buyerCount}</div>
                    </div>
                  </div>

                  {/* Animated SVG Chart */}
                  <div className="mockup__chart" aria-hidden="true">
                    <svg className="mockup__chart-svg" viewBox="0 0 300 80">
                      <defs>
                        <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1FA64B" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#1FA64B" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Animated line */}
                      <path
                        className="mockup__chart-line"
                        d="M 0 60 Q 50 50 100 30 T 200 40 T 300 10"
                        fill="none"
                        stroke="#1FA64B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeDasharray="500"
                        strokeDashoffset="500"
                      />
                      {/* Fill */}
                      <path
                        className="mockup__chart-fill"
                        d="M 0 60 Q 50 50 100 30 T 200 40 T 300 10 L 300 80 L 0 80 Z"
                        fill="url(#chart-grad)"
                      />
                      <circle
                        className="mockup__chart-dot"
                        cx="300" cy="10" r="4"
                        fill="#1FA64B"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="mockup__chart-tag">
                      <TrendingUp size={12} /> {t('home.hero.livePricing')}
                    </div>
                  </div>
                </div>

                {/* Sub Cards */}
                <div className="mockup__sub-row">
                  <div className="mockup__card">
                    <div className="mockup__mini-header">
                      <Thermometer size={14} className="text-gradient-green" />
                      <span>{t('home.hero.agronomyGuidance')}</span>
                    </div>
                    <div className="mockup__advisory-stat">{t('home.hero.aiCropProtection')}</div>
                    <div className="mockup__advisory-action">{t('home.hero.verifiedExpert')}</div>
                  </div>
                  <div className="mockup__card">
                    <div className="mockup__mini-header">
                      <Tractor size={14} className="text-gradient-blue" />
                      <span>{t('home.hero.equipmentFleet')}</span>
                    </div>
                    <div className="mockup__rental-status">{stats.equipmentAvailable || 0} {t('home.hero.listed')}</div>
                    <div className="mockup__rental-badge">{t('home.hero.availableForRent')}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div
              className="hero__glowing-badge hero__glowing-badge--1 glass"
              style={{ animation: 'badge-float-in-left 0.8s cubic-bezier(0.34,1.56,0.64,1) 1.7s both, ds-float-slow 7s ease-in-out 2.5s infinite' }}
            >
              <ShieldCheck size={16} className="text-gradient-green" />
              <span>{t('home.hero.verifiedPayouts')}</span>
            </div>

            <div
              className="hero__glowing-badge hero__glowing-badge--2 glass"
              style={{ animation: 'badge-float-in-right 0.8s cubic-bezier(0.34,1.56,0.64,1) 1.9s both, ds-float-slow 9s ease-in-out 3s infinite' }}
            >
              <Users size={16} className="text-gradient-blue" />
              <span>{t('home.hero.directFarmToBuyer')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
