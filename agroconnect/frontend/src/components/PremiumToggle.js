import React from 'react';
import './PremiumToggle.css';

const PremiumToggle = ({ checked, onChange, iconOn, iconOff, label, description }) => {
  return (
    <div 
      className="premium-toggle-wrapper" 
      onClick={() => onChange(!checked)}
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
    >
      <div style={{ flex: 1, paddingRight: '16px' }}>
        {label && (
          <div style={{ fontSize: '15px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
            {label}
          </div>
        )}
        {description && (
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {description}
          </div>
        )}
      </div>
      
      <div className={`premium-toggle-track ${checked ? 'active' : ''}`}>
        <div className="premium-toggle-thumb">
          {iconOn && (
            <div className="premium-toggle-icon premium-toggle-icon-on">
              {iconOn}
            </div>
          )}
          {iconOff && (
            <div className="premium-toggle-icon premium-toggle-icon-off">
              {iconOff}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PremiumToggle;
