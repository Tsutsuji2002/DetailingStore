import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import UserLayout from '@/components/layout/UserLayout';
import GoogleAccountLinkModal from '@/components/ui/GoogleAccountLinkModal';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { loginThunk, googleAuthThunk, clearAuthError } from '@/features/authSlice';
import './AuthPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading, error, linkingRequired } = useAppSelector(s => s.auth);
  const shopInfo = useAppSelector(s => s.shop.info);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/schedule');
      else navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Vui lòng nhập đầy đủ Email / Tên đăng nhập và Mật khẩu.');
      return;
    }

    await dispatch(loginThunk({ email, password }));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setLocalError('');
      await dispatch(googleAuthThunk({ credential: credentialResponse.credential }));
    }
  };

  const handleGoogleError = () => {
    setLocalError('Đăng nhập bằng Google thất bại. Vui lòng thử lại.');
  };

  const displayError = error || localError;

  return (
    <UserLayout>
      {linkingRequired && (
        <GoogleAccountLinkModal
          email={linkingRequired.email}
          credential={linkingRequired.credential}
        />
      )}

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">{shopInfo.logoIcon || '🏍️'} {shopInfo.name}</div>
            <h2>Đăng Nhập Tài Khoản</h2>
            <p>Chào mừng bạn trở lại với {shopInfo.name}</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {displayError && (
              <div className="auth-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                {displayError}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="login-email">Email / Tên đăng nhập</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input
                  type="text"
                  id="login-email"
                  required
                  placeholder="Email hoặc Username"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-pass">Mật khẩu</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="login-pass"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-auth-submit" id="login-submit" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'} <FiArrowRight />
            </button>
          </form>

          <div className="auth-divider"><span>hoặc</span></div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', margin: '0.5rem 0' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              shape="pill"
            />
          </div>

          <div className="auth-footer">
            Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default LoginPage;
