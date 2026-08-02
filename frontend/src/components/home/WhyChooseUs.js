import React from 'react';
import { DollarSign, ShieldAlert, Award, HelpingHand } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const { t } = useLanguage();
  const features = t('home.whyChooseUs.items', { returnObjects: true });
  const metrics = t('home.whyChooseUs.metrics', { returnObjects: true });
  
  const icons = [
    { icon: <DollarSign size={24} />, gradient: 'why-card__icon--green' },
    { icon: <Award size={24} />, gradient: 'why-card__icon--blue' },
    { icon: <HelpingHand size={24} />, gradient: 'why-card__icon--purple' },
    { icon: <ShieldAlert size={24} />, gradient: 'why-card__icon--orange' }
  ];

  return (
    <section className="section why-section" id="why-us">
      <div className="why-section__blob" aria-hidden="true" />
      
      <div className="container">
        <div className="why-grid">
          {/* Left Sticky Header */}
          <div className="why-section__content" data-reveal="left">
            <span className="section-label">{t('home.whyChooseUs.label')}</span>
            <h2 className="why-section__title">{t('home.whyChooseUs.title')}</h2>
            <p className="why-section__desc">
              {t('home.whyChooseUs.description')}
            </p>
            <div className="why-section__metrics">
              {metrics && Array.isArray(metrics) && metrics.map((metric, idx) => (
                <div key={idx} className="metric-item">
                  <span className="metric-item__num">{metric.num}</span>
                  <span className="metric-item__lbl">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Cards Grid */}
          <div className="why-cards">
            {features && Array.isArray(features) && features.map((feat, idx) => (
              <div
                key={feat.title}
                className="why-card"
                data-reveal={idx % 2 === 0 ? 'right' : 'scale'}
                data-reveal-delay={`${idx * 110}ms`}
              >
                <div className={`why-card__icon ${icons[idx]?.gradient}`}>
                  {icons[idx]?.icon}
                </div>
                <h3 className="why-card__title">{feat.title}</h3>
                <p className="why-card__desc">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
