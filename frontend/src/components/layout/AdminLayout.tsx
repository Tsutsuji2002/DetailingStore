import React from 'react';
import AdminSidebar from './AdminSidebar';
import './DashboardLayout.css';

interface AdminLayoutProps { children: React.ReactNode; title?: string; }

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => (
  <div className="dashboard-layout">
    <AdminSidebar />
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

export default AdminLayout;
