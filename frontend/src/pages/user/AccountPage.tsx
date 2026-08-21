import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiShield, FiPackage, FiCalendar, FiLogOut, FiEdit3, FiCheck, FiKey, FiMail, FiLock } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import PasswordRulesChecker, { validatePasswordRules } from '@/components/ui/PasswordRulesChecker';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout, updateUser, setCredentialsThunk, sendOtpThunk, changePasswordOtpThunk } from '@/features/authSlice';
import './AccountPage.css';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'orders' | 'bookings'>('profile');

  // Profile Tab State
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Security Tab State (Set Credentials for Google user)
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [setupPassword, setSetupPassword] = useState('');
  const [confirmSetupPassword, setConfirmSetupPassword] = useState('');
  const [setupMsg, setSetupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);

  // Security Tab State (OTP Password Reset)
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState<{ text: string; devCode?: string } | null>(null);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpMsg, setOtpMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLastName(user.lastName || '');
      setFirstName(user.firstName || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setNewUsername(user.username || '');
    }
  }, [user]);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(p => p - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateUser({
      firstName,
      lastName,
      fullName: `${lastName} ${firstName}`.trim(),
      phone,
      address,
    }));
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  // Handle Setting Username & Password for Google Accounts
  const handleSetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupMsg(null);

    if (!newUsername.trim() || !setupPassword) {
      setSetupMsg({ type: 'error', text: 'Vui lòng nhập Tên đăng nhập và Mật khẩu.' });
      return;
    }

    const ruleResult = validatePasswordRules(setupPassword);
    if (!ruleResult.isValid) {
      setSetupMsg({ type: 'error', text: 'Mật khẩu chưa đạt yêu cầu an toàn (Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt).' });
      return;
    }

    if (setupPassword !== confirmSetupPassword) {
      setSetupMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }

    setSetupLoading(true);
    const res = await dispatch(setCredentialsThunk({ username: newUsername, password: setupPassword }));
    setSetupLoading(false);

    if (setCredentialsThunk.fulfilled.match(res)) {
      setSetupMsg({ type: 'success', text: 'Cài đặt Tên đăng nhập & Mật khẩu thành công! Giờ đây bạn có thể dùng mật khẩu để đăng nhập.' });
      setSetupPassword('');
      setConfirmSetupPassword('');
    } else {
      setSetupMsg({ type: 'error', text: (res.payload as string) || 'Cài đặt mật khẩu thất bại.' });
    }
  };

  // Handle Requesting OTP Code via Email
  const handleSendOtp = async () => {
    setOtpMsg(null);
    const res = await dispatch(sendOtpThunk());

    if (sendOtpThunk.fulfilled.match(res)) {
      setOtpSentMsg({
        text: res.payload.message
      });
      setOtpCountdown(60);
    } else {
      setOtpMsg({ type: 'error', text: (res.payload as string) || 'Không thể gửi mã OTP.' });
    }
  };

  // Handle Change Password with OTP
  const handleChangePasswordWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpMsg(null);

    if (!otpCode.trim() || !newPassword) {
      setOtpMsg({ type: 'error', text: 'Vui lòng điền mã OTP 6 chữ số và Mật khẩu mới.' });
      return;
    }

    const ruleResult = validatePasswordRules(newPassword);
    if (!ruleResult.isValid) {
      setOtpMsg({ type: 'error', text: 'Mật khẩu mới chưa đạt yêu cầu an toàn (Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt).' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setOtpMsg({ type: 'error', text: 'Mật khẩu mới xác nhận không khớp.' });
      return;
    }

    setOtpLoading(true);
    const res = await dispatch(changePasswordOtpThunk({ otpCode, newPassword }));
    setOtpLoading(false);

    if (changePasswordOtpThunk.fulfilled.match(res)) {
      setOtpMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.' });
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setOtpSentMsg(null);
    } else {
      setOtpMsg({ type: 'error', text: (res.payload as string) || 'Mã OTP không chính xác hoặc đã hết hạn.' });
    }
  };

  const sampleOrders = [
    { id: 'ORD-9482', date: '2024-08-10', total: 675000, status: 'Hoàn Thành', items: 'Set CarPro Clean (x1), Nhớt Honda Gold (x1)' },
    { id: 'ORD-8391', date: '2024-07-28', total: 890000, status: 'Đã Giao', items: 'Lốp Michelin Pilot Street (x1)' },
  ];

  const sampleBookings = [
    { id: 'BK-102', date: '2024-08-15 09:00', service: 'Phủ Ceramic Xe Máy 3 Lớp', status: 'Đã Xác Nhận', mechanic: 'Nguyễn Văn Minh' },
    { id: 'BK-089', date: '2024-07-20 14:00', service: 'Bảo Dưỡng Tổng Quát Tay Ga', status: 'Hoàn Thành', mechanic: 'Lê Hoàng Nam' },
  ];

  const displayName = user ? (user.fullName || `${user.lastName} ${user.firstName}`.trim()) : 'Khách Hàng';
  const hasPassword = user?.hasPassword || false;
  const isGoogleAccount = user?.authProvider === 'google' || user?.authProvider === 'google_linked';

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Tài Khoản Của Tôi</h1>
          <p className="page-hero-sub">Quản lý thông tin cá nhân, bảo mật tài khoản & lịch sử mua hàng</p>
        </div>
      </div>

      <div className="container account-layout">
        {/* Sidebar Nav */}
        <aside className="account-sidebar">
          <div className="user-profile-summary">
            <img src={user?.avatarUrl || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=1a5cff&color=ffffff&bold=true`} alt="" className="summary-avatar" />
            <h3 className="summary-name">{displayName}</h3>
            <span className="summary-role">{user?.role === 'admin' ? '👑 Quản Lý (Admin)' : user?.role === 'staff' ? '🛠️ Nhân Viên (Staff)' : '👤 Khách Hàng Thân Thiết'}</span>
          </div>

          <nav className="account-menu">
            <button className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <FiUser /> Thông Tin Cá Nhân
            </button>
            <button className={`menu-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <FiShield /> Bảo Mật & Đăng Nhập
            </button>
            <button className={`menu-btn ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              <FiPackage /> Đơn Hàng Của Tôi
            </button>
            <button className={`menu-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
              <FiCalendar /> Lịch Hẹn Dịch Vụ
            </button>

            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Link to={user.role === 'admin' ? '/admin/dashboard' : '/staff/schedule'} className="menu-btn portal-link">
                🚀 Chuyển sang Trang Quản Lý
              </Link>
            )}

            <button className="menu-btn logout-btn" onClick={handleLogout} id="account-logout">
              <FiLogOut /> Đăng Xuất
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="account-main">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="account-card">
              <h3 className="account-card-title"><FiEdit3 /> Cập Nhật Thông Tin Cá Nhân</h3>
              {profileSaved && <div className="save-alert"><FiCheck /> Đã lưu thông tin mới thành công!</div>}

              <form onSubmit={handleSaveProfile} className="acc-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Họ & Tên Đệm *</label>
                    <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Tên *</label>
                    <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Số Điện Thoại</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={user?.email || ''} disabled style={{ opacity: 0.7 }} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ mặc định</label>
                  <textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ nhận hàng..." />
                </div>

                <button type="submit" className="btn-save-acc" id="save-profile-btn">
                  Lưu Thay Đổi
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div>
              {/* Account Status Box */}
              <div className="account-card">
                <h3 className="account-card-title"><FiShield /> Trạng Thái Bảo Mật Tài Khoản</h3>

                <div className="security-status-box">
                  <div className="sec-status-item">
                    <span className="label">Phương thức xác thực:</span>
                    <span className="value">
                      {isGoogleAccount && hasPassword ? (
                        <span className="badge-auth linked">🟢 Mật khẩu & Google</span>
                      ) : isGoogleAccount ? (
                        <span className="badge-auth google">🔵 Google Sign-In</span>
                      ) : (
                        <span className="badge-auth local">⚪ Mật khẩu (Local)</span>
                      )}
                    </span>
                  </div>

                  <div className="sec-status-item">
                    <span className="label">Tên đăng nhập (Username):</span>
                    <span className="value">@{user?.username || 'chua_co'}</span>
                  </div>

                  <div className="sec-status-item">
                    <span className="label">Trạng thái Mật Khẩu:</span>
                    <span className="value">{hasPassword ? '✅ Đã kích hoạt' : '⚠️ Chưa cài đặt mật khẩu'}</span>
                  </div>
                </div>

                {/* Case 1: First Google Login - No Password Set Yet */}
                {!hasPassword && (
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FiKey /> Cài Đặt Đăng Nhập Bằng Tên Đăng Nhập & Mật Khẩu
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
                      Hiện tại tài khoản của bạn đang đăng nhập qua Google. Bạn có thể thiết lập <strong>Tên đăng nhập</strong> và <strong>Mật khẩu</strong> bên dưới để có thể đăng nhập bằng mật khẩu bất kỳ lúc nào.
                    </p>

                    {setupMsg && (
                      <div className={setupMsg.type === 'success' ? 'save-alert' : 'auth-error'} style={setupMsg.type === 'error' ? { color: '#dc2626', background: '#fee2e2', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1rem' } : { marginBottom: '1rem' }}>
                        {setupMsg.type === 'success' && <FiCheck />} {setupMsg.text}
                      </div>
                    )}

                    <form onSubmit={handleSetCredentials} className="acc-form">
                      <div className="form-group">
                        <label>Tên Đăng Nhập (Username) *</label>
                        <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required placeholder="Ví dụ: trungnguyen2026" />
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Tạo Mật Khẩu Mới *</label>
                          <input type="password" value={setupPassword} onChange={e => setSetupPassword(e.target.value)} required placeholder="Tối thiểu 8 ký tự" />
                        </div>
                        <div className="form-group">
                          <label>Xác Nhận Mật Khẩu *</label>
                          <input type="password" value={confirmSetupPassword} onChange={e => setConfirmSetupPassword(e.target.value)} required placeholder="Nhập lại mật khẩu" />
                        </div>
                      </div>

                      <PasswordRulesChecker password={setupPassword} confirmPassword={confirmSetupPassword} />

                      <button type="submit" className="btn-save-acc" disabled={setupLoading}>
                        {setupLoading ? 'Đang lưu...' : 'Lưu Cấu Hình Mật Khẩu'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Case 2: Account Has Password - Change Password via Email OTP */}
              {hasPassword && (
                <div className="account-card">
                  <h3 className="account-card-title"><FiKey /> Đổi Mật Khẩu Với Xác Thực Email OTP</h3>

                  {otpMsg && (
                    <div className={otpMsg.type === 'success' ? 'save-alert' : 'auth-error'} style={otpMsg.type === 'error' ? { color: '#dc2626', background: '#fee2e2', padding: '0.625rem 0.875rem', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '1.25rem' } : { marginBottom: '1.25rem' }}>
                      {otpMsg.type === 'success' && <FiCheck />} {otpMsg.text}
                    </div>
                  )}

                  <div className="otp-box">
                    <div className="otp-box-msg">
                      <FiMail style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                      Để đảm bảo an toàn tuyệt đối, hệ thống sẽ gửi một mã OTP 6 chữ số đến email <strong>{user?.email}</strong>.
                    </div>
                    {otpSentMsg && (
                      <div style={{ fontSize: '0.83rem', color: '#15803d', fontWeight: 600, background: '#dcfce7', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                        ✅ {otpSentMsg.text}
                      </div>
                    )}
                    <div>
                      <button type="button" onClick={handleSendOtp} disabled={otpCountdown > 0} className="btn-send-otp">
                        <FiMail /> {otpCountdown > 0 ? `Gửi lại mã OTP (${otpCountdown}s)` : 'Gửi Mã Xác Nhận OTP qua Email'}
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleChangePasswordWithOtp} className="acc-form">
                    <div className="form-group">
                      <label>Mã Xác Nhận OTP 6 Chữ Số *</label>
                      <input type="text" value={otpCode} onChange={e => setOtpCode(e.target.value)} required placeholder="Ví dụ: 123456" maxLength={6} style={{ letterSpacing: '0.15em', fontWeight: 700 }} />
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label>Mật Khẩu Mới *</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required placeholder="••••••••" />
                      </div>
                      <div className="form-group">
                        <label>Xác Nhận Mật Khẩu Mới *</label>
                        <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required placeholder="••••••••" />
                      </div>
                    </div>

                    <PasswordRulesChecker password={newPassword} confirmPassword={confirmNewPassword} />

                    <button type="submit" className="btn-save-acc" disabled={otpLoading}>
                      {otpLoading ? 'Đang xác thực & đổi mật khẩu...' : 'Xác Nhận Đổi Mật Khẩu'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Orders */}
          {activeTab === 'orders' && (
            <div className="account-card">
              <h3 className="account-card-title"><FiPackage /> Lịch Sử Đơn Hàng</h3>
              <div className="orders-table-wrap">
                <table className="acc-table">
                  <thead>
                    <tr>
                      <th>Mã Đơn</th>
                      <th>Ngày</th>
                      <th>Sản Phẩm</th>
                      <th>Tổng Tiền</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{o.date}</td>
                        <td style={{ fontSize: '0.85rem' }}>{o.items}</td>
                        <td><strong>{o.total.toLocaleString('vi-VN')}₫</strong></td>
                        <td><span className="status-badge success">{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Bookings */}
          {activeTab === 'bookings' && (
            <div className="account-card">
              <h3 className="account-card-title"><FiCalendar /> Lịch Hẹn Dịch Vụ Detailing</h3>
              <div className="orders-table-wrap">
                <table className="acc-table">
                  <thead>
                    <tr>
                      <th>Mã Lịch</th>
                      <th>Thời Gian</th>
                      <th>Dịch Vụ</th>
                      <th>Kỹ Thuật Viên</th>
                      <th>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampleBookings.map(b => (
                      <tr key={b.id}>
                        <td><strong>#{b.id}</strong></td>
                        <td>{b.date}</td>
                        <td><strong>{b.service}</strong></td>
                        <td>{b.mechanic}</td>
                        <td><span className="status-badge info">{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </UserLayout>
  );
};

export default AccountPage;
