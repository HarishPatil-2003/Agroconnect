import React from 'react';
import { Search, ArrowDown, SlidersHorizontal, Layers, Mic } from 'lucide-react';
import GlassDropdown from './GlassDropdown';
import { useLanguage } from '../../contexts/LanguageContext';
import './Marketplace.css';

const SearchBar = ({ 
  searchQuery, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  listingType, 
  onListingTypeChange,
  onOpenFilters 
}) => {
  const { t } = useLanguage();

  const sortOptions = [
    { value: 'latest', label: t('marketplace.sortOptions.latest') },
    { value: 'price-low', label: t('marketplace.sortOptions.priceLow') },
    { value: 'price-high', label: t('marketplace.sortOptions.priceHigh') },
    { value: 'popular', label: t('marketplace.sortOptions.popular') },
    { value: 'nearest', label: t('marketplace.sortOptions.nearest') },
    { value: 'rating', label: t('marketplace.sortOptions.rating') },
    { value: 'closing', label: t('marketplace.sortOptions.closing') }
  ];

  const typeOptions = [
    { value: 'all', label: t('marketplace.typeOptions.all') },
    { value: 'auction', label: t('marketplace.typeOptions.auction') },
    { value: 'buynow', label: t('marketplace.typeOptions.buynow') },
    { value: 'organic', label: t('marketplace.typeOptions.organic') },
    { value: 'featured', label: t('marketplace.typeOptions.featured') }
  ];

  return (
    <div className="liquid-search-panel" style={{ zIndex: 100 }}>
      {/* Search Input */}
      <div className="liquid-search-input-wrapper">
        <Search 
          size={18} 
          style={{ 
            color: 'var(--color-primary-600)',
            animation: searchQuery ? 'ds-logo-pulse 2s infinite' : 'none' 
          }} 
        />
        <input 
          type="text" 
          placeholder={t('marketplace.search.placeholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="liquid-search-input"
        />
        {/* Voice Search Placeholder */}
        <button
          type="button"
          onClick={() => alert(t('marketplace.search.voiceSearchAlert'))}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s, transform 0.2s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--green-primary)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.transform = '';
          }}
          aria-label="Voice Search"
        >
          <Mic size={16} />
        </button>
      </div>

      {/* Sorting */}
      <GlassDropdown 
        value={sortBy}
        options={sortOptions}
        onChange={onSortChange}
        icon={<ArrowDown size={14} />}
        placeholder={t('marketplace.search.sortPlaceholder')}
      />

      {/* Listing Type */}
      <GlassDropdown 
        value={listingType}
        options={typeOptions}
        onChange={onListingTypeChange}
        icon={<Layers size={14} />}
        placeholder={t('marketplace.search.typePlaceholder')}
      />

      {/* Filter Sidebar Button */}
      <button 
        type="button" 
        onClick={onOpenFilters} 
        className="premium-glass-btn" 
        style={{
          marginRight: '4px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
          transition: 'all 0.3s var(--ease-spring)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 6px 14px rgba(31,166,75,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <SlidersHorizontal size={14} />
        <span>{t('marketplace.search.filtersBtn')}</span>
      </button>
    </div>
  );
};

export default SearchBar;
