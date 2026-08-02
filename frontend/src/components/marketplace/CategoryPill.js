import React from 'react';
import './Marketplace.css';

const CategoryPill = ({ category, icon, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`glass-category-pill ${isActive ? 'glass-category-pill--active' : ''}`}
      aria-label={`Filter by ${category}`}
      aria-pressed={isActive}
    >
      <span className="category-pill-icon">{icon}</span>
      <span className="category-pill-label">{category}</span>
    </button>
  );
};

export default CategoryPill;
