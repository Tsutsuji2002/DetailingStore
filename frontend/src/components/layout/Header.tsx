import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiBell, FiShoppingCart, FiUser, FiMenu, FiX, FiSun, FiMoon, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { BsMoonStarsFill } from 'react-icons/bs';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout } from '@/features/authSlice';
import { setTheme } from '@/features/themeSlice';
import { toggleOpen as toggleNotif } from '@/features/notificationsSlice';
import { toggleCart } from '@/features/cartSlice';
import type { ThemeMode } from '@/features/themeSlice';
import './Header.css';

const NAV_LINKS = [
  { to: '/', label: 'Trang Chủ' },
  { to: '/services', label: 'Dịch Vụ' },
  { to: '/products', label: 'Cửa Hàng' },
  { to: '/posts', label: 'Tin Tức' },
  { to: '/contact', label: 'Liên Hệ' },
  { to: '/recruitment', label: 'Tuyển Dụng' },
];

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const { mode } = useAppSelector(s => s.theme);
  const shopInfo = useAppSelector(s => s.shop.info);
  const unreadCount = useAppSelector(s => s.notifications.items.filter(n => !n.isRead).length);
  const cartCount = useAppSelector(s => s.cart.items.reduce((acc, i) => acc + i.quantity, 0));

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) setThemeMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  const themeOptions: { label: string; value: ThemeMode; icon: React.ReactNode }[] = [
    { label: 'Sáng', value: 'light', icon: <FiSun /> },
    { label: 'Tối', value: 'dark', icon: <FiMoon /> },
    { label: 'Mờ', value: 'dim', icon: <BsMoonStarsFill /> },
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="header-logo">
          {shopInfo?.logoUrl ? (
            <img src={shopInfo.logoUrl} alt={shopInfo?.name || 'Logo'} className="logo-img" style={{ height: 36, objectFit: 'contain', marginRight: 6 }} />
          ) : (
            <span className="logo-icon">{shopInfo?.logoIcon || '🏍️'}</span>
          )}
          <span className="logo-text">{shopInfo?.name || 'Detailing Store'}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="header-nav">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              {l.label}
            </NavLink>
          ))}
          {user?.role === 'admin' && <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link nav-link-admin ${isActive ? 'active' : ''}`}>Admin</NavLink>}
          {(user?.role === 'staff' || user?.role === 'admin') && <NavLink to="/staff/schedule" className={({ isActive }) => `nav-link nav-link-staff ${isActive ? 'active' : ''}`}>Staff</NavLink>}
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Theme switcher */}
          <div className="dropdown-wrapper" ref={themeMenuRef}>
            <button className="icon-btn" onClick={() => setThemeMenuOpen(p => !p)} aria-label="Đổi giao diện" id="theme-toggle-btn">
              {mode === 'light' ? <FiSun /> : mode === 'dark' ? <FiMoon /> : <BsMoonStarsFill />}
            </button>
            {themeMenuOpen && (
              <div className="dropdown-menu theme-menu">
                {themeOptions.map(opt => (
                  <button key={opt.value} className={`dropdown-item ${mode === opt.value ? 'active' : ''}`}
                    onClick={() => { dispatch(setTheme(opt.value)); setThemeMenuOpen(false); }}>
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell */}
          {isAuthenticated && (
            <button className="icon-btn notif-btn" onClick={() => dispatch(toggleNotif())} aria-label="Thông báo" id="notification-btn">
              <FiBell />
              {unreadCount > 0 && <span className="badge-dot">{unreadCount}</span>}
            </button>
          )}

          {/* Cart */}
          <button className="icon-btn cart-btn" onClick={() => dispatch(toggleCart())} aria-label="Giỏ hàng" id="cart-btn">
            <FiShoppingCart />
            {cartCount > 0 && <span className="badge-dot">{cartCount}</span>}
          </button>

          {/* User menu */}
          {isAuthenticated ? (
            <div className="dropdown-wrapper" ref={userMenuRef}>
              <button className="user-btn" onClick={() => setUserMenuOpen(p => !p)} id="user-menu-btn">
                <img src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}&background=1a5cff&color=ffffff&bold=true`} alt={user?.firstName} className="user-avatar" />
                <span className="user-name">{user?.firstName || user?.fullName}</span>
                <FiChevronDown className={`chevron ${userMenuOpen ? 'open' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="dropdown-menu user-menu">
                  <div className="user-menu-header">
                    <img src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || user?.firstName || 'User')}&background=1a5cff&color=ffffff&bold=true`} alt="" className="user-menu-avatar" />
                    <div>
                      <div className="user-menu-name">{user?.fullName || `${user?.lastName} ${user?.firstName}`.trim()}</div>
                      <div className="user-menu-role">{user?.role === 'admin' ? 'Quản Trị Viên' : user?.role === 'staff' ? 'Nhân Viên' : 'Khách Hàng'}</div>
                    </div>
                  </div>
                  <hr className="menu-divider" />
                  <Link to="/account" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiUser /> Tài Khoản</Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiSettings /> Cài Đặt</Link>
                  {user?.role === 'admin' && <Link to="/admin/dashboard" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>🛡️ Quản Trị</Link>}
                  {(user?.role === 'staff' || user?.role === 'admin') && <Link to="/staff/schedule" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>👨‍🔧 Khu Vực Staff</Link>}
                  <hr className="menu-divider" />
                  <button className="dropdown-item danger" onClick={handleLogout}><FiLogOut /> Đăng Xuất</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn-outline-sm">Đăng Nhập</Link>
              <Link to="/signup" className="btn-primary-sm">Đăng Ký</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(p => !p)} aria-label="Menu" id="mobile-menu-btn">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}>
            {l.label}
          </NavLink>
        ))}
        {!isAuthenticated && (
          <div className="mobile-auth">
            <Link to="/login" className="btn-outline-sm w-full" onClick={() => setMenuOpen(false)}>Đăng Nhập</Link>
            <Link to="/signup" className="btn-primary-sm w-full" onClick={() => setMenuOpen(false)}>Đăng Ký</Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
