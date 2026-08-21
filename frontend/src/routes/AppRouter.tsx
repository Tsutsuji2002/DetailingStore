import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// User Pages
const HomePage = lazy(() => import('@/pages/user/HomePage'));
const ServicesPage = lazy(() => import('@/pages/user/ServicesPage'));
const ServiceDetailPage = lazy(() => import('@/pages/user/ServiceDetailPage'));
const ProductsPage = lazy(() => import('@/pages/user/ProductsPage'));
const ProductDetailPage = lazy(() => import('@/pages/user/ProductDetailPage'));
const PostsPage = lazy(() => import('@/pages/user/PostsPage'));
const PostDetailPage = lazy(() => import('@/pages/user/PostDetailPage'));
const ContactPage = lazy(() => import('@/pages/user/ContactPage'));
const RecruitmentPage = lazy(() => import('@/pages/user/RecruitmentPage'));
const JobDetailPage = lazy(() => import('@/pages/user/JobDetailPage'));
const LoginPage = lazy(() => import('@/pages/user/LoginPage'));
const SignupPage = lazy(() => import('@/pages/user/SignupPage'));
const CartPage = lazy(() => import('@/pages/user/CartPage'));
const AccountPage = lazy(() => import('@/pages/user/AccountPage'));
const SettingsPage = lazy(() => import('@/pages/user/SettingsPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const AdminContentPage = lazy(() => import('@/pages/admin/ContentEditPage'));
const AdminServicesPage = lazy(() => import('@/pages/admin/ServicesEditPage'));
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductEditPage'));
const AdminPostsPage = lazy(() => import('@/pages/admin/PostManagementPage'));
const AdminContactPage = lazy(() => import('@/pages/admin/ContactEditPage'));
const AdminRecruitmentPage = lazy(() => import('@/pages/admin/RecruitmentEditPage'));
const AdminSchedulePage = lazy(() => import('@/pages/admin/ScheduleEditPage'));
const AdminMechanicDocsPage = lazy(() => import('@/pages/admin/MechanicDocsEditPage'));

// Staff Pages
const StaffSchedulePage = lazy(() => import('@/pages/staff/StaffSchedulePage'));
const StaffChatPage = lazy(() => import('@/pages/staff/StaffChatPage'));
const MechanicDocsPage = lazy(() => import('@/pages/staff/MechanicDocsPage'));

import { useAppDispatch } from '@/hooks/useAppStore';
import { fetchShopContentThunk } from '@/features/shopSlice';

const Loader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem' }} />
      <div>Đang tải...</div>
    </div>
  </div>
);

const AppRouter: React.FC = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(fetchShopContentThunk());
  }, [dispatch]);

  return (
    <BrowserRouter>
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public User Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetailPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/:slug" element={<PostDetailPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/recruitment" element={<RecruitmentPage />} />
        <Route path="/recruitment/:id" element={<JobDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected User Routes */}
        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/content" element={<ProtectedRoute requiredRole="admin"><AdminContentPage /></ProtectedRoute>} />
        <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServicesPage /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProductsPage /></ProtectedRoute>} />
        <Route path="/admin/posts" element={<ProtectedRoute requiredRole="admin"><AdminPostsPage /></ProtectedRoute>} />
        <Route path="/admin/contact" element={<ProtectedRoute requiredRole="admin"><AdminContactPage /></ProtectedRoute>} />
        <Route path="/admin/recruitment" element={<ProtectedRoute requiredRole="admin"><AdminRecruitmentPage /></ProtectedRoute>} />
        <Route path="/admin/schedule" element={<ProtectedRoute requiredRole="admin"><AdminSchedulePage /></ProtectedRoute>} />
        <Route path="/admin/mechanic-docs" element={<ProtectedRoute requiredRole="admin"><AdminMechanicDocsPage /></ProtectedRoute>} />

        {/* Staff Routes */}
        <Route path="/staff/schedule" element={<ProtectedRoute requiredRole={['admin','staff']}><StaffSchedulePage /></ProtectedRoute>} />
        <Route path="/staff/chat" element={<ProtectedRoute requiredRole={['admin','staff']}><StaffChatPage /></ProtectedRoute>} />
        <Route path="/staff/mechanic-docs" element={<ProtectedRoute requiredRole={['admin','staff']}><MechanicDocsPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
  );
};

export default AppRouter;
