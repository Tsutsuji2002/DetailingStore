import React, { useState } from 'react';
import { FiSun, FiMoon, FiBell, FiShield, FiCheck } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { setTheme } from '@/features/themeSlice';
import type { ThemeMode } from '@/types';

const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mode } = useAppSelector(s => s.theme);

  const [zaloNotif, setZaloNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Cài Đặt Hệ Thống</h1>
          <p className="page-hero-sub">Tùy chỉnh giao diện (Giao diện Sáng / Tối / Dim) & kênh nhận thông báo</p>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 700, padding: '2.5rem 0 4rem' }}>
        <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '2rem' }}>
          {saved && (
            <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.625rem 1rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
              <FiCheck /> Đã lưu cài đặt!
            </div>
          )}

          {/* Theme Selector */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiSun /> Giao Diện Ứng Dụng (Theme System)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { id: 'light', label: '☀️ Sáng (Light)', bg: '#ffffff', color: '#0d1b3e', border: '#e2e8f0' },
                { id: 'dark', label: '🌙 Tối (Dark)', bg: '#0d1627', color: '#f8fafc', border: '#1e293b' },
                { id: 'dim', label: '🌆 Trầm (Dim)', bg: '#1c1917', color: '#fafaf9', border: '#292524' },
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dispatch(setTheme(t.id as ThemeMode))}
                  style={{
                    padding: '1.25rem 1rem',
                    borderRadius: 14,
                    background: t.bg,
                    color: t.color,
                    border: mode === t.id ? '2.5px solid var(--accent-primary)' : `1.5px solid ${t.border}`,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    textAlign: 'center',
                    boxShadow: mode === t.id ? '0 0 12px rgba(26,92,255,0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}>
                  {t.label}
                  {mode === t.id && <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', color: 'var(--accent-primary)' }}>✓ Đang chọn</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Notification settings */}
          <div style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBell /> Kênh Nhận Thông Báo
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 12, background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>📲 Thông báo qua Zalo ZNS / App</span>
                <input type="checkbox" checked={zaloNotif} onChange={e => setZaloNotif(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }} />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 12, background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>📧 Thông báo xác nhận đơn & khuyến mãi qua Email</span>
                <input type="checkbox" checked={emailNotif} onChange={e => setEmailNotif(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }} />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 12, background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>💬 Tin nhắn SMS nhắc lịch hẹn bảo dưỡng</span>
                <input type="checkbox" checked={smsNotif} onChange={e => setSmsNotif(e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--accent-primary)' }} />
              </label>
            </div>
          </div>

          <button type="submit" style={{ padding: '0.875rem 2rem', borderRadius: 12, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer' }} id="save-settings-btn">
            Lưu Cài Đặt
          </button>
        </form>
      </div>
    </UserLayout>
  );
};

export default SettingsPage;
