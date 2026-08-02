import React, { useState, useEffect } from 'react';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Testimonials.css';

const Testimonials = () => {
  const { t } = useLanguage();
  const rawList = t('home.testimonials.items', { returnObjects: true });
  
  const list = Array.isArray(rawList)
    ? rawList
    : (rawList && typeof rawList === 'object' && Array.isArray(rawList.items)
        ? rawList.items
        : []);

  const emojis = ['🌾', '🥕', '🚜'];
  const [active, setActive] = useState(0);

  const hasItems = Array.isArray(list) && list.length > 0;

  useEffect(() => {
    if (!hasItems) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % list.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [hasItems, list.length]);

  const prevStep = () => {
    if (!hasItems) return;
    setActive((prev) => (prev - 1 + list.length) % list.length);
  };

  const nextStep = () => {
    if (!hasItems) return;
    setActive((prev) => (prev + 1) % list.length);
  };

  if (!hasItems) {
    return null;
  }

  return (
    <section className="section test-section" id="testimonials">
      <div className="test-section__blob" aria-hidden="true" />
      
      <div className="container">
        <div className="text-center test-section__header">
          <span className="section-label">{t('home.testimonials.label')}</span>
          <h2 className="test-section__title">{t('home.testimonials.title')}</h2>
          <p className="test-section__subtitle">
            {t('home.testimonials.subtitle')}
          </p>
        </div>

        <div className="test-carousel-wrap reveal">
          {/* Controls */}
          <button className="test-carousel__btn test-carousel__btn--prev" onClick={prevStep} aria-label="Previous testimonial">
            <ChevronLeft size={20} />
          </button>
          
          <div className="test-carousel">
            {Array.isArray(list) && list.map((item, idx) => (
              <div
                key={item?.name || idx}
                className={`test-card-wrap ${idx === active ? 'test-card-wrap--active' : ''}`}
                style={{
                  transform: `translateX(${(idx - active) * 100}%)`,
                  opacity: idx === active ? 1 : 0,
                  pointerEvents: idx === active ? 'auto' : 'none'
                }}
              >
                <div className="test-card glass">
                  <div className="test-card__icon" aria-hidden="true">
                    <Quote size={40} />
                  </div>
                  
                  <div className="test-card__rating">
                    {Array.from({ length: Number.isInteger(item?.rating) ? item.rating : 5 }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" className="test-card__star" />
                    ))}
                  </div>

                  <p className="test-card__comment">"{item?.comment || ''}"</p>

                  <div className="test-card__author">
                    <div className="test-card__avatar" aria-hidden="true">
                      {emojis[idx] || '👤'}
                    </div>
                    <div>
                      <h4 className="test-card__name">{item?.name || ''}</h4>
                      <p className="test-card__role">{item?.role || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="test-carousel__btn test-carousel__btn--next" onClick={nextStep} aria-label="Next testimonial">
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="test-carousel__dots" role="tablist">
            {Array.isArray(list) && list.map((_, idx) => (
              <button
                key={idx}
                className={`test-carousel__dot ${idx === active ? 'test-carousel__dot--active' : ''}`}
                onClick={() => setActive(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                role="tab"
                aria-selected={idx === active}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
