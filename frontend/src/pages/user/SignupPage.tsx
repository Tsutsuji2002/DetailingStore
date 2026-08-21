import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiArrowRight } from 'react-icons/fi';
import { GoogleLogin } from '@react-oauth/google';
import UserLayout from '@/components/layout/UserLayout';
import GoogleAccountLinkModal from '@/components/ui/GoogleAccountLinkModal';
import PasswordRulesChecker, { validatePasswordRules } from '@/components/ui/PasswordRulesChecker';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { registerThunk, googleAuthThunk, clearAuthError } from '@/features/authSlice';
import './AuthPage.css';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const shopInfo = useAppSelector(s => s.shop.info);
  const { isAuthenticated, user, isLoading, error, linkingRequired } = useAppSelector(s => s.auth);

  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!lastName || !firstName || !email || !password) {
      setLocalError('Vui lòng điền đầy đủ các thông tin bắt buộc (*).');
      return;
    }

    const ruleResult = validatePasswordRules(password);
    if (!ruleResult.isValid) {
      setLocalError('Mật khẩu chưa đạt yêu cầu an toàn (Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt).');
      return;
    }

    await dispatch(registerThunk({ firstName, lastName, email, password, phone }));
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      setLocalError('');
      await dispatch(googleAuthThunk({ credential: credentialResponse.credential }));
    }
  };

  const handleGoogleError = () => {
    setLocalError('Đăng ký bằng Google thất bại. Vui lòng thử lại.');
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
            <h2>Tạo Tài Khoản Mới</h2>
            <p>Đăng ký để nhận thông báo ưu đãi & đặt lịch nhanh chóng</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            {displayError && (
              <div className="auth-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                {displayError}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label htmlFor="signup-lastname">Họ & Tên Đệm *</label>
                <div className="input-icon-wrap">
                  <FiUser className="input-icon" />
                  <input type="text" id="signup-lastname" required placeholder="Nguyễn Văn" value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-firstname">Tên *</label>
                <div className="input-icon-wrap">
                  <FiUser className="input-icon" />
                  <input type="text" id="signup-firstname" required placeholder="An" value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email *</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" />
                <input type="email" id="signup-email" required placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-phone">Số điện thoại</label>
              <div className="input-icon-wrap">
                <FiPhone className="input-icon" />
                <input type="tel" id="signup-phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-pass">Mật khẩu *</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" />
                <input type="password" id="signup-pass" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            <PasswordRulesChecker password={password} showMatchStatus={false} />

            <button type="submit" className="btn-auth-submit" id="signup-submit" disabled={isLoading}>
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'} <FiArrowRight />
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
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default SignupPage;
