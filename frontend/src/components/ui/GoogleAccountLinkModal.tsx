import React, { useState } from 'react';
import { FiLink, FiLock, FiArrowRight } from 'react-icons/fi';
import { useAppDispatch } from '@/hooks/useAppStore';
import { googleAuthThunk, clearLinkingRequired } from '@/features/authSlice';
import './GoogleAccountLinkModal.css';

interface Props {
  email: string;
  credential: string;
}

const GoogleAccountLinkModal: React.FC<Props> = ({ email, credential }) => {
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    dispatch(clearLinkingRequired());
  };

  const handleConfirmLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Vui lòng nhập mật khẩu hiện tại của bạn.');
      return;
    }

    setIsLoading(true);
    setError('');

    const res = await dispatch(googleAuthThunk({
      credential,
      confirmLinking: true,
      password,
    }));

    setIsLoading(false);

    if (googleAuthThunk.rejected.match(res)) {
      setError((res.payload as string) || 'Mật khẩu không chính xác.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="link-modal-card">
        <div className="link-modal-header">
          <div className="link-modal-icon">
            <FiLink />
          </div>
          <h3 className="link-modal-title">Liên Kết Tài Khoản Google</h3>
          <p className="link-modal-desc">
            Tài khoản với email <strong>{email}</strong> đã được tạo bằng mật khẩu trước đó. Vui lòng nhập mật khẩu của tài khoản để hoàn tất liên kết với Google.
          </p>
        </div>

        <form onSubmit={handleConfirmLink} className="link-modal-form">
          {error && (
            <div className="auth-error" style={{ color: '#dc2626', background: '#fee2e2', padding: '0.625rem', borderRadius: '10px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="link-pass">Mật khẩu hiện tại *</label>
            <div className="input-icon-wrap">
              <FiLock className="input-icon" />
              <input
                type="password"
                id="link-pass"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="link-modal-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel-link" disabled={isLoading}>
              Hủy
            </button>
            <button type="submit" className="btn-confirm-link" disabled={isLoading}>
              {isLoading ? 'Đang liên kết...' : 'Xác Nhận Liên Kết'} <FiArrowRight />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoogleAccountLinkModal;
