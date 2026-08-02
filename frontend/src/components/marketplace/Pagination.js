import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Marketplace.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <div className="glass-pagination" aria-label="Pagination Navigation">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="glass-pagination-btn"
        style={{ opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`glass-pagination-btn ${currentPage === page ? 'glass-pagination-btn--active' : ''}`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="glass-pagination-btn"
        style={{ opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
