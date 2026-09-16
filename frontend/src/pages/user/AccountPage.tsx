import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  FiUser, FiShield, FiPackage, FiCalendar, FiLogOut, FiEdit3, 
  FiCheck, FiKey, FiMail, FiLock, FiCamera, FiMapPin, FiPlus, FiTrash2, FiStar 
} from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import PasswordRulesChecker, { validatePasswordRules } from '@/components/ui/PasswordRulesChecker';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { logout, updateUser, setCredentialsThunk, sendOtpThunk, changePasswordOtpThunk } from '@/features/authSlice';
import postApi from '@/services/api/postApi';
import { authApi } from '@/services/api/authApi';
import type { UserAddress } from '@/types';
import { 
  getSavedAddresses, saveAddress, updateAddress, 
  deleteAddress, setDefaultAddress, MAX_ADDRESSES 
} from '@/utils/addressStorage';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import { fetchServiceRequests } from '@/features/serviceRequestsSlice';
import { useVNAddress } from '@/hooks/useVNAddress';
import './AccountPage.css';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const { items: serviceRequests, loading: srLoading } = useAppSelector(s => s.serviceRequests);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security' | 'orders' | 'bookings'>('profile');

  // Handle URL query parameter ?tab=
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['profile', 'addresses', 'security', 'orders', 'bookings'].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Fetch service requests when bookings tab is active
  useEffect(() => {
    if (activeTab === 'bookings') {
      dispatch(fetchServiceRequests());
    }
  }, [activeTab, dispatch]);

  // Address Book Tab State & Cascading VN Address Hook
  const vnAddr = useVNAddress();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [editingAddr, setEditingAddr] = useState<UserAddress | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [addrMsg, setAddrMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Form State
  const [addrLabel, setAddrLabel] = useState('Nhà riêng');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  useEffect(() => {
    setAddresses(getSavedAddresses(user?.id));
  }, [user?.id]);

  // Profile Tab State
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Avatar Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState<string | null>(null);
  const [localAvatarPreview, setLocalAvatarPreview] = useState<string | null>(null);
  const [avatarImgError, setAvatarImgError] = useState(false);

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

  const handleAvatarSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalAvatarPreview(objectUrl);
    setAvatarImgError(false);

    try {
      setAvatarUploading(true);
      setAvatarMsg('Đang tải ảnh lên...');
      const uploadedUrl = await postApi.uploadImage(file);
      await authApi.updateProfile({ avatarUrl: uploadedUrl });
      dispatch(updateUser({ avatarUrl: uploadedUrl, avatar: uploadedUrl }));
      setAvatarMsg('Cập nhật ảnh đại diện thành công!');
      setLocalAvatarPreview(null); // Use the real URL now from redux store
      setTimeout(() => setAvatarMsg(null), 3000);
    } catch (err: any) {
      setAvatarMsg('Lỗi tải ảnh đại diện: ' + (err.message || 'Thất bại'));
      setLocalAvatarPreview(null);
      setTimeout(() => setAvatarMsg(null), 4000);
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.updateProfile({
        firstName,
        lastName,
        phone,
        address,
      });
      dispatch(updateUser({
        firstName,
        lastName,
        fullName: `${lastName} ${firstName}`.trim(),
        phone,
        address,
      }));
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err: any) {
      console.error(err);
    }
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

  // Address Handlers
  const handleOpenCreate = () => {
    if (addresses.length >= MAX_ADDRESSES) {
      setAddrMsg({ type: 'error', text: `Bạn đã lưu tối đa ${MAX_ADDRESSES} địa chỉ. Hãy xóa bớt trước khi thêm mới.` });
      return;
    }
    setEditingAddr(null);
    setAddrLabel('Nhà riêng');
    setAddrName(user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || '');
    setAddrPhone(user?.phone || '');
    setAddrStreet('');
    setAddrIsDefault(addresses.length === 0);
    setAddrMsg(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddr(addr);
    setAddrLabel(addr.label || 'Nhà riêng');
    setAddrName(addr.receiverName || '');
    setAddrPhone(addr.phone || '');
    setAddrStreet(addr.streetAddress || '');
    setAddrIsDefault(!!addr.isDefault);
    setAddrMsg(null);
    setIsFormOpen(true);
    vnAddr.setByName(addr.province || '', addr.district || '', addr.ward || '');
  };

  const handleSaveAddrForm = (e: React.FormEvent) => {
    e.preventDefault();
    const full = vnAddr.getFullAddress();
    if (!addrName.trim() || !addrPhone.trim() || !full.province || !full.district || !full.ward || !addrStreet.trim()) {
      setAddrMsg({ type: 'error', text: 'Vui lòng chọn Tỉnh/Thành, Quận/Huyện, Phường/Xã và điền số nhà/tên đường.' });
      return;
    }

    if (editingAddr) {
      const updated = updateAddress(editingAddr.id, {
        label: addrLabel,
        receiverName: addrName,
        phone: addrPhone,
        province: full.province,
        district: full.district,
        ward: full.ward,
        streetAddress: addrStreet,
        isDefault: addrIsDefault,
      }, user?.id);
      setAddresses(updated);
      setAddrMsg({ type: 'success', text: 'Đã cập nhật địa chỉ thành công!' });
    } else {
      const res = saveAddress({
        label: addrLabel,
        receiverName: addrName,
        phone: addrPhone,
        province: full.province,
        district: full.district,
        ward: full.ward,
        streetAddress: addrStreet,
        isDefault: addrIsDefault,
      }, user?.id);

      if (!res.success) {
        setAddrMsg({ type: 'error', text: res.message || 'Lỗi lưu địa chỉ' });
        return;
      }
      setAddresses(res.addresses);
      setAddrMsg({ type: 'success', text: 'Đã thêm địa chỉ mới thành công!' });
    }

    setIsFormOpen(false);
  };

  const handleDeleteAddr = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      const updated = deleteAddress(id, user?.id);
      setAddresses(updated);
    }
  };

  const handleSetDefaultAddr = (id: string) => {
    const updated = setDefaultAddress(id, user?.id);
    setAddresses(updated);
  };

  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);

  useEffect(() => {
    setUserOrders(orderStorage.getOrders());
  }, [activeTab]);

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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <div className="user-profile-summary">
            <div className="avatar-upload-container" onClick={handleAvatarSelect} title="Nhấp để thay đổi ảnh đại diện">
              {(() => {
                const src = localAvatarPreview || user?.avatarUrl || user?.avatar;
                const initials = (() => {
                  if (!displayName?.trim()) return '';
                  const parts = displayName.trim().split(/\s+/);
                  return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
                })();
                if (src && !avatarImgError) {
                  return (
                    <img
                      src={src}
                      alt="Avatar"
                      className="summary-avatar-img"
                      onError={() => setAvatarImgError(true)}
                    />
                  );
                }
                return (
                  <div className="summary-avatar-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a5cff 0%, #0ea5e9 100%)', color: '#fff', fontWeight: 800, fontSize: '2rem', userSelect: 'none' }}>
                    {initials || <FiUser size={32} />}
                  </div>
                );
              })()}
              <div className="avatar-upload-badge">
                <FiCamera />
              </div>
            </div>
            <div>
              <span className="avatar-upload-hint" onClick={handleAvatarSelect}>
                <FiCamera /> {avatarUploading ? 'Đang tải...' : 'Đổi ảnh đại diện'}
              </span>
            </div>
            {avatarMsg && (
              <div style={{ fontSize: '0.78rem', color: avatarMsg.includes('Lỗi') ? '#dc2626' : '#16a34a', fontWeight: 600, marginTop: '0.2rem' }}>
                {avatarMsg}
              </div>
            )}

            <h3 className="summary-name" style={{ marginTop: '0.5rem' }}>{displayName}</h3>
            <span className="summary-role">{user?.role === 'admin' ? '👑 Quản Lý (Admin)' : user?.role === 'staff' ? '🛠️ Nhân Viên (Staff)' : '👤 Khách Hàng Thân Thiết'}</span>
          </div>

          <nav className="account-menu">
            <button className={`menu-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <FiUser /> Thông Tin Cá Nhân
            </button>
            <button className={`menu-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
              <FiMapPin /> Sổ Địa Chỉ Thanh Toán
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

          {/* TAB 2: Address Book (Sổ Địa Chỉ) */}
          {activeTab === 'addresses' && (
            <div>
              <div className="account-card">
                <div className="addr-book-header">
                  <h3 className="account-card-title"><FiMapPin /> Sổ Địa Chỉ Thanh Toán ({addresses.length}/{MAX_ADDRESSES})</h3>
                  <button className="btn-addr-add" onClick={handleOpenCreate} disabled={addresses.length >= MAX_ADDRESSES}>
                    <FiPlus /> Thêm Địa Chỉ Mới
                  </button>
                </div>

                {addrMsg && (
                  <div className={addrMsg.type === 'success' ? 'save-alert' : 'addr-error-msg'}>
                    {addrMsg.type === 'success' && <FiCheck />} {addrMsg.text}
                  </div>
                )}

                {addresses.length === 0 && !isFormOpen && (
                  <div className="addr-empty-state">
                    <FiMapPin size={40} />
                    <p>Bạn chưa có địa chỉ nào. Thêm địa chỉ để thanh toán nhanh hơn!</p>
                  </div>
                )}

                <div className="addr-list">
                  {addresses.map(addr => (
                    <div key={addr.id} className={`addr-card ${addr.isDefault ? 'addr-default' : ''}`}>
                      <div className="addr-card-top">
                        <div className="addr-label-row">
                          <span className="addr-label-chip">{addr.label || 'Địa chỉ'}</span>
                          {addr.isDefault && <span className="addr-default-badge"><FiStar /> Mặc định</span>}
                        </div>
                        <div className="addr-card-actions">
                          {!addr.isDefault && (
                            <button className="addr-action-btn" onClick={() => handleSetDefaultAddr(addr.id)} title="Đặt làm mặc định">
                              <FiStar />
                            </button>
                          )}
                          <button className="addr-action-btn" onClick={() => handleOpenEdit(addr)} title="Sửa địa chỉ">
                            <FiEdit3 />
                          </button>
                          <button className="addr-action-btn danger" onClick={() => handleDeleteAddr(addr.id)} title="Xóa địa chỉ">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="addr-receiver"><strong>{addr.receiverName}</strong> &nbsp;|&nbsp; {addr.phone}</div>
                      <div className="addr-full">
                        {addr.streetAddress}, {addr.ward}, {addr.district}, {addr.province}
                      </div>
                    </div>
                  ))}
                </div>

                {isFormOpen && (
                  <div className="addr-form-card">
                    <h4 className="addr-form-title">
                      {editingAddr ? '✏️ Chỉnh Sửa Địa Chỉ' : '📍 Thêm Địa Chỉ Mới'}
                    </h4>
                    <form onSubmit={handleSaveAddrForm} className="acc-form">
                      <div className="form-group">
                        <label>Nhãn địa chỉ</label>
                        <div className="addr-label-pills">
                          {['Nhà riêng', 'Văn phòng', 'Quê nhà', 'Khác'].map(lbl => (
                            <button key={lbl} type="button"
                              className={`label-pill ${addrLabel === lbl ? 'active' : ''}`}
                              onClick={() => setAddrLabel(lbl)}>
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Họ và tên người nhận *</label>
                          <input type="text" value={addrName} onChange={e => setAddrName(e.target.value)} required placeholder="Họ và tên người nhận" />
                        </div>
                        <div className="form-group">
                          <label>Số điện thoại *</label>
                          <input type="tel" value={addrPhone} onChange={e => setAddrPhone(e.target.value)} required placeholder="Số điện thoại liên hệ" />
                        </div>
                      </div>

                      <div className="form-group-row">
                        <div className="form-group">
                          <label>Tỉnh / Thành phố *</label>
                          <select
                            value={vnAddr.selectedProvince?.code || ''}
                            onChange={e => vnAddr.selectProvince(e.target.value)}
                            disabled={vnAddr.loadingProvinces}
                          >
                            {vnAddr.loadingProvinces && <option value="">Đang tải Tỉnh/Thành...</option>}
                            {!vnAddr.loadingProvinces && vnAddr.provinces.map(p => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Phường / Xã / Thị trấn *</label>
                          <select
                            value={vnAddr.selectedWard?.code || ''}
                            onChange={e => vnAddr.selectWard(e.target.value)}
                            disabled={vnAddr.loadingWards || !vnAddr.selectedProvince}
                          >
                            <option value="">{vnAddr.loadingWards ? 'Đang tải Phường/Xã...' : '-- Chọn Phường / Xã / Thị trấn --'}</option>
                            {vnAddr.wards.map(w => (
                              <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Số nhà, tên đường, tòa nhà / căn hộ *</label>
                        <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)} required placeholder="Số nhà, tên đường, tòa nhà / căn hộ..." />
                      </div>

                      <div className="form-group">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={addrIsDefault} onChange={e => setAddrIsDefault(e.target.checked)} />
                          Đặt làm địa chỉ mặc định
                        </label>
                      </div>

                      {addrMsg && addrMsg.type === 'error' && (
                        <div className="addr-error-msg">{addrMsg.text}</div>
                      )}

                      <div className="addr-form-actions">
                        <button type="submit" className="btn-save-acc">
                          {editingAddr ? 'Cập Nhật Địa Chỉ' : 'Lưu Địa Chỉ Mới'}
                        </button>
                        <button type="button" className="btn-cancel-addr" onClick={() => setIsFormOpen(false)}>
                          Hủy
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Security & Password */}
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
              {userOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#6b7280' }}>
                  <FiPackage size={48} style={{ marginBottom: '0.75rem', color: '#9ca3af' }} />
                  <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Bạn chưa có đơn hàng nào.</p>
                  <Link to="/products" className="btn-save-acc" style={{ textDecoration: 'none', display: 'inline-flex', width: 'auto' }}>
                    Khám Phá Sản Phẩm Ngay
                  </Link>
                </div>
              ) : (
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
                      {userOrders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.id}</strong></td>
                          <td>{o.date}</td>
                          <td style={{ fontSize: '0.85rem' }}>{o.itemsSummary || o.items?.map(i => i.name).join(', ')}</td>
                          <td><strong>{o.total.toLocaleString('vi-VN')}₫</strong></td>
                          <td><span className="status-badge success">{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Bookings — Service Requests */}
          {activeTab === 'bookings' && (
            <div className="account-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 className="account-card-title" style={{ margin: 0 }}><FiCalendar /> Yêu Cầu Dịch Vụ Của Tôi</h3>
                <Link
                  to="/user/service-requests/new"
                  style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', background: 'var(--accent-gradient)', padding: '0.45rem 1rem', borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  + Gửi yêu cầu mới
                </Link>
              </div>

              {srLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>Đang tải...</div>
              ) : serviceRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#999' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                  <p style={{ margin: '0 0 1rem', fontSize: '0.95rem' }}>Chưa có yêu cầu dịch vụ nào.</p>
                  <Link to="/user/service-requests/new" style={{ color: '#4d8aff', fontWeight: 600 }}>Gửi yêu cầu ngay</Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {serviceRequests.map(req => {
                    const statusColor = req.status === 'Pending' ? '#f59e0b' : req.status === 'Accepted' ? '#10b981' : '#ef4444';
                    const statusBg   = req.status === 'Pending' ? 'rgba(245,158,11,0.12)' : req.status === 'Accepted' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)';
                    const statusLabel = req.status === 'Pending' ? 'Chờ xử lý' : req.status === 'Accepted' ? 'Đã chấp nhận' : 'Đã từ chối';
                    return (
                      <div key={req.id} style={{ padding: '1rem 1.25rem', borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-start' }}>
                        {/* Left: service + vehicle */}
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                            {req.requestedServiceName}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            🚗 {req.vehicleInfo?.licensePlate} · {req.vehicleInfo?.model}
                            {req.vehicleInfo?.year ? ` (${req.vehicleInfo.year})` : ''}
                          </div>
                          {req.customerNotes && (
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                              "{req.customerNotes}"
                            </div>
                          )}
                        </div>

                        {/* Middle: date/time */}
                        <div style={{ textAlign: 'center', minWidth: 100 }}>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>Mong muốn</div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {new Date(req.preferredDate).toLocaleDateString('vi-VN')}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            {req.preferredTime?.substring(0, 5)}
                          </div>
                        </div>

                        {/* Right: status + created date */}
                        <div style={{ textAlign: 'right', minWidth: 110 }}>
                          <span style={{ display: 'inline-block', padding: '0.25rem 0.65rem', borderRadius: 9999, fontSize: '0.78rem', fontWeight: 700, background: statusBg, color: statusColor }}>
                            {statusLabel}
                          </span>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                            {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </UserLayout>
  );
};

export default AccountPage;
