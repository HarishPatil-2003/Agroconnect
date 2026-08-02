import React from 'react';

/**
 * Unified Badge component for AgroConnect Design System
 * Replaces all hardcoded badge JSX across ProductCard and ProductDetailsView
 *
 * @param {string} variant  - 'default'|'primary'|'success'|'warning'|'danger'|'info'|'auction'|'buynow'|'organic'|'verified'|'featured'
 * @param {string} size     - 'sm'|'md'
 */
const Badge = ({ variant = 'default', size = 'md', className = '', children, style, ...props }) => {
  const variantStyles = {
    default:  { background: 'var(--color-surface-2)',             color: 'var(--color-text-secondary)' },
    primary:  { background: 'rgba(31,166,75,0.12)',               color: 'var(--color-primary-600)' },
    success:  { background: 'rgba(22,163,74,0.12)',               color: 'var(--color-success)' },
    warning:  { background: 'rgba(217,119,6,0.12)',               color: 'var(--color-warning)' },
    danger:   { background: 'rgba(220,38,38,0.12)',               color: 'var(--color-danger)' },
    info:     { background: 'rgba(2,132,199,0.12)',               color: 'var(--color-info)' },
    auction:  { background: 'rgba(239,68,68,0.85)',               color: '#fff' },
    buynow:   { background: 'rgba(16,185,129,0.85)',              color: '#fff' },
    organic:  { background: 'rgba(34,197,94,0.85)',               color: '#fff' },
    verified: { background: 'rgba(59,130,246,0.85)',              color: '#fff' },
    featured: { background: 'rgba(245,158,11,0.90)',              color: '#fff' },
    glass:    { background: 'var(--color-glass-bg)',              color: 'var(--color-text-primary)', backdropFilter: 'blur(8px)', border: '1px solid var(--color-glass-border)' },
  };

  const sizeStyles = {
    xs: { fontSize: '9px',  padding: '2px 7px' },
    sm: { fontSize: '10px', padding: '3px 9px' },
    md: { fontSize: '11px', padding: '4px 12px' },
    lg: { fontSize: '13px', padding: '5px 14px' },
  };

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '9999px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    ...sizeStyles[size] || sizeStyles.md,
    ...(variantStyles[variant] || variantStyles.default),
    ...style,
  };

  return (
    <span className={`ds-badge ${className}`} style={base} {...props}>
      {children}
    </span>
  );
};

export default Badge;
