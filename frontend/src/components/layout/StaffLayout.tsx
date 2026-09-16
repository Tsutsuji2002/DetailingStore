import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import StaffSidebar from './StaffSidebar';
import './DashboardLayout.css';

interface StaffLayoutProps { children: React.ReactNode; title?: string; }

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, title }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  return (
    <div className="dashboard-layout">
      {/* Mobile Navigation Header */}
      <header className="admin-mobile-header staff-mobile-header">
        <button
          className="admin-mobile-menu-btn"
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label="Toggle Staff Menu"
        >
          {isMobileOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="admin-mobile-brand">
          <span className="admin-mobile-brand-icon">👨‍🔧</span>
          <span className="admin-mobile-brand-text">Staff Area</span>
        </div>
      </header>

      {/* Backdrop overlay */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          onTouchMove={e => e.preventDefault()}
          title="Đóng Menu"
        />
      )}

      <StaffSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      <div className="dashboard-content">
        {title && (
          <div className="dashboard-page-header">
            <h1 className="dashboard-page-title">{title}</h1>
          </div>
        )}
        <div className="dashboard-body">{children}</div>
      </div>
    </div>
  );
};

export default StaffLayout;
