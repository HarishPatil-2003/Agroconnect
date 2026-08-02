import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShoppingBag, Landmark } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './RoleCards.css';

const RoleCards = () => {
  const { t } = useLanguage();
  const roles = t('home.roleCards.items', { returnObjects: true });
  
  const roleStyles = [
    { icon: <Sprout size={32} />, colorClass: 'role-card--farmer', to: '/register?role=farmer' },
    { icon: <ShoppingBag size={32} />, colorClass: 'role-card--buyer', to: '/register?role=buyer' },
    { icon: <Landmark size={32} />, colorClass: 'role-card--provider', to: '/register?role=provider' }
  ];
  return (
    <section className="section role-section" id="roles">
      <div className="container">
        <div className="text-center role-section__header">
          <span className="section-label" data-reveal="scale" data-reveal-delay="0">{t('home.roleCards.label')}</span>
          <h2 className="role-section__title" data-reveal="up" data-reveal-delay="80">{t('home.roleCards.title')}</h2>
          <p className="role-section__subtitle" data-reveal="up" data-reveal-delay="160">
            {t('home.roleCards.subtitle')}
          </p>
        </div>

        <div className="role-grid">
          {roles && Array.isArray(roles) && roles.map((role, idx) => (
            <div
              key={role.title}
              className={`role-card gradient-border ${roleStyles[idx]?.colorClass}`}
              data-reveal="up"
              data-reveal-delay={`${idx * 120}ms`}
            >
              <div className="role-card__inner">
                <div className="role-card__icon-wrap">
                  {roleStyles[idx]?.icon}
                </div>
                <h3 className="role-card__title">{role.title}</h3>
                <p className="role-card__desc">{role.description}</p>
                <Link to={roleStyles[idx]?.to} className="btn btn-secondary role-card__btn">
                  {role.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
