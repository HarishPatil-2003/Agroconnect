import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './CTA.css';

const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="section cta-section">
      {/* Background Shapes */}
      <div className="cta-section__shape cta-section__shape--1" aria-hidden="true" />
      <div className="cta-section__shape cta-section__shape--2" aria-hidden="true" />

      <div className="container">
        <div className="cta-box glass reveal">
          <div className="cta-box__badge" aria-hidden="true">
            <Leaf size={16} />
            <span>{t('home.cta.badge')}</span>
          </div>

          <h2 className="cta-box__title">{t('home.cta.title')}</h2>
          <p className="cta-box__subtitle">
            {t('home.cta.subtitle')}
          </p>

          <div className="cta-box__actions">
            <Link to="/register" className="btn btn-primary cta-box__btn-primary" aria-label={t('home.cta.registerFree')}>
              {t('home.cta.registerFree')}
              <ArrowRight size={18} />
            </Link>
            <Link to="/bidding" className="btn btn-outline cta-box__btn-outline" aria-label={t('home.cta.exploreMarketplace')}>
              {t('home.cta.exploreMarketplace')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
