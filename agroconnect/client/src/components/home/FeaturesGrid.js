import React from 'react';
import { ShoppingCart, Hammer, BarChart3, Bot, Landmark, MessageSquare, CloudSun, Target } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './FeaturesGrid.css';

const FeaturesGrid = () => {
  const { t } = useLanguage();
  const features = t('home.featuresGrid.items', { returnObjects: true });
  
  const featureIcons = [
    { icon: <ShoppingCart size={22} />, color: 'feat-card--green' },
    { icon: <Hammer size={22} />, color: 'feat-card--blue' },
    { icon: <BarChart3 size={22} />, color: 'feat-card--green' },
    { icon: <Bot size={22} />, color: 'feat-card--purple' },
    { icon: <Landmark size={22} />, color: 'feat-card--orange' },
    { icon: <MessageSquare size={22} />, color: 'feat-card--teal' },
    { icon: <CloudSun size={22} />, color: 'feat-card--amber' },
    { icon: <Target size={22} />, color: 'feat-card--indigo' }
  ];

  return (
    <section className="section feat-section" id="features">
      <div className="container">
        <div className="text-center feat-section__header">
          <span className="section-label" data-reveal="scale" data-reveal-delay="0">{t('home.featuresGrid.label')}</span>
          <h2 className="feat-section__title" data-reveal="up" data-reveal-delay="80">{t('home.featuresGrid.title')}</h2>
          <p className="feat-section__subtitle" data-reveal="up" data-reveal-delay="160">
            {t('home.featuresGrid.subtitle')}
          </p>
        </div>

        <div className="feat-grid">
          {features && Array.isArray(features) && features.map((feat, idx) => (
            <div
              key={feat.title}
              className={`feat-card ${featureIcons[idx]?.color || ''}`}
              data-reveal="up"
              data-reveal-delay={`${idx * 70}ms`}
            >
              <div className="feat-card__icon-container">
                {featureIcons[idx]?.icon}
              </div>
              <h3 className="feat-card__title">{feat.title}</h3>
              <p className="feat-card__desc">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
