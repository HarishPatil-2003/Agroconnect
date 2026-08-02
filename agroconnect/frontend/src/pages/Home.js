import React, { useEffect, useRef } from 'react';
import Hero from '../components/home/Hero';
import RoleCards from '../components/home/RoleCards';
import WhyChooseUs from '../components/home/WhyChooseUs';
import FeaturesGrid from '../components/home/FeaturesGrid';
import HowItWorks from '../components/home/HowItWorks';
import Statistics from '../components/home/Statistics';
import Testimonials from '../components/home/Testimonials';
import CTA from '../components/home/CTA';
import Footer from '../components/home/Footer';

const Home = () => {
  // Premium IntersectionObserver scroll reveal
  useEffect(() => {
    // Legacy .reveal support
    const legacyReveal = () => {
      document.querySelectorAll('.reveal').forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < window.innerHeight - 80) el.classList.add('visible');
      });
    };
    window.addEventListener('scroll', legacyReveal, { passive: true });
    legacyReveal();

    // Modern data-reveal system
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || '0ms';
            setTimeout(() => {
              el.classList.add('revealed');
            }, parseInt(delay));
            revealObserver.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach(el => {
      revealObserver.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', legacyReveal);
      revealObserver.disconnect();
    };
  }, []);

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <Hero />
      <RoleCards />
      <WhyChooseUs />
      <FeaturesGrid />
      <HowItWorks />
      <Statistics />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;
