import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import './PremiumLanguageSelector.css';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' }
];

const PremiumLanguageSelector = () => {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div 
      className={`premium-lang-selector ${isOpen ? 'open' : ''}`} 
      ref={dropdownRef}
    >
      <button 
        className="premium-lang-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} className="globe-icon" />
        <span>{currentLang.label}</span>
        <ChevronDown size={14} className="chevron" />
      </button>

      <div className="premium-lang-dropdown" role="listbox">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            className={`premium-lang-option ${language === lang.code ? 'active' : ''}`}
            onClick={() => handleSelect(lang.code)}
            role="option"
            aria-selected={language === lang.code}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '14px', fontWeight: language === lang.code ? '600' : '500' }}>
                {lang.native}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.6 }}>
                {lang.label}
              </span>
            </div>
            <Check size={16} className="premium-lang-check" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default PremiumLanguageSelector;
