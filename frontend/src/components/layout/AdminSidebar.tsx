import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiUsers, FiTool, FiShoppingBag, FiFileText, FiInfo, FiBriefcase, FiCalendar, FiFile, FiChevronLeft, FiChevronRight, FiLogOut, FiShield, FiHome, FiClipboard } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/features/authSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import './Sidebar.css';

const ADMIN_MENU = [
  { icon: <FiGrid />, label: 'Dashboard', to: '/admin/dashboard' },
  { icon: <FiShoppingBag />, label: 'Quản Lý Đơn Hàng', to: '/admin/orders' },
  { icon: <FiFileText />, label: 'Yêu Cầu Dịch Vụ', to: '/admin/service-requests' },
  { icon: <FiClipboard />, label: 'Công Việc', to: '/admin/work-orders' },
  { icon: <FiUsers />, label: 'Quản Lý Tài Khoản', to: '/admin/users' },
  { icon: <FiFile />, label: 'Nội Dung Chính', to: '/admin/content' },
  { icon: <FiTool />, label: 'Dịch Vụ', to: '/admin/services' },
  { icon: <FiShoppingBag />, label: 'Sản Phẩm', to: '/admin/products' },
  { icon: <FiFileText />, label: 'Bài Viết', to: '/admin/posts' },
  { icon: <FiInfo />, label: 'Liên Hệ / Thông Tin', to: '/admin/contact' },
  { icon: <FiBriefcase />, label: 'Tuyển Dụng', to: '/admin/recruitment' },
  { icon: <FiCalendar />, label: 'Lịch Làm Việc', to: '/admin/schedule' },
  { icon: <FiFile />, label: 'Tài Liệu Kỹ Thuật', to: '/admin/mechanic-docs' },
];

interface AdminSidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobileOpen = false, onCloseMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector(s => s.auth);

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside className={`sidebar admin-sidebar ${collapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <span className="sidebar-brand-icon"><FiShield /></span>
            <span className="sidebar-brand-text">Admin Panel</span>
          </div>
        )}
        <button className="sidebar-collapse-btn" onClick={() => setCollapsed(p => !p)} aria-label="Toggle sidebar">
          {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* User info */}
      {!collapsed && (
        <div className="sidebar-user">
          <UserAvatar src={user?.avatarUrl || user?.avatar} name={user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Admin'} size={36} className="sidebar-user-avatar" />
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || 'Admin'}</div>
            <div className="sidebar-user-role">Quản Trị Viên</div>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {ADMIN_MENU.map(item => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={handleNavClick}
            title={collapsed ? item.label : undefined}>
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-link-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/" className="sidebar-link" onClick={handleNavClick} title={collapsed ? 'Xem trang web' : undefined}>
          <span className="sidebar-link-icon"><FiHome /></span>
          {!collapsed && <span className="sidebar-link-label">Xem Trang Web</span>}
        </NavLink>
        <button className="sidebar-link sidebar-logout" onClick={() => { handleNavClick(); dispatch(logout()); navigate('/login'); }} title={collapsed ? 'Đăng xuất' : undefined}>
          <span className="sidebar-link-icon"><FiLogOut /></span>
          {!collapsed && <span className="sidebar-link-label">Đăng Xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
