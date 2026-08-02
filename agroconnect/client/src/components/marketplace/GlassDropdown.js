import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './Marketplace.css';

const GlassDropdown = ({ value, options, onChange, icon, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="premium-glass-dropdown" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="premium-glass-btn"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {icon}
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="premium-glass-dropdown__menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={value === opt.value}
              className="premium-glass-dropdown__item"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlassDropdown;
