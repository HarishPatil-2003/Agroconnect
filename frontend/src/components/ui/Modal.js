import React, { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Shared Modal/Dialog component for AgroConnect Design System
 *
 * @param {boolean} isOpen
 * @param {function} onClose
 * @param {string} title
 * @param {string} size - 'sm'|'md'|'lg'|'xl'|'full'
 * @param {React.ReactNode} children
 * @param {React.ReactNode} footer
 */
const Modal = ({ isOpen, onClose, title, size = 'md', children, footer, className = '' }) => {
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <div
      className="ds-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className={`ds-modal ds-modal--${size} ${className}`}>
        {/* Header */}
        {(title || onClose) && (
          <div className="ds-modal__header">
            {title && <h2 className="ds-modal__title">{title}</h2>}
            {onClose && (
              <button className="ds-modal__close" onClick={onClose} aria-label="Close modal">
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="ds-modal__body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="ds-modal__footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
