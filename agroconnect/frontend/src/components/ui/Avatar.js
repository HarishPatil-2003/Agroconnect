import React from 'react';

/**
 * Unified Avatar component for AgroConnect Design System
 *
 * @param {string} name     - User's full name (used for initials)
 * @param {string} src      - Optional image URL
 * @param {string} size     - 'xs'|'sm'|'md'|'lg'|'xl'
 * @param {string} variant  - 'circle'|'rounded'
 * @param {string} color    - Custom gradient override
 */
const Avatar = ({ name = '', src, size = 'md', variant = 'circle', className = '', style, ...props }) => {
  const [imgError, setImgError] = React.useState(false);

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const sizes = {
    xs: { width: 28, height: 28, fontSize: '11px' },
    sm: { width: 36, height: 36, fontSize: '13px' },
    md: { width: 44, height: 44, fontSize: '16px' },
    lg: { width: 56, height: 56, fontSize: '20px' },
    xl: { width: 72, height: 72, fontSize: '26px' },
    '2xl': { width: 96, height: 96, fontSize: '32px' },
  };

  const dim = sizes[size] || sizes.md;

  // Generate a consistent gradient from the name
  const gradients = [
    'linear-gradient(135deg, #1FA64B, #047857)',
    'linear-gradient(135deg, #2563EB, #1d4ed8)',
    'linear-gradient(135deg, #7c3aed, #4f46e5)',
    'linear-gradient(135deg, #d97706, #b45309)',
    'linear-gradient(135deg, #dc2626, #b91c1c)',
    'linear-gradient(135deg, #0284c7, #0369a1)',
    'linear-gradient(135deg, #0f766e, #0d9488)',
    'linear-gradient(135deg, #9333ea, #7c3aed)',
  ];
  const gradientIdx = name
    ? name.charCodeAt(0) % gradients.length
    : 0;

  const baseStyle = {
    width: dim.width,
    height: dim.height,
    borderRadius: variant === 'circle' ? '50%' : '12px',
    background: src && !imgError ? 'transparent' : gradients[gradientIdx],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontFamily: 'var(--font-display)',
    fontSize: dim.fontSize,
    fontWeight: 800,
    overflow: 'hidden',
    flexShrink: 0,
    userSelect: 'none',
    ...style,
  };

  return (
    <div className={`ds-avatar ${className}`} style={baseStyle} {...props}>
      {src && !imgError ? (
        <img
          src={src}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
