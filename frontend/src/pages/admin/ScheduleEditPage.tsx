import React, { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiCalendar, FiTrash2, FiCheck, FiFilter, FiSettings, FiEdit2, FiX, FiTruck, FiUser, FiTool, FiAlertCircle } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchShiftConfigsThunk,
  fetchAssignedShiftsThunk,
  createShiftConfigThunk,
  updateShiftConfigThunk,
  deleteShiftConfigThunk,
  assignShiftThunk,
  deleteAssignedShiftThunk,
} from '@/features/workShiftsSlice';
import { fetchStaffUsersThunk } from '@/features/usersSlice';
import { fetchServicesThunk } from '@/features/servicesSlice';
import {
  fetchBookingsThunk,
  createBookingThunk,
  updateBookingStatusThunk,
  deleteBookingThunk,
} from '@/features/bookingsSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import TimeSlotPicker, { TIME_PRESETS } from '@/components/ui/TimeSlotPicker';
import type { TimePresetKey } from '@/components/ui/TimeSlotPicker';
import AvailableStaffSelector from '@/components/ui/AvailableStaffSelector';
import type { WorkShiftConfig, ServiceBooking } from '@/types';
import './ScheduleEditPage.css';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const ScheduleEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { configs, shifts, isLoading } = useAppSelector((s) => s.workShifts);
  const { staffUsers } = useAppSelector((s) => s.users);
  const { items: bookings, loading: bookingsLoading } = useAppSelector((s) => s.bookings);
  const { items: serviceList } = useAppSelector((s) => s.services);

  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string>('morning');
  const [notes, setNotes] = useState('');

  const [toastMsg, setToastMsg] = useState<ToastState | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Modal State for Customizing "Ca Làm Việc"
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<{
    id?: string;
    name: string;
    startTime: string;
    endTime: string;
    icon: string;
    color: string;
  }>({
    name: '',
    startTime: '07:30',
    endTime: '12:00',
    icon: '🌅',
    color: '#3b82f6',
  });

  // Modal State for Adding Vehicle Booking
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<{
    licensePlate: string;
    vehicleModel: string;
    customerName: string;
    customerPhone: string;
    serviceId: string;
    notes: string;
    totalPrice: number;
    bookingDate: string;
  }>({
    licensePlate: '',
    vehicleModel: '',
    customerName: '',
    customerPhone: '',
    serviceId: '',
    notes: '',
    totalPrice: 500000,
    bookingDate: selectedDate,
  });

  const [bookingPreset, setBookingPreset] = useState<string>('morning');
  const [bookingCustomStart, setBookingCustomStart] = useState<string>('');
  const [bookingCustomEnd, setBookingCustomEnd] = useState<string>('');
  const [bookingStartTime, setBookingStartTime] = useState<string>('');
  const [bookingEndTime, setBookingEndTime] = useState<string>('');
  const [bookingAssignedStaffIds, setBookingAssignedStaffIds] = useState<string[]>([]);

  useEffect(() => {
    if (bookingForm.bookingDate && bookingPreset !== 'custom') {
      const preset = TIME_PRESETS[bookingPreset as TimePresetKey];
      if (preset?.start && preset?.end) {
        setBookingStartTime(`${bookingForm.bookingDate}T${preset.start}:00`);
        setBookingEndTime(`${bookingForm.bookingDate}T${preset.end}:00`);
      }
    }
  }, [bookingForm.bookingDate]);

  const staffList = staffUsers;

  useEffect(() => {
    dispatch(fetchShiftConfigsThunk(true));
    dispatch(fetchAssignedShiftsThunk());
    dispatch(fetchStaffUsersThunk());
    dispatch(fetchBookingsThunk());
    dispatch(fetchServicesThunk());
  }, [dispatch]);

  useEffect(() => {
    if (configs.length > 0 && !configs.some((c) => c.id === selectedShiftTypeId)) {
      setSelectedShiftTypeId(configs[0].id);
    }
  }, [configs, selectedShiftTypeId]);

  const handleAddShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStaff === 'all') {
      showToast('Vui lòng chọn kỹ thuật viên!', 'error');
      return;
    }

    try {
      await dispatch(
        assignShiftThunk({
          staffId: selectedStaff,
          shiftTypeId: selectedShiftTypeId,
          date: selectedDate,
          notes: notes || undefined,
        })
      ).unwrap();

      setNotes('');
      showToast('Đã thêm ca làm việc cho nhân viên thành công!');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Không thể thêm ca làm việc.', 'error');
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return;
    try {
      await dispatch(deleteAssignedShiftThunk(id)).unwrap();
      showToast('Đã xóa ca làm việc.');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Lỗi khi xóa ca làm việc.', 'error');
    }
  };

  // Booking Actions
  const handleCreateBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.licensePlate || !bookingForm.customerName) {
      showToast('Vui lòng nhập biển số xe và tên khách hàng!', 'error');
      return;
    }

    try {
      await dispatch(
        createBookingThunk({
          licensePlate: bookingForm.licensePlate,
          vehicleModel: bookingForm.vehicleModel || 'Xe máy',
          customerName: bookingForm.customerName,
          customerPhone: bookingForm.customerPhone || undefined,
          serviceId: bookingForm.serviceId || undefined,
          assignedStaffId: bookingAssignedStaffIds[0] || undefined,
          notes: bookingForm.notes || undefined,
          totalPrice: Number(bookingForm.totalPrice) || 0,
          bookingDate: selectedDate,
          status: 'Pending',
        })
      ).unwrap();

      setIsBookingModalOpen(false);
      setBookingForm({
        licensePlate: '',
        vehicleModel: '',
        customerName: '',
        customerPhone: '',
        serviceId: '',
        notes: '',
        totalPrice: 500000,
        bookingDate: selectedDate,
      });
      setBookingPreset('morning');
      setBookingCustomStart('');
      setBookingCustomEnd('');
      setBookingStartTime('');
      setBookingEndTime('');
      setBookingAssignedStaffIds([]);
      showToast('Đã tạo lịch tiếp nhận xe thành công!');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Không thể tạo lịch xe.', 'error');
    }
  };

  const handleToggleBookingStatus = async (id: string, currentStatus: string) => {
    const statusMap: Record<string, string> = {
      Pending: 'InProgress',
      pending: 'InProgress',
      Confirmed: 'InProgress',
      InProgress: 'Completed',
      in_progress: 'Completed',
      Completed: 'Pending',
      completed: 'Pending',
    };
    const next = statusMap[currentStatus] || 'InProgress';
    try {
      await dispatch(updateBookingStatusThunk({ id, status: next })).unwrap();
      showToast('Đã cập nhật trạng thái lịch xe!');
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  const handleDeleteBooking = async (id: string, plate: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch xe biển số ${plate}?`)) return;
    try {
      await dispatch(deleteBookingThunk(id)).unwrap();
      showToast(`Đã xóa lịch xe ${plate}.`);
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Lỗi khi xóa lịch xe', 'error');
    }
  };

  // Config Shift Actions
  const handleOpenNewConfig = () => {
    setEditingConfigId(null);
    setConfigForm({
      name: '',
      startTime: '08:00',
      endTime: '17:00',
      icon: '⏰',
      color: '#10b981',
    });
    setIsConfigModalOpen(true);
  };

  const handleEditConfig = (cfg: WorkShiftConfig) => {
    setEditingConfigId(cfg.id);
    setConfigForm({
      id: cfg.id,
      name: cfg.name,
      startTime: cfg.startTime,
      endTime: cfg.endTime,
      icon: cfg.icon || '⏰',
      color: cfg.color || '#3b82f6',
    });
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configForm.name.trim()) return;

    try {
      if (editingConfigId) {
        await dispatch(
          updateShiftConfigThunk({
            id: editingConfigId,
            data: {
              name: configForm.name,
              startTime: configForm.startTime,
              endTime: configForm.endTime,
              icon: configForm.icon,
              color: configForm.color,
            },
          })
        ).unwrap();
        showToast(`Đã cập nhật ca "${configForm.name}" thành công!`);
      } else {
        await dispatch(
          createShiftConfigThunk({
            name: configForm.name,
            startTime: configForm.startTime,
            endTime: configForm.endTime,
            icon: configForm.icon,
            color: configForm.color,
          })
        ).unwrap();
        showToast(`Đã tạo ca mới "${configForm.name}" thành công!`);
      }

      setIsConfigModalOpen(false);
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Không thể lưu cấu hình ca.', 'error');
    }
  };

  const handleDeleteConfig = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ca làm việc "${name}"?`)) return;
    try {
      await dispatch(deleteShiftConfigThunk(id)).unwrap();
      showToast(`Đã xóa ca "${name}".`);
    } catch (err: any) {
      showToast(typeof err === 'string' ? err : err?.message || 'Không thể xóa ca làm việc.', 'error');
    }
  };

  const filteredShifts = shifts.filter((s) => {
    if (selectedStaff !== 'all' && s.staffId !== selectedStaff) return false;
    return true;
  });

  return (
    <AdminLayout>
      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 99999,
            background: toastMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
            color: toastMsg.type === 'error' ? '#991b1b' : '#15803d',
            border: `1px solid ${toastMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
            padding: '0.85rem 1.35rem',
            borderRadius: '14px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            fontSize: '0.925rem',
          }}>
          {toastMsg.type === 'error' ? <FiAlertCircle style={{ fontSize: '1.2rem' }} /> : <FiCheck style={{ fontSize: '1.2rem' }} />}
          {toastMsg.text}
        </div>
      )}
      <div className="schedule-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Lịch Phân Ca & Tiếp Nhận Xe</h1>
          <p className="admin-page-sub">Xếp ca linh hoạt, phân công thợ & theo dõi tiến độ tiếp nhận làm xe hàng ngày</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleOpenNewConfig}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1.15rem',
              borderRadius: 10,
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}>
            <FiSettings style={{ color: 'var(--accent-primary)' }} /> Tùy Chỉnh Ca
          </button>
        </div>
      </div>

      {/* Vehicle Work Orders Section */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTruck style={{ color: 'var(--accent-primary)' }} /> Lịch Xe Cần Làm Trong Ngày ({bookings.length})
          </h3>
          <button
            onClick={() => setIsBookingModalOpen(true)}
            style={{ padding: '0.4rem 0.85rem', borderRadius: 8, background: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
            + Nhận Xe Mới
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Biển Số & Loại Xe</th>
                <th>Khách Hàng</th>
                <th>Kỹ Thuật Viên Phụ Trách</th>
                <th>Thời Hạn / Giờ Trả</th>
                <th>Trạng Thái</th>
                <th>Ghi Chú</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {bookingsLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Đang tải danh sách lịch xe...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Chưa có lịch tiếp nhận xe nào. Bấm nút "+ Nhận Xe Mới" để khởi tạo.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const s = String(b.status).toLowerCase();
                  const isDone = s === 'completed' || s === 'đã xong';
                  const isInProg = s === 'inprogress' || s === 'in_progress' || s === 'đang làm';

                  return (
                    <tr key={b.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-primary)', background: 'var(--accent-light)', padding: '0.2em 0.5em', borderRadius: 6 }}>
                            {b.licensePlate}
                          </span>
                          <strong style={{ fontSize: '0.9rem' }}>{b.vehicleModel}</strong>
                        </div>
                      </td>
                      <td>
                        <strong>{b.customerName}</strong>
                        {b.customerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📞 {b.customerPhone}</div>}
                      </td>
                      <td>
                        {b.assignedStaffName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <UserAvatar src={b.assignedStaffAvatar} name={b.assignedStaffName} size={26} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.assignedStaffName}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>Chưa phân công</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: 6, border: '1px solid var(--border-color)' }}>
                          ⏱️ {b.estimatedCompletion || 'Theo lịch phân ca'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleToggleBookingStatus(b.id, b.status)}
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: 9999,
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            background: isDone ? '#dcfce7' : isInProg ? '#fef3c7' : '#fee2e2',
                            color: isDone ? '#15803d' : isInProg ? '#b45309' : '#b91c1c',
                          }}
                          title="Bấm để đổi trạng thái">
                          {isDone ? '✓ Đã Xong' : isInProg ? '⚡ Đang Làm' : '⏳ Chờ Nhận Xe'}
                        </button>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{b.notes || '—'}</td>
                      <td>
                        <button onClick={() => handleDeleteBooking(b.id, b.licensePlate)} className="btn-del-icon" title="Xóa lịch xe">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="schedule-page-grid">
        {/* Form Panel */}
        <div className="schedule-form-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiPlus /> Phân Ca Trực Mới
          </h3>
          <form onSubmit={handleAddShift} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Chọn Kỹ Thuật Viên *
              </label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                <option value="all" disabled>
                  -- Chọn nhân viên --
                </option>
                {staffList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ngày Trực *</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Ca Làm Việc</label>
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                  ⚙️ Q.Lý Ca
                </button>
              </div>
              <select
                value={selectedShiftTypeId}
                onChange={(e) => setSelectedShiftTypeId(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                {configs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon || '⏰'} {c.name} ({c.startTime} – {c.endTime})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Ghi Chú Công Việc</label>
              <input
                type="text"
                placeholder="Trực bàn nâng số 1, bảo dưỡng xe VIP..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem',
                borderRadius: 10,
                background: 'var(--accent-gradient)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: 'none',
                cursor: 'pointer',
                marginTop: '0.5rem',
                opacity: isLoading ? 0.7 : 1,
              }}
              id="add-schedule-shift-btn">
              {isLoading ? 'Đang Xử Lý...' : 'Xác Nhận Phân Ca'}
            </button>
          </form>
        </div>

        {/* Schedule List */}
        <div className="schedule-list-card">
          <div className="schedule-list-header">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FiCalendar /> Bảng Lịch Trực Hàng Tuần ({filteredShifts.length})
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter style={{ color: 'var(--text-muted)' }} />
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                style={{ padding: '0.4rem 0.6rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                <option value="all">Tất cả nhân viên</option>
                {staffList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="shift-table-wrap">
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
                {filteredShifts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Chưa có ca trực nào được phân công.
                    </td>
                  </tr>
                ) : (
                  filteredShifts.map((s) => {
                    const u = staffUsers.find((user) => user.id === s.staffId);
                    const cfg = configs.find((c) => c.id === s.shiftTypeId);

                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <UserAvatar src={u?.avatar || u?.avatarUrl} name={u?.fullName || u?.username} size={32} />
                            <div>
                              <strong>{u?.fullName || s.staffId}</strong>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u?.role || 'Kỹ Thuật Viên'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{s.date}</strong>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.25rem 0.65rem',
                              borderRadius: 9999,
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              background: cfg?.color ? `${cfg.color}18` : 'var(--bg-secondary)',
                              color: cfg?.color || 'var(--text-primary)',
                              border: `1px solid ${cfg?.color || 'var(--border-color)'}`,
                            }}>
                            {cfg?.name || s.shiftTypeId}
                          </span>
                        </td>
                        <td>
                          {cfg ? `${cfg.startTime} – ${cfg.endTime}` : '07:30 – 18:30'}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.notes || '—'}</td>
                        <td>
                          <button onClick={() => handleDeleteShift(s.id)} className="btn-del-icon" title="Xóa ca trực">
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Add Vehicle Booking */}
      {isBookingModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}>
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              width: '100%',
              maxWidth: 520,
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🚘 Thêm Lịch Tiếp Nhận Xe Mới
              </h2>
              <button
                onClick={() => {
                  setIsBookingModalOpen(false);
                  setBookingPreset('morning');
                  setBookingCustomStart('');
                  setBookingCustomEnd('');
                  setBookingStartTime('');
                  setBookingEndTime('');
                  setBookingAssignedStaffIds([]);
                  setBookingForm(f => ({ ...f, bookingDate: selectedDate }));
                }}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleCreateBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Biển Số Xe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="59-X3 888.88"
                    value={bookingForm.licensePlate}
                    onChange={(e) => setBookingForm({ ...bookingForm, licensePlate: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Tên / Dòng Xe *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Honda SH 150i"
                    value={bookingForm.vehicleModel}
                    onChange={(e) => setBookingForm({ ...bookingForm, vehicleModel: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Tên Khách Hàng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerName: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="0901234567"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm({ ...bookingForm, customerPhone: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  📅 Ngày Nhận Xe *
                </label>
                <input
                  type="date"
                  required
                  value={bookingForm.bookingDate}
                  onChange={(e) => {
                  setBookingForm({ ...bookingForm, bookingDate: e.target.value });
                  setBookingStartTime('');
                  setBookingEndTime('');
                  setBookingAssignedStaffIds([]);
                }}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Time Slot Picker */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  ⏰ Khung Giờ Nhận Xe
                </label>
                <TimeSlotPicker
                  date={bookingForm.bookingDate}
                  selectedPreset={bookingPreset}
                  onPresetChange={(preset) => {
                    setBookingPreset(preset);
                    if (preset !== 'custom') {
                      setBookingStartTime('');
                      setBookingEndTime('');
                    }
                    setBookingAssignedStaffIds([]);
                  }}
                  customStartTime={bookingCustomStart}
                  customEndTime={bookingCustomEnd}
                  onCustomTimeChange={(s, e) => { setBookingCustomStart(s); setBookingCustomEnd(e); }}
                  onTimeChange={(s, e) => { setBookingStartTime(s); setBookingEndTime(e); }}
                />
              </div>

              {/* Available Staff Selector — only shown when time is resolved */}
              {bookingStartTime && bookingEndTime && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    👷 Phân Công Thợ / Kỹ Thuật Viên
                  </label>
                  <AvailableStaffSelector
                    scheduledStartTime={bookingStartTime}
                    scheduledEndTime={bookingEndTime}
                    selectedStaffIds={bookingAssignedStaffIds}
                    onSelectionChange={setBookingAssignedStaffIds}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  Ghi Chú Yêu Cầu Của Khách
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú công việc..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsBookingModalOpen(false);
                    setBookingPreset('morning');
                    setBookingCustomStart('');
                    setBookingCustomEnd('');
                    setBookingStartTime('');
                    setBookingEndTime('');
                    setBookingAssignedStaffIds([]);
                    setBookingForm(f => ({ ...f, bookingDate: selectedDate }));
                  }}
                  style={{ padding: '0.55rem 1rem', borderRadius: 8, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.55rem 1.25rem',
                    borderRadius: 8,
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                  Xác Nhận Tạo Lịch Xe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Customize "Ca Làm Việc" */}
      {isConfigModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}>
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 20,
              border: '1px solid var(--border-color)',
              width: '100%',
              maxWidth: 580,
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚙️ Q.Lý & Tùy Chỉnh Ca Làm Việc
              </h2>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <FiX />
              </button>
            </div>

            {/* List of existing shift configs */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                Danh Sách Ca Đã Cấu Hình ({configs.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 180, overflowY: 'auto', paddingRight: '0.2rem' }}>
                {configs.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '0.6rem 0.8rem',
                      borderRadius: 10,
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{c.icon || '⏰'}</span>
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{c.name}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          ⏰ {c.startTime} – {c.endTime}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => handleEditConfig(c)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', padding: '0.3rem' }}
                        title="Sửa ca làm việc">
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDeleteConfig(c.id, c.name)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.3rem' }}
                        title="Xóa ca làm việc">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add / Edit Form */}
            <form onSubmit={handleSaveConfig} style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 14, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                {editingConfigId ? `✏️ Cập Nhật Ca: ${configForm.name}` : '➕ Thêm Ca Làm Việc Mới'}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                    Tên Ca Làm Việc *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ca Sáng, Ca Đêm Tăng Ca..."
                    value={configForm.name}
                    onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Giờ Bắt Đầu *</label>
                  <input
                    type="time"
                    required
                    value={configForm.startTime}
                    onChange={(e) => setConfigForm({ ...configForm, startTime: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Giờ Kết Thúc *</label>
                  <input
                    type="time"
                    required
                    value={configForm.endTime}
                    onChange={(e) => setConfigForm({ ...configForm, endTime: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Icon Biểu Tượng</label>
                  <input
                    type="text"
                    value={configForm.icon}
                    onChange={(e) => setConfigForm({ ...configForm, icon: e.target.value })}
                    placeholder="🌅, 🌆, 🌙, ☀️"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>Màu Sắc Nhãn</label>
                  <input
                    type="color"
                    value={configForm.color}
                    onChange={(e) => setConfigForm({ ...configForm, color: e.target.value })}
                    style={{ width: '100%', height: 38, padding: '0.2rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                {editingConfigId && (
                  <button
                    type="button"
                    onClick={handleOpenNewConfig}
                    style={{ padding: '0.5rem 0.9rem', borderRadius: 8, background: 'none', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.825rem' }}>
                    Hủy Sửa
                  </button>
                )}
                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1.25rem',
                    borderRadius: 8,
                    background: 'var(--accent-gradient)',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    border: 'none',
                    cursor: 'pointer',
                  }}>
                  {editingConfigId ? 'Cập Nhật Ca' : 'Lưu Ca Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ScheduleEditPage;
