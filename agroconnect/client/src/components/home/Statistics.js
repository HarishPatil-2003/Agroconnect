import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../../contexts/LanguageContext';
import './Statistics.css';

/* Premium easeOutExpo for smooth count-up */
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

const Statistics = () => {
  const { t } = useLanguage();
  
  const [liveStats, setLiveStats] = useState([
    { value: 0, suffix: '+', key: 'farmersConnected' },
    { value: 0, suffix: '+', key: 'registeredBuyers' },
    { value: 0, suffix: '+', key: 'equipmentAvailable' },
    { value: 0, suffix: '+', key: 'villagesReached' },
  ]);

  useEffect(() => {
    axios.get('/api/stats')
      .then(res => {
        const d = res.data;
        setLiveStats([
          { value: d.farmersConnected  || 0, suffix: '+', key: 'farmersConnected' },
          { value: d.registeredBuyers  || 0, suffix: '+', key: 'registeredBuyers' },
          { value: d.equipmentAvailable|| 0, suffix: '+', key: 'equipmentAvailable' },
          { value: d.villagesReached   || 0, suffix: '+', key: 'villagesReached' },
        ]);
      })
      .catch(err => console.error('Failed to load stats:', err));
  }, []);

  return (
    <section className="section stats-section">
      <div className="container">
        <div className="stats-grid">
          {liveStats.map((stat, idx) => (
            <StatCounter
              key={stat.key}
              value={stat.value}
              suffix={stat.suffix}
              label={t(`home.statistics.${stat.key}`)}
              delay={idx * 120}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCounter = ({ value, suffix, label, delay }) => {
  const [count, setCount]     = useState(0);
  const [popped, setPopped]   = useState(false);
  const elementRef            = useRef(null);
  const hasAnimated           = useRef(false);
  const rafRef                = useRef(null);

  useEffect(() => {
    const target = value;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(entry.target);

          setTimeout(() => {
            const duration = 1600;
            let startTime = null;

            const animate = (ts) => {
              if (!startTime) startTime = ts;
              const elapsed = ts - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = easeOutExpo(progress);
              setCount(Math.round(eased * target));

              if (progress < 1) {
                rafRef.current = requestAnimationFrame(animate);
              } else {
                setCount(target);
                // Pop the number when it finishes
                setPopped(true);
                setTimeout(() => setPopped(false), 300);
              }
            };

            rafRef.current = requestAnimationFrame(animate);
          }, delay);
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, delay]);

  return (
    <div
      ref={elementRef}
      className="stat-item"
      data-reveal="up"
      data-reveal-delay={`${delay}ms`}
    >
      <div
        className={`stat-item__value${popped ? ' stat-item__value--pop' : ''}`}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="stat-item__label">{label}</div>
    </div>
  );
};

export default Statistics;
