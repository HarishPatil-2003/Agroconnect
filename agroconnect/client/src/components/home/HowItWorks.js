import React from 'react';
import { UserCheck, Users2, Landmark, Tractor, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './HowItWorks.css';

const HowItWorks = () => {
  const { t } = useLanguage();
  const steps = t('home.howItWorks.items', { returnObjects: true });

  const stepIcons = [
    { icon: <UserCheck size={20} />, color: 'how-step--1', step: '01' },
    { icon: <Users2 size={20} />, color: 'how-step--2', step: '02' },
    { icon: <Landmark size={20} />, color: 'how-step--3', step: '03' },
    { icon: <Tractor size={20} />, color: 'how-step--4', step: '04' }
  ];
  return (
    <section className="section how-section" id="how-it-works">
      <div className="container">
        <div className="text-center how-section__header">
          <span className="section-label" data-reveal="scale">{t('home.howItWorks.label')}</span>
          <h2 className="how-section__title" data-reveal="up" data-reveal-delay="80">{t('home.howItWorks.title')}</h2>
          <p className="how-section__subtitle" data-reveal="up" data-reveal-delay="160">
            {t('home.howItWorks.subtitle')}
          </p>
        </div>

        <div className="how-container">
          <div className="how-timeline" aria-hidden="true" />
          <div className="how-grid">
            {steps && Array.isArray(steps) && steps.map((step, idx) => (
              <div
                key={step.title}
                className={`how-step ${stepIcons[idx]?.color}`}
                data-reveal="up"
                data-reveal-delay={`${idx * 110}ms`}
              >
                <div className="how-step__connector" aria-hidden="true">
                  <ArrowRight size={14} className="how-step__arrow" />
                </div>
                <div className="how-step__badge">{t('home.howItWorks.stepPrefix')} {stepIcons[idx]?.step}</div>
                <div className="how-step__icon-wrap">
                  {stepIcons[idx]?.icon}
                </div>
                <h3 className="how-step__title">{step.title}</h3>
                <p className="how-step__desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
