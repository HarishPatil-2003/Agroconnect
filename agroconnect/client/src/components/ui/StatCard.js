import React from 'react';
import Avatar from './Avatar';

/**
 * StatCard — Dashboard statistics card for AgroConnect Design System
 * Used across Farmer/Buyer/Admin dashboards
 *
 * @param {string|number} value
 * @param {string} label
 * @param {string} sublabel
 * @param {React.ReactNode} icon
 * @param {string} trend   - e.g. '+12%' or '-3%'
 * @param {string} variant - 'default'|'success'|'warning'|'danger'|'info'|'primary'
 * @param {string} size    - 'sm'|'md'|'lg'
 */
const StatCard = ({ value, label, sublabel, icon, trend, variant = 'default', size = 'md', className = '', style }) => {
  const variantConfig = {
    default: { iconBg: 'var(--color-surface-2)', iconColor: 'var(--color-primary-600)', accent: 'var(--color-primary-600)' },
    primary: { iconBg: 'rgba(31,166,75,0.10)',   iconColor: 'var(--color-primary-600)', accent: 'var(--color-primary-600)' },
    success: { iconBg: 'rgba(22,163,74,0.10)',   iconColor: 'var(--color-success)',     accent: 'var(--color-success)' },
    warning: { iconBg: 'rgba(217,119,6,0.10)',   iconColor: 'var(--color-warning)',     accent: 'var(--color-warning)' },
    danger:  { iconBg: 'rgba(220,38,38,0.10)',   iconColor: 'var(--color-danger)',      accent: 'var(--color-danger)' },
    info:    { iconBg: 'rgba(2,132,199,0.10)',   iconColor: 'var(--color-info)',        accent: 'var(--color-info)' },
  };

  const config = variantConfig[variant] || variantConfig.default;
  const trendPositive = trend && (trend.startsWith('+') || parseFloat(trend) > 0);
  const trendNegative = trend && (trend.startsWith('-') || parseFloat(trend) < 0);

  return (
    <div
      className={`ds-stat-card ${className}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: size === 'sm' ? 'var(--space-4)' : size === 'lg' ? 'var(--space-8)' : 'var(--space-6)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        transition: 'all var(--duration-normal) var(--ease-smooth)',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {/* Top Row: Icon + Trend */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {icon && (
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
            background: config.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: config.iconColor,
          }}>
            {icon}
          </div>
        )}
        {trend && (
          <span style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)',
            background: trendPositive ? 'rgba(22,163,74,0.10)' : trendNegative ? 'rgba(220,38,38,0.10)' : 'var(--color-surface-2)',
            color: trendPositive ? 'var(--color-success)' : trendNegative ? 'var(--color-danger)' : 'var(--color-text-muted)',
          }}>
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: size === 'lg' ? 'var(--text-4xl)' : size === 'sm' ? 'var(--text-2xl)' : 'var(--text-3xl)',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          lineHeight: 1.1,
        }}>
          {value}
        </div>
        <div style={{
          marginTop: '4px',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
        }}>
          {label}
        </div>
        {sublabel && (
          <div style={{
            marginTop: '2px',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
