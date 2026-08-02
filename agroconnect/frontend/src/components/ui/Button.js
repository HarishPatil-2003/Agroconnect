import React from 'react';
import './Button.css';

/**
 * Unified Button component for AgroConnect Design System
 *
 * @param {string} variant - 'primary'|'secondary'|'ghost'|'outline'|'danger'|'success'|'gradient'
 * @param {string} size    - 'sm'|'md'|'lg'|'xl'
 * @param {boolean} loading
 * @param {boolean} fullWidth
 * @param {boolean} iconOnly
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {string} as      - HTML element or 'a'
 */
const Button = React.forwardRef(({
  variant  = 'primary',
  size     = 'lg',
  loading  = false,
  fullWidth = false,
  iconOnly  = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  as: Tag = 'button',
  disabled,
  ...props
}, ref) => {
  const classes = [
    'ui-btn',
    `ui-btn--${variant}`,
    `ui-btn--${size}`,
    fullWidth   ? 'ui-btn--full'     : '',
    iconOnly    ? 'ui-btn--icon'     : '',
    loading     ? 'ui-btn--loading'  : '',
    disabled    ? 'ui-btn--disabled' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Tag ref={ref} className={classes} disabled={!loading && disabled} {...props}>
      {loading && <span className="ui-btn__spinner" aria-hidden="true" />}
      {!loading && leftIcon}
      {!iconOnly && children}
      {!loading && rightIcon}
    </Tag>
  );
});

Button.displayName = 'Button';
export default Button;
