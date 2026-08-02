import React from 'react';

export const FormInput = ({ label, error, icon, ...props }) => (
  <div className="ds-form-group">
    {label && <label className="ds-label">{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>{icon}</span>}
      <input
        className="ds-input"
        style={{ paddingLeft: icon ? '44px' : '16px' }}
        {...props}
      />
    </div>
    {error && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger)', marginTop: '4px' }}>{error}</span>}
  </div>
);

export const FormSelect = ({ label, options = [], icon, ...props }) => (
  <div className="ds-form-group">
    {label && <label className="ds-label">{label}</label>}
    <div style={{ position: 'relative' }}>
      {icon && <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }}>{icon}</span>}
      <select
        className="ds-input"
        style={{ paddingLeft: icon ? '44px' : '16px', appearance: 'none', cursor: 'pointer' }}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  </div>
);
