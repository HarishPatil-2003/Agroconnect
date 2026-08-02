import React from 'react';
import './layouts.css';

/**
 * MainLayout — wraps public + authenticated pages
 * Provides consistent page background, padding, and structure
 */
const MainLayout = ({ children, className = '', style }) => (
  <div className={`main-layout ${className}`} style={style}>
    <main className="main-layout__content">
      {children}
    </main>
  </div>
);

export default MainLayout;
