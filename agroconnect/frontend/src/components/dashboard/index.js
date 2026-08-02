import React from 'react';
import StatCard from '../ui/StatCard';

export const DashboardWidget = ({ title, children, action }) => (
  <div className="card" style={{ padding: 'var(--space-6)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
      <h3 className="text-title">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

export { StatCard };
