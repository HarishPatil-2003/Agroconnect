import React from 'react';
import Tabs, { TabContent } from '../components/ui/Tabs';
import './layouts.css';

/**
 * DashboardLayout — Used by Farmer/Buyer/Admin dashboards
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {React.ReactNode} actions     - Header right-side action buttons
 * @param {Array} tabs                  - [{id, label, icon?, count?}]
 * @param {string} activeTab
 * @param {function} onTabChange
 * @param {React.ReactNode} children
 */
const DashboardLayout = ({
  title,
  subtitle,
  actions,
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}) => (
  <div className={`dashboard-layout ${className}`}>
    {/* Page Header */}
    <div className="dashboard-layout__header">
      <div className="dashboard-layout__header-inner">
        <div>
          {title    && <h1 className="dashboard-layout__title">{title}</h1>}
          {subtitle && <p  className="dashboard-layout__subtitle">{subtitle}</p>}
        </div>
        {actions && <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>{actions}</div>}
      </div>
    </div>

    {/* Tab Navigation */}
    {tabs && tabs.length > 0 && (
      <div className="dashboard-layout__tabs">
        <div className="dashboard-layout__tabs-inner">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            variant="underline"
            size="md"
          />
        </div>
      </div>
    )}

    {/* Page Content */}
    <div className="dashboard-layout__content">
      {children}
    </div>
  </div>
);

export { TabContent };
export default DashboardLayout;
