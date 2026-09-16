import React, { useState, useEffect } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import './DashboardLayout.css';

interface AdminLayoutProps { children: React.ReactNode; title?: string; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Lock body scroll when mobile menu is open
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
      {/* Mobile Top Navigation Header */}
      <header className="admin-mobile-header">
        <button
          className="admin-mobile-menu-btn"
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label="Toggle Navigation Menu"
        >
          {isMobileOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="admin-mobile-brand">
          <span className="admin-mobile-brand-icon">🛡️</span>
          <span className="admin-mobile-brand-text">Admin Panel</span>
        </div>
      </header>

      {/* Backdrop Overlay when mobile sidebar is open */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
          onTouchMove={e => e.preventDefault()}
          title="Đóng Menu"
        />
      )}

      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

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

export default AdminLayout;
