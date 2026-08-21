import React, { useState } from 'react';
import { FiPlus, FiCalendar, FiUser, FiClock, FiTrash2, FiCheck, FiFilter } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { SAMPLE_SHIFTS, SAMPLE_USERS } from '@/data/sampleData';
import type { WorkShift } from '@/types';

const ScheduleEditPage: React.FC = () => {
  const [shifts, setShifts] = useState<WorkShift[]>(SAMPLE_SHIFTS);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState('2024-08-14');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'full'>('morning');
  const [notes, setNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const staffList = SAMPLE_USERS.filter(u => u.role === 'staff' || u.role === 'admin');

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff === 'all') return;

    const newS: WorkShift = {
      id: 'sh_' + Date.now(),
      staffId: selectedStaff,
      date: selectedDate,
      shift: shiftType,
      notes: notes || undefined,
    };
    setShifts([newS, ...shifts]);
    setNotes('');
    setSuccessMsg('Đã thêm ca làm việc cho nhân viên!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
    setSuccessMsg('Đã xóa ca làm việc.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const filteredShifts = shifts.filter(s => {
    if (selectedStaff !== 'all' && s.staffId !== selectedStaff) return false;
    return true;
  });

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Lịch Phân Ca Kỹ Thuật Viên</h1>
          <p className="admin-page-sub">Xếp ca sáng/chiều/cả ngày cho thợ sửa chữa & kỹ thuật viên detailing</p>
        </div>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Form Panel */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiPlus /> Phân Ca Trực Mới
          </h3>
          <form onSubmit={handleAddShift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Chọn Kỹ Thuật Viên *</label>
              <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} required style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="all" disabled>-- Chọn nhân viên --</option>
                {staffList.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ngày Trực *</label>
              <input type="date" required value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ca Làm Việc</label>
              <select value={shiftType} onChange={e => setShiftType(e.target.value as any)} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="morning">🌅 Ca Sáng (07:30 – 12:00)</option>
                <option value="afternoon">🌆 Ca Chiều (13:00 – 18:30)</option>
                <option value="full">☀️ Ca Cả Ngày (07:30 – 18:30)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ghi Chú Công Việc</label>
              <input type="text" placeholder="Trực bàn nâng số 1, bảo dưỡng xe VIP..." value={notes} onChange={e => setNotes(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>

            <button type="submit" style={{ padding: '0.75rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }} id="add-schedule-shift-btn">
              Xác Nhận Phân Ca
            </button>
          </form>
        </div>

        {/* Schedule List */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiCalendar /> Bảng Lịch Trực Hàng Tuần ({filteredShifts.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter style={{ color: 'var(--text-muted)' }} />
              <select value={selectedStaff} onChange={e => setSelectedStaff(e.target.value)} style={{ padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <option value="all">Tất cả nhân viên</option>
                {staffList.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
              </select>
            </div>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>Nhân Viên</th>
                <th>Ngày</th>
                <th>Ca Trực</th>
                <th>Thời Gian Thật</th>
                <th>Ghi Chú</th>
                <th>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.map(s => {
                const u = SAMPLE_USERS.find(user => user.id === s.staffId);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src={u?.avatar || 'https://i.pravatar.cc/100'} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                        <div>
                          <strong>{u?.fullName || s.staffId}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u?.role}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{s.date}</strong></td>
                    <td>
                      <span className={`shift-tag shift-${s.shift}`}>
                        {s.shift === 'morning' ? 'Ca Sáng' : s.shift === 'afternoon' ? 'Ca Chiều' : 'Ca Cả Ngày'}
                      </span>
                    </td>
                    <td><FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />{s.shift === 'morning' ? '07:30 – 12:00' : s.shift === 'afternoon' ? '13:00 – 18:30' : '07:30 – 18:30'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                    <td>
                      <button onClick={() => handleDelete(s.id)} className="btn-del-icon"><FiTrash2 /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ScheduleEditPage;
