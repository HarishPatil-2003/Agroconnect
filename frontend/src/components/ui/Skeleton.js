import React from 'react';

/**
 * Skeleton loading component with shimmer animation
 * Uses the design system's ds-shimmer animation
 */
const Skeleton = ({ width, height, borderRadius, className = '', style, ...props }) => {
  const base = {
    width:        width  || '100%',
    height:       height || '16px',
    borderRadius: borderRadius || 'var(--radius-sm)',
    background: 'linear-gradient(90deg, var(--color-surface-2) 25%, var(--color-surface-3) 50%, var(--color-surface-2) 75%)',
    backgroundSize: '400px 100%',
    animation: 'ds-shimmer 1.4s ease-in-out infinite',
    display: 'block',
    ...style,
  };

  return <span className={`ds-skeleton ${className}`} style={base} aria-hidden="true" {...props} />;
};

/**
 * Pre-built product card skeleton
 */
export const ProductCardSkeleton = () => (
  <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
    <Skeleton height="200px" borderRadius="0" />
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <Skeleton height="20px" width="70%" />
      <Skeleton height="14px" />
      <Skeleton height="14px" width="85%" />
      <Skeleton height="28px" width="40%" />
      <Skeleton height="40px" borderRadius="999px" />
    </div>
  </div>
);

/**
 * Pre-built stat card skeleton
 */
export const StatCardSkeleton = () => (
  <div style={{ padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <Skeleton height="40px" width="40px" borderRadius="50%" />
    <Skeleton height="32px" width="60%" />
    <Skeleton height="14px" width="80%" />
  </div>
);

export default Skeleton;
