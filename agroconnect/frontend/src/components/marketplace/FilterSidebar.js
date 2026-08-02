import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import './Marketplace.css';

const FilterSidebar = ({ 
  isOpen, 
  onClose,
  priceRange,
  onPriceRangeChange,
  onlyOrganic,
  onOrganicToggle,
  onlyVerified,
  onVerifiedToggle,
  stateFilter,
  onStateFilterChange,
  districtFilter,
  onDistrictFilterChange,
  onResetFilters
}) => {
  const { t } = useLanguage();
  return (
    <>
      {isOpen && <div className="filter-overlay" onClick={onClose} />}
      
      <div className={`filter-sidebar ${isOpen ? 'filter-sidebar--open' : ''}`}>
        <div className="filter-sidebar__header">
          <h2 className="filter-sidebar__title">{t('marketplace.filterSidebar.title')}</h2>
          <button className="details-modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="filter-sidebar__body">
          {/* Price Range */}
          <div>
            <span className="filter-sidebar__section-title">{t('marketplace.filterSidebar.maxPriceLimit')}</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>₹0</span>
              <strong>₹{priceRange}</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="10000" 
              step="100"
              value={priceRange} 
              onChange={(e) => onPriceRangeChange(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--green-primary)' }}
            />
          </div>

          {/* Location Filters */}
          <div>
            <span className="filter-sidebar__section-title">{t('marketplace.filterSidebar.regionState')}</span>
            <input 
              type="text" 
              placeholder={t('marketplace.filterSidebar.statePlaceholder')}
              value={stateFilter}
              onChange={(e) => onStateFilterChange(e.target.value)}
              className="settings-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <span className="filter-sidebar__section-title">{t('marketplace.filterSidebar.regionDistrict')}</span>
            <input 
              type="text" 
              placeholder={t('marketplace.filterSidebar.districtPlaceholder')} 
              value={districtFilter}
              onChange={(e) => onDistrictFilterChange(e.target.value)}
              className="settings-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Qualifiers */}
          <div>
            <span className="filter-sidebar__section-title">{t('marketplace.filterSidebar.productDetails')}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label className="settings-toggle-label" style={{ padding: 0 }}>
                <span>{t('marketplace.filterSidebar.organicProduce')}</span>
                <input 
                  type="checkbox" 
                  checked={onlyOrganic} 
                  onChange={onOrganicToggle} 
                  className="settings-toggle-input" 
                />
              </label>

              <label className="settings-toggle-label" style={{ padding: 0 }}>
                <span>{t('marketplace.filterSidebar.verifiedProfile')}</span>
                <input 
                  type="checkbox" 
                  checked={onlyVerified} 
                  onChange={onVerifiedToggle} 
                  className="settings-toggle-input" 
                />
              </label>
            </div>
          </div>
        </div>

        <div className="filter-sidebar__footer">
          <button 
            type="button" 
            onClick={onResetFilters} 
            className="btn btn-outlined" 
            style={{ width: '100%', justifyContent: 'center', gap: '8px' }}
          >
            <RefreshCw size={14} />
            <span>{t('marketplace.filterSidebar.reset')}</span>
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('marketplace.filterSidebar.apply')}
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
