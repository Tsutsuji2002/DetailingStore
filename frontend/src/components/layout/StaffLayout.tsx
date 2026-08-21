import React from 'react';
import StaffSidebar from './StaffSidebar';
import './DashboardLayout.css';

interface StaffLayoutProps { children: React.ReactNode; title?: string; }

const StaffLayout: React.FC<StaffLayoutProps> = ({ children, title }) => (
  <div className="dashboard-layout">
    <StaffSidebar />
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

export default StaffLayout;
