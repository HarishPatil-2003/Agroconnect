import React, { useState, useEffect } from 'react';
import api from '../utils/auth';
import { 
  Target, 
  Award, 
  ShieldCheck, 
  Sprout, 
  TrendingUp, 
  Cpu, 
  ChevronDown,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import './About.css';

const About = () => {
  const [activeFaq, setActiveFaq] = useState(null);
  const [stats, setStats] = useState([
    { label: 'Verified Farmers', value: '10+' },
    { label: 'Registered Buyers', value: '8+' },
    { label: 'Machinery Booked', value: '15+' },
    { label: 'Villages Reached', value: '24+' }
  ]);

  const [stat1, setStat1] = useState(0);
  const [stat2, setStat2] = useState(0);
  const [stat3, setStat3] = useState(0);
  const [stat4, setStat4] = useState(0);

  const [isVisible, setIsVisible] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    api.get('/stats')
      .then(res => {
        const d = res.data;
        setStats([
          { label: 'Verified Farmers', value: `${d.farmersConnected || 10}+` },
          { label: 'Registered Buyers', value: `${d.registeredBuyers || 5}+` },
          { label: 'Machinery Booked', value: `${d.equipmentAvailable || 8}+` },
          { label: 'Villages Reached', value: `${d.villagesReached || 12}+` }
        ]);
      })
      .catch(err => console.error('Failed to load stats:', err));

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        setTimeout(() => {
          setHasRevealed(true);
        }, 2200);
      } else {
        setIsVisible(false);
      }
    }, { threshold: 0.05 });

    const el = document.querySelector('.about-hero');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target1 = parseInt(stats[0].value) || 10;
    const target2 = parseInt(stats[1].value) || 8;
    const target3 = parseInt(stats[2].value) || 15;
    const target4 = parseInt(stats[3].value) || 24;

    const duration = 1200;
    const steps = 40;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setStat1(Math.min(target1, Math.round(progress * target1)));
      setStat2(Math.min(target2, Math.round(progress * target2)));
      setStat3(Math.min(target3, Math.round(progress * target3)));
      setStat4(Math.min(target4, Math.round(progress * target4)));

      if (step >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, [stats]);

  const handleCardMouseMove = (e, cardId) => {
    if (window.innerWidth < 1024) return;
    const card = document.getElementById(`about-card-${cardId}`);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotateX = ((yc - y) / yc) * 6;
    const rotateY = ((x - xc) / xc) * 6;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px) scale(1.02)`;
  };

  const handleCardMouseLeave = (cardId) => {
    const card = document.getElementById(`about-card-${cardId}`);
    if (!card) return;
    card.style.transform = '';
  };

  const team = [
    { name: 'Mr. Harish Patil', role: 'Founder & Agronomist', img: '/images/harish-patil.jpg', bio: '20+ years researching sustainable agronomic schemes, direct market access, and crop yield optimization.' },
    { name: 'Mr. Darshan Ausarkar', role: 'Head of Technology', img: '/images/head-of-technology.jpeg', bio: 'AgriTech software architect leading full-stack platform development and live bidding algorithms.' },
    { name: 'Miss Rupali Pawar', role: 'Community Coordinator', img: '/images/community-coordinator.jpeg', bio: 'Coordinates village-level farmer onboarding campaigns, digital literacy drives, and community outreach.' }
  ];

  const timeline = [
    { year: '2024', title: 'The Seeding', desc: 'AgroConnect was conceived to eliminate broker cuts and provide direct market access to rural farmers.' },
    { year: '2025', title: 'Beta Trials', desc: 'Over 500 Maharashtra & Punjab farmers successfully auctioned produce and rented agricultural equipment.' },
    { year: '2026', title: 'AgroConnect V2', desc: 'Launched full-scale live bidding, role-based dashboards, and real-time MongoDB integration.' }
  ];

  const faqs = [
    { q: 'Is AgroConnect free to use for farmers?', a: 'Yes! AgroConnect provides free crop listings, equipment directories, and direct communication tools for farmers.' },
    { q: 'How does the live bidding system work?', a: 'Farmers post their crop produce with a base price. Verified buyers place bids in real-time until the auction closes.' },
    { q: 'Can I rent out my own machinery?', a: 'Absolutely! Our Equipment Rental directory allows tractor owners and operators to list items for daily hiring.' }
  ];

  const techStack = [
    { name: 'React.js', desc: 'Frontend UI Framework' },
    { name: 'Vite', desc: 'Build Tool' },
    { name: 'Express / Node.js', desc: 'Backend REST API' },
    { name: 'MongoDB', desc: 'Database Store' },
    { name: 'JWT Auth', desc: 'Secure Token Verification' }
  ];

  return (
    <div className="about-page">
      {/* ── Aurora Background Blobs ── */}
      <div className="about-bg" aria-hidden="true">
        <div className="about-bg__blob about-bg__blob--1" />
        <div className="about-bg__blob about-bg__blob--2" />
        <div className="about-bg__blob about-bg__blob--3" />
      </div>

      {/* ── Floating Background Particles ── */}
      <div className="about-particles" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <div
            key={i}
            className="about-particle"
            style={{
              top: `${Math.random() * 80 + 10}%`,
              left: `${Math.random() * 80 + 10}%`,
              width: `${Math.random() * 5 + 2}px`,
              height: `${Math.random() * 5 + 2}px`,
              opacity: Math.random() * 0.15 + 0.05,
              animation: `particle-float-${(i % 6) + 1} ${Math.random() * 12 + 12}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* HERO SECTION */}
      <section className="about-hero">
        <div className="about-hero__content">
          <h1 className={`about-hero__title ${hasRevealed ? 'lightweight-fade' : ''} ${isVisible ? 'is-visible' : ''}`}>
            {hasRevealed ? (
              "Grow Together, Prosper Together"
            ) : (
              "Grow Together, Prosper Together".split(' ').map((word, idx) => (
                <span 
                  key={idx} 
                  className="reveal-word" 
                  style={{ 
                    animationDelay: `${0.35 + idx * 0.08}s, ${1.35 + idx * 0.08}s` 
                  }}
                >
                  {word}
                </span>
              ))
            )}
          </h1>
          <p className="about-hero__subtitle">
            Connecting hardworking farmers directly with verified buyers to build a transparent, broker-free AgriTech ecosystem.
          </p>
        </div>
      </section>

      {/* DYNAMIC STATS SECTION */}
      <section className="about-stats-sec">
        <div className="about-stats-grid">
          {stats.map((stat, idx) => {
            const countVal = idx === 0 ? stat1 : idx === 1 ? stat2 : idx === 2 ? stat3 : stat4;
            return (
              <div 
                key={idx} 
                className="stat-card" 
                id={`about-card-stat-${idx}`} 
                onMouseMove={(e) => handleCardMouseMove(e, `stat-${idx}`)} 
                onMouseLeave={() => handleCardMouseLeave(`stat-${idx}`)}
                style={{ animationDelay: `${1.15 + idx * 0.05}s` }}
              >
                <div className="stat-value">{countVal}+</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="about-grid-sec">
        <div 
          className="about-card about-card-left" 
          id="about-card-mission" 
          onMouseMove={(e) => handleCardMouseMove(e, 'mission')} 
          onMouseLeave={() => handleCardMouseLeave('mission')}
        >
          <div className="about-icon-box"><Target size={24} color="var(--green-primary)" /></div>
          <h2>Our Dedicated Mission</h2>
          <p>
            To empower primary food producers by providing simple, digital marketplace auctioning, eliminating broker inefficiencies, and maximizing rural incomes.
          </p>
        </div>
        <div 
          className="about-card about-card-right" 
          id="about-card-vision" 
          onMouseMove={(e) => handleCardMouseMove(e, 'vision')} 
          onMouseLeave={() => handleCardMouseLeave('vision')}
        >
          <div className="about-icon-box"><Award size={24} color="#3b82f6" /></div>
          <h2>Our Core Vision</h2>
          <p>
            An interconnected agricultural system where farmers receive prompt payments, buyers get quality assurances, and technology drives rural prosperity.
          </p>
        </div>
      </section>

      {/* PROBLEMS WE SOLVE */}
      <section className="problems-sec">
        <h2 className="section-title">The Real Problems We Solve</h2>
        <div className="problems-grid">
          <div 
            className="problem-item" 
            id="about-card-prob-0" 
            onMouseMove={(e) => handleCardMouseMove(e, 'prob-0')} 
            onMouseLeave={() => handleCardMouseLeave('prob-0')}
          >
            <ShieldCheck size={20} className="prob-icon" />
            <div>
              <h3>High Agent Commission Cuts</h3>
              <p>Middlemen charge up to 30% broker fees. We establish a 0% commission direct-to-buyer channel.</p>
            </div>
          </div>
          <div 
            className="problem-item" 
            id="about-card-prob-1" 
            onMouseMove={(e) => handleCardMouseMove(e, 'prob-1')} 
            onMouseLeave={() => handleCardMouseLeave('prob-1')}
          >
            <Sprout size={20} className="prob-icon" />
            <div>
              <h3>Lack of Auction Transparency</h3>
              <p>Auctions are often rigged behind closed doors. AgroConnect runs open-audit live digital bidding logs.</p>
            </div>
          </div>
          <div 
            className="problem-item" 
            id="about-card-prob-2" 
            onMouseMove={(e) => handleCardMouseMove(e, 'prob-2')} 
            onMouseLeave={() => handleCardMouseLeave('prob-2')}
          >
            <TrendingUp size={20} className="prob-icon" />
            <div>
              <h3>Idle Tractor Down-Times</h3>
              <p>Small farmers cannot afford high machine costs. We offer localized, peer-to-peer machinery rentals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="timeline-sec">
        <h2 className="section-title">Our Growth Timeline</h2>
        <div className="timeline-container">
          {timeline.map((event, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-year">{event.year}</div>
              <div 
                className="timeline-content" 
                id={`about-card-time-${idx}`} 
                onMouseMove={(e) => handleCardMouseMove(e, `time-${idx}`)} 
                onMouseLeave={() => handleCardMouseLeave(`time-${idx}`)}
              >
                <h3>{event.title}</h3>
                <p>{event.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="team-sec">
        <h2 className="section-title">Meet Our Team Leaders</h2>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div 
              key={idx} 
              className="team-card" 
              id={`about-card-team-${idx}`} 
              onMouseMove={(e) => handleCardMouseMove(e, `team-${idx}`)} 
              onMouseLeave={() => handleCardMouseLeave(`team-${idx}`)}
              style={{ animationDelay: `${1.6 + idx * 0.08}s` }}
            >
              <div className="team-img-wrap">
                <img src={member.img} alt={member.name} className="team-img" />
              </div>
              <h3>{member.name}</h3>
              <span className="team-role">{member.role}</span>
              <p className="team-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section className="tech-sec">
        <h2 className="section-title">Technology Stack</h2>
        <div className="tech-grid">
          {techStack.map((tech, idx) => (
            <div key={idx} className="tech-item">
              <Cpu size={16} />
              <strong>{tech.name}</strong>
              <span>({tech.desc})</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-sec" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className="faq-item">
              <button 
                className="faq-question" 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown size={18} style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
              {activeFaq === idx && (
                <div className="faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT INFORMATION */}
      <section className="contact-sec">
        <div 
          className="contact-card" 
          id="about-card-contact" 
          onMouseMove={(e) => handleCardMouseMove(e, 'contact')} 
          onMouseLeave={() => handleCardMouseLeave('contact')}
        >
          <h2>Get in Touch with Us</h2>
          <p style={{ marginBottom: '24px' }}>Have questions or want to partner with us? Reach out directly.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <Mail size={18} color="var(--green-primary)" />
              <span>harishp.mca_iom@bkc.met.edu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <Phone size={18} color="var(--green-primary)" />
              <span>8010616229</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
              <MapPin size={18} color="var(--green-primary)" />
              <span>AgroConnect HQ, Nashik, Maharashtra, India</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
