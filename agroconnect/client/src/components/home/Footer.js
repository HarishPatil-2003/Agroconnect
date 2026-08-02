import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-top">
          {/* Brand Info */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo" aria-label="AgroConnect home">
              <div className="footer-logo__icon" aria-hidden="true">
                <Leaf size={18} strokeWidth={2.5} />
              </div>
              <span className="footer-logo__text">AgroConnect</span>
            </Link>
            <p className="footer-desc">
              {t('home.footer.desc')}
            </p>
            <div className="footer-socials" aria-label="Social media profiles">
              {[
                { icon: <TwitterIcon />, label: 'Twitter' },
                { icon: <FacebookIcon />, label: 'Facebook' },
                { icon: <GithubIcon />, label: 'Github' },
              ].map((s) => (
                <a key={s.label} href="#" className="footer-social-link" aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="footer-nav">
            <h4 className="footer-title">{t('home.footer.platform')}</h4>
            <ul className="footer-links" role="list">
              <li><Link to="/bidding" className="footer-link">{t('home.footer.marketplace')}</Link></li>
              <li><Link to="/equipment" className="footer-link">{t('home.footer.equipmentHire')}</Link></li>
              <li><Link to="/guidance" className="footer-link">{t('home.footer.aiAdvisor')}</Link></li>
              <li><Link to="/register" className="footer-link">{t('home.footer.joinPartner')} <ArrowUpRight size={12} className="footer-link__arrow" /></Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="footer-nav">
            <h4 className="footer-title">{t('home.footer.resources')}</h4>
            <ul className="footer-links" role="list">
              <li><a href="#" className="footer-link">{t('home.footer.cropRotation')}</a></li>
              <li><a href="#" className="footer-link">{t('home.footer.soilTesting')}</a></li>
              <li><a href="#" className="footer-link">{t('home.footer.mandiPrice')}</a></li>
              <li><a href="#" className="footer-link">{t('home.footer.govtSubsidies')}</a></li>
            </ul>
          </div>

          {/* Newsletter / Contact */}
          <div className="footer-newsletter">
            <h4 className="footer-title">{t('home.footer.stayUpdated')}</h4>
            <p className="footer-news-desc">
              {t('home.footer.newsDesc')}
            </p>
            <form className="footer-form" onSubmit={(e) => e.preventDefault()} aria-label="Newsletter sign up">
              <input
                type="email"
                placeholder={t('home.footer.enterEmail')}
                className="footer-input"
                aria-label="Email address"
                required
              />
              <button type="submit" className="btn btn-primary footer-form__btn" aria-label={t('home.footer.subscribe')}>
                {t('home.footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} {t('home.footer.rightsReserved')}
          </p>
          <div className="footer-legal">
            <a href="#" className="footer-legal-link">{t('home.footer.privacyPolicy')}</a>
            <span className="footer-legal-divider" aria-hidden="true">|</span>
            <a href="#" className="footer-legal-link">{t('home.footer.termsOfService')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
