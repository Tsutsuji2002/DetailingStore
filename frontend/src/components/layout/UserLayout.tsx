import React from 'react';
import Header from './Header';
import Footer from './Footer';
import NotificationPanel from '../ui/NotificationPanel';
import CartDrawer from '../ui/CartDrawer';

interface UserLayoutProps { children: React.ReactNode; }

const UserLayout: React.FC<UserLayoutProps> = ({ children }) => (
  <div className="page-wrapper">
    <Header />
    <main className="main-content">
      {children}
    </main>
    <Footer />
    <NotificationPanel />
    <CartDrawer />
  </div>
);

export default UserLayout;
