import React, { useState } from 'react';
import { FiCalendar, FiClock, FiCheckCircle } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import { useAppSelector } from '@/hooks/useAppStore';
import { SAMPLE_SHIFTS } from '@/data/sampleData';

interface VehicleJob {
  id: string;
  licensePlate: string;
  customerName: string;
  vehicleModel: string;
  serviceName: string;
  status: 'pending' | 'in_progress' | 'completed';
  notes?: string;
}

const INITIAL_JOBS: VehicleJob[] = [
  {
    id: 'vj1',
    licensePlate: '59-X3 888.88',
    customerName: 'Trần Văn Khang',
    vehicleModel: 'Honda SH 150i ABS',
    serviceName: 'Detailing Toàn Diện Premium',
    status: 'in_progress',
    notes: 'Khách yêu cầu chăm sóc kỹ dàn nhựa nhám & mâm',
  },
  {
    id: 'vj2',
    licensePlate: '59-K1 678.90',
    customerName: 'Lê Hoàng Nam',
    vehicleModel: 'Yamaha Exciter 155 VVA',
    serviceName: 'Sửa Chữa Động Cơ & Khắc Phục Mã Lỗi',
    status: 'pending',
    notes: 'Kiểm tra van biến thiên VVA & thay bugi',
  },
  {
    id: 'vj3',
    licensePlate: '59-U1 123.45',
    customerName: 'Phạm Minh Tuấn',
    vehicleModel: 'Vespa GTS Super 300',
    serviceName: 'Phủ Nano Ceramic 9H Body',
    status: 'completed',
    notes: 'Đã hoàn tất bàn giao cho khách lúc 10h30',
  },
];

const StaffSchedulePage: React.FC = () => {
  const { user } = useAppSelector(s => s.auth);
  const myShifts = SAMPLE_SHIFTS.filter(s => s.staffId === (user?.id || 'u2') || s.staffId === 'u2');

  const [assignedJobs, setAssignedJobs] = useState<VehicleJob[]>(INITIAL_JOBS);

  const toggleJobStatus = (id: string) => {
    setAssignedJobs(assignedJobs.map(j => {
      if (j.id === id) {
        const next: VehicleJob['status'] = j.status === 'pending' ? 'in_progress' : j.status === 'in_progress' ? 'completed' : 'pending';
        return { ...j, status: next };
      }
      return j;
    }));
  };

  return (
    <StaffLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Chào {user?.fullName || 'Anh Em Kỹ Thuật'} 🛠️</h1>
          <p className="admin-page-sub">Xem ca làm việc hôm nay & danh sách xe được phân công tiếp nhận</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Shifts List */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCalendar /> Ca Làm Việc Được Phân Công
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {myShifts.map(s => (
              <div key={s.id} style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>📅 Ngày: {s.date}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '0.2rem' }}>
                    <FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />
                    {s.shift === 'morning' ? 'Ca Sáng (07:30 – 12:00)' : s.shift === 'afternoon' ? 'Ca Chiều (13:00 – 18:30)' : 'Ca Cả Ngày (07:30 – 18:30)'}
                  </div>
                  {s.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>💡 {s.notes}</div>}
                </div>
                <span className={`shift-tag shift-${s.shift}`}>
                  {s.shift === 'morning' ? 'Ca Sáng' : s.shift === 'afternoon' ? 'Ca Chiều' : 'Cả Ngày'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Assignment checklist */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCheckCircle /> Xe Cần Làm Hôm Nay ({assignedJobs.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignedJobs.map(j => (
              <div key={j.id} style={{ padding: '1rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', background: 'var(--accent-light)', padding: '0.15em 0.5em', borderRadius: 6, marginRight: 6 }}>
                      {j.licensePlate}
                    </span>
                    <strong style={{ fontSize: '0.95rem' }}>{j.customerName} ({j.vehicleModel})</strong>
                  </div>
                  <button
                    onClick={() => toggleJobStatus(j.id)}
                    style={{
                      padding: '0.25rem 0.65rem',
                      borderRadius: 9999,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      background: j.status === 'completed' ? '#dcfce7' : j.status === 'in_progress' ? '#fef3c7' : '#fee2e2',
                      color: j.status === 'completed' ? '#15803d' : j.status === 'in_progress' ? '#b45309' : '#b91c1c',
                    }}>
                    {j.status === 'completed' ? '✓ Đã Xong' : j.status === 'in_progress' ? '⚡ Đang Làm' : '⏳ Chờ Nhận Xe'}
                  </button>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  🔧 Dịch vụ: <strong>{j.serviceName}</strong>
                </div>

                {j.notes && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '0.4rem 0.6rem', borderRadius: 6 }}>📝 {j.notes}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffSchedulePage;
