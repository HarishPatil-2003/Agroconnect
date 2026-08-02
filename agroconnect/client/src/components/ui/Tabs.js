import React, { useState } from 'react';
import './Tabs.css';

/**
 * Unified Tabs component for AgroConnect Design System
 *
 * @param {Array} tabs - [{id, label, icon?, count?}]
 * @param {string} activeTab
 * @param {function} onTabChange
 * @param {string} variant - 'underline'|'pill'|'card'
 * @param {string} size    - 'sm'|'md'|'lg'
 */
const Tabs = ({ tabs = [], activeTab, onTabChange, variant = 'underline', size = 'md', className = '' }) => {
  return (
    <div className={`ds-tabs ds-tabs--${variant} ds-tabs--${size} ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          className={`ds-tab-trigger ${activeTab === tab.id ? 'ds-tab-trigger--active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="ds-tab-icon">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span className="ds-tab-count">{tab.count}</span>
          )}
          {variant === 'underline' && <div className="ds-tab-underline" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
};

/**
 * TabContent — wraps content for a tab panel
 */
export const TabContent = ({ tabId, activeTab, children }) => {
  if (tabId !== activeTab) return null;
  return (
    <div role="tabpanel" className="ds-tab-panel">
      {children}
    </div>
  );
};

export default Tabs;
