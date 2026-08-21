import React, { useState } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCalendar, FiUsers, FiCheckCircle, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { SAMPLE_SHIFTS, SAMPLE_USERS } from '@/data/sampleData';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const [shifts, setShifts] = useState(SAMPLE_SHIFTS);
  const [selectedDate, setSelectedDate] = useState('2024-08-14');
  const [staffId, setStaffId] = useState('u2');
  const [shiftType, setShiftType] = useState<'morning' | 'afternoon' | 'full'>('morning');
  const [notes, setNotes] = useState('');

  const staffUsers = SAMPLE_USERS.filter(u => u.role === 'staff' || u.role === 'admin');

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newS = {
      id: 'sh_' + Date.now(),
      staffId,
      date: selectedDate,
      shift: shiftType,
      notes: notes || undefined,
    };
    setShifts([newS, ...shifts]);
    setNotes('');
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Báo Cáo Tổng Quan & Quản Lý Lịch Trực</h1>
          <p className="admin-page-sub">Theo dõi thu chi, doanh thu dịch vụ & xếp lịch làm việc cho thợ</p>
        </div>
      </div>

      {/* Financial Overview Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-income">
          <div className="sc-header">
            <span>Doanh Thu Tháng Này</span>
            <span className="sc-icon"><FiDollarSign /></span>
          </div>
          <div className="sc-value">128.500.000₫</div>
          <div className="sc-sub positive"><FiTrendingUp /> +14.2% so với tháng trước</div>
        </div>

        <div className="stat-card stat-outcome">
          <div className="sc-header">
            <span>Chi Phí Nhập Hàng / Vật Tư</span>
            <span className="sc-icon"><FiTrendingDown /></span>
          </div>
          <div className="sc-value">42.200.000₫</div>
          <div className="sc-sub negative"><FiTrendingDown /> -3.5% tiết kiệm chi phí</div>
        </div>

        <div className="stat-card stat-profit">
          <div className="sc-header">
            <span>Lợi Nhuận Ròng (Net Profit)</span>
            <span className="sc-icon">📈</span>
          </div>
          <div className="sc-value">86.300.000₫</div>
          <div className="sc-sub positive"><FiTrendingUp /> Tỷ lệ lợi nhuận ~67.1%</div>
        </div>

        <div className="stat-card stat-jobs">
          <div className="sc-header">
            <span>Lượt Xe Detailing / Sửa Chữa</span>
            <span className="sc-icon"><FiCheckCircle /></span>
          </div>
          <div className="sc-value">142 Lượt</div>
          <div className="sc-sub neutral">Đánh giá trung bình: 4.9★</div>
        </div>
      </div>

      {/* Main 2-Col Grid */}
      <div className="dashboard-content-grid">
        {/* Income Chart / Recent Activity */}
        <div className="dashboard-card">
          <h3 className="card-title">📊 Doanh Thu Theo Tuần (VND)</h3>
          <div className="bar-chart-mock">
            {[
              { day: 'T2', val: 18.5, height: '65%' },
              { day: 'T3', val: 22.0, height: '78%' },
              { day: 'T4', val: 15.0, height: '52%' },
              { day: 'T5', val: 28.5, height: '95%' },
              { day: 'T6', val: 24.0, height: '84%' },
              { day: 'T7', val: 32.0, height: '100%' },
              { day: 'CN', val: 29.0, height: '90%' },
            ].map(b => (
              <div key={b.day} className="chart-bar-col">
                <span className="bar-val">{b.val}M</span>
                <div className="bar-fill" style={{ height: b.height }} />
                <span className="bar-label">{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Editor Widget */}
        <div className="dashboard-card">
          <h3 className="card-title"><FiCalendar /> Phân Ca Làm Việc Cho Kỹ Thuật Viên</h3>

          {/* Quick add shift form */}
          <form onSubmit={handleAddShift} className="add-shift-form">
            <div className="form-row-2">
              <div>
                <label>Chọn Nhân Viên</label>
                <select value={staffId} onChange={e => setStaffId(e.target.value)}>
                  {staffUsers.map(u => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label>Ngày Làm Việc</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} required />
              </div>
            </div>

            <div className="form-row-2">
              <div>
                <label>Ca Trực</label>
                <select value={shiftType} onChange={e => setShiftType(e.target.value as any)}>
                  <option value="morning">🌅 Ca Sáng (07:30 – 12:00)</option>
                  <option value="afternoon">🌆 Ca Chiều (13:00 – 18:30)</option>
                  <option value="full">☀️ Ca Cả Ngày (07:30 – 18:30)</option>
                </select>
              </div>
              <div>
                <label>Ghi chú công việc</label>
                <input type="text" placeholder="Phụ trách khoang sơn, nhận xe VIP..." value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn-add-shift">
              <FiPlus /> Thêm Ca Làm Việc
            </button>
          </form>

          {/* Shift Table */}
          <div className="shift-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nhân Viên</th>
                  <th>Ngày</th>
                  <th>Ca làm</th>
                  <th>Ghi chú</th>
                  <th>Xóa</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map(s => {
                  const u = SAMPLE_USERS.find(user => user.id === s.staffId);
                  return (
                    <tr key={s.id}>
                      <td><strong>{u?.fullName || s.staffId}</strong></td>
                      <td>{s.date}</td>
                      <td>
                        <span className={`shift-tag shift-${s.shift}`}>
                          {s.shift === 'morning' ? 'Ca Sáng' : s.shift === 'afternoon' ? 'Ca Chiều' : 'Cả Ngày'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                      <td>
                        <button onClick={() => handleDeleteShift(s.id)} className="btn-del-icon"><FiTrash2 /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
