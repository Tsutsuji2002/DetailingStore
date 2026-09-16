import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiLoader, FiChevronUp, FiChevronDown, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchJobsThunk, createJobThunk, updateJobThunk, deleteJobThunk } from '@/features/jobsSlice';
import type { Job } from '@/types';

const LOCATION_OPTIONS = [
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Biên Hoà, Đồng Nai',
  'Bình Dương',
  'Cần Thơ',
  'Hải Phòng',
  'Huế',
  'Nờ Trang',
  'Vũng Tàu',
  'Khác / Thỏa thuận',
];

const SALARY_STEP = 500000;
const parseSalary = (val: string): number => {
  const n = parseInt(val.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? 0 : n;
};
const formatSalary = (n: number): string => n.toLocaleString('vi-VN') + '₫';

const RecruitmentEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: jobs, isLoading } = useAppSelector(s => s.jobs);

  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [reqText, setReqText] = useState('');
  const [benefitText, setBenefitText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<{ id: string; title: string } | null>(null);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(fetchJobsThunk(true)); // Fetch ALL (including inactive) for admin
  }, [dispatch]);

  const openNewModal = () => {
    setEditingJob({
      title: '',
      type: 'fulltime',
      salary: '',
      location: 'TP. Hồ Chí Minh',
      department: 'Kỹ Thuật & Detailing',
      description: '',
      requirements: [],
      benefits: [],
      isActive: true,
      deadline: '',
    });
    setReqText('');
    setBenefitText('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob({ ...job });
    setReqText((job.requirements || []).join('\n'));
    setBenefitText((job.benefits || []).join('\n'));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editingJob.title) return;
    setSaving(true);

    const jobToSave: Partial<Job> = {
      ...editingJob,
      requirements: reqText.split('\n').map(s => s.trim()).filter(Boolean),
      benefits: benefitText.split('\n').map(s => s.trim()).filter(Boolean),
    };

    try {
      const isExisting = jobs.some(j => j.id === jobToSave.id);
      if (isExisting && jobToSave.id) {
        await dispatch(updateJobThunk({ id: jobToSave.id, data: jobToSave })).unwrap();
        setSuccessMsg('Đã cập nhật vị trí tuyển dụng!');
      } else {
        await dispatch(createJobThunk(jobToSave)).unwrap();
        setSuccessMsg('Đã đăng vị trí tuyển dụng mới!');
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err: any) {
      setSuccessMsg('Lỗi: ' + (err || 'Không thể lưu.'));
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDeleteJob = async () => {
    if (!jobToDelete) return;
    await dispatch(deleteJobThunk(jobToDelete.id));
    setJobToDelete(null);
    setSuccessMsg('Đã xóa tin tuyển dụng.');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Tuyển Dụng & Chiêu Mộ Học Viên</h1>
          <p className="admin-page-sub">Đăng bài tuyển dụng thợ chính, thợ phụ & chiêu sinh khóa đào tạo nghề Detailing</p>
        </div>
        <button onClick={openNewModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="add-new-job-btn">
          <FiPlus /> Đăng Tin Tuyển Dụng
        </button>
      </div>

      {successMsg && (
        <div style={{ background: successMsg.startsWith('Lỗi') ? '#fee2e2' : '#dcfce7', color: successMsg.startsWith('Lỗi') ? '#b91c1c' : '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Toolbar: Search & Filters */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên vị trí, địa điểm..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả hình thức</option>
            <option value="fulltime">💼 Toàn thời gian</option>
            <option value="parttime">⏱️ Bán thời gian</option>
            <option value="apprentice">🎓 Học viên đào tạo nghề</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang Tuyển</option>
            <option value="closed">Đã Đóng</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}><FiLoader /> Đang tải...</div>
        ) : (
          (() => {
            const filtered = jobs.filter(j => {
              if (typeFilter !== 'all' && j.type !== typeFilter) return false;
              if (statusFilter === 'active' && !j.isActive) return false;
              if (statusFilter === 'closed' && j.isActive) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                return (
                  j.title.toLowerCase().includes(q) ||
                  (j.location || '').toLowerCase().includes(q) ||
                  (j.department || '').toLowerCase().includes(q) ||
                  (j.description || '').toLowerCase().includes(q)
                );
              }
              return true;
            });

            const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

            return (
              <>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Vị Trí Tuyển Dụng</th>
                      <th>Hình Thức</th>
                      <th>Mức Lương / Học Phí</th>
                      <th>Hạn Nộp Hồ Sơ</th>
                      <th>Trạng Thái</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          Không tìm thấy vị trí tuyển dụng phù hợp với bộ lọc.
                        </td>
                      </tr>
                    ) : (
                      paginated.map(j => (
                        <tr key={j.id}>
                          <td>
                            <strong>{j.title}</strong>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {j.location}</div>
                          </td>
                          <td>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 6, background: j.type === 'apprentice' ? '#fef3c7' : '#dbeafe', color: j.type === 'apprentice' ? '#b45309' : '#1d4ed8' }}>
                              {j.type === 'apprentice' ? 'Đào Tạo Nghề' : j.type === 'fulltime' ? 'Toàn Thời Gian' : 'Bán Thời Gian'}
                            </span>
                          </td>
                          <td><strong style={{ color: 'var(--accent-primary)' }}>{j.salary || '—'}</strong></td>
                          <td>{j.deadline || 'Vô thời hạn'}</td>
                          <td>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: j.isActive ? '#dcfce7' : '#fee2e2', color: j.isActive ? '#15803d' : '#b91c1c' }}>
                              {j.isActive ? 'Đang Tuyển' : 'Đã Đóng'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                              <button onClick={() => openEditModal(j)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                              <button onClick={() => setJobToDelete({ id: j.id, title: j.title })} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            );
          })()
        )}
      </div>

      {/* Pagination Controls */}
      {(() => {
        const filtered = jobs.filter(j => {
          if (typeFilter !== 'all' && j.type !== typeFilter) return false;
          if (statusFilter === 'active' && !j.isActive) return false;
          if (statusFilter === 'closed' && j.isActive) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return (
              j.title.toLowerCase().includes(q) ||
              (j.location || '').toLowerCase().includes(q) ||
              (j.department || '').toLowerCase().includes(q) ||
              (j.description || '').toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / pageSize) || 1}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
          />
        );
      })()}

      {/* Editor Modal */}
      {isModalOpen && editingJob && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {jobs.some(j => j.id === editingJob.id) ? 'Chỉnh Sửa Bài Tuyển Dụng' : 'Tạo Vị Trí Tuyển Dụng Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Vị Trí / Tiêu Đề *</label>
                  <input type="text" required value={editingJob.title || ''} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Loại Hình</label>
                  <select value={editingJob.type || 'fulltime'} onChange={e => setEditingJob({ ...editingJob, type: e.target.value as any })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="fulltime">💼 Toàn thời gian</option>
                    <option value="parttime">⏱️ Bán thời gian</option>
                    <option value="apprentice">🎓 Học viên đào tạo nghề</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Salary Stepper */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mức Lương / Học Phí</label>
                  <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-color)', borderRadius: 8, overflow: 'hidden' }}>
                    <input
                      type="text"
                      value={editingJob.salary || ''}
                      onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })}
                      placeholder="8.000.000₫"
                      style={{ flex: 1, padding: '0.625rem', border: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', minWidth: 0 }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--border-color)' }}>
                      <button type="button" title="+500.000₫" onClick={() => {
                        const cur = parseSalary(editingJob.salary || '0');
                        setEditingJob({ ...editingJob, salary: formatSalary(cur + SALARY_STEP) });
                      }} style={{ flex: 1, padding: '0 0.6rem', background: 'var(--bg-secondary)', border: 'none', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <FiChevronUp size={14}/>
                      </button>
                      <button type="button" title="-500.000₫" onClick={() => {
                        const cur = parseSalary(editingJob.salary || '0');
                        const next = Math.max(0, cur - SALARY_STEP);
                        setEditingJob({ ...editingJob, salary: formatSalary(next) });
                      }} style={{ flex: 1, padding: '0 0.6rem', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <FiChevronDown size={14}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Mỗi bước: 500.000₫ • Nhập tự do hoặc dùng nút mũi tên</div>
                </div>

                {/* Deadline Date Picker */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hạn Nộp Hồ Sơ</label>
                  <input
                    type="date"
                    value={editingJob.deadline && editingJob.deadline !== 'Vô thời hạn' ? editingJob.deadline : ''}
                    onChange={e => setEditingJob({ ...editingJob, deadline: e.target.value || 'Vô thời hạn' })}
                    style={{ width: '100%', padding: '0.55rem 0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <input type="checkbox"
                      checked={editingJob.deadline === 'Vô thời hạn' || !editingJob.deadline}
                      onChange={e => setEditingJob({ ...editingJob, deadline: e.target.checked ? 'Vô thời hạn' : '' })}
                    />
                    Vô thời hạn
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Location Dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Địa Điểm</label>
                  <select value={LOCATION_OPTIONS.includes(editingJob.location || '') ? editingJob.location : 'Khác / Thỏa thuận'}
                    onChange={e => setEditingJob({ ...editingJob, location: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {LOCATION_OPTIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Phòng Ban</label>
                  <input type="text" value={editingJob.department || ''} onChange={e => setEditingJob({ ...editingJob, department: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Công Việc</label>
                <textarea rows={3} value={editingJob.description || ''} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Yêu Cầu (Mỗi yêu cầu 1 dòng)</label>
                <textarea rows={3} value={reqText} onChange={e => setReqText(e.target.value)} placeholder="- Kinh nghiệm 1-2 năm..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Quyền Lợi & Chế Độ (Mỗi chế độ 1 dòng)</label>
                <textarea rows={3} value={benefitText} onChange={e => setBenefitText(e.target.value)} placeholder="- Lương thưởng theo doanh số..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={editingJob.isActive ?? true} onChange={e => setEditingJob({ ...editingJob, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                  Mở nhận hồ sơ ngay
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" disabled={saving} style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }} id="save-job-modal-btn">
                    {saving ? 'Đang lưu...' : 'Lưu Tin Tuyển Dụng'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Job Modal */}
      <ConfirmModal
        isOpen={!!jobToDelete}
        title="Xác nhận xóa vị trí tuyển dụng"
        message={jobToDelete ? `Bạn có chắc chắn muốn xóa vị trí "${jobToDelete.title}"?` : ''}
        confirmText="Xóa Bài Tuyển Dụng"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteJob}
        onCancel={() => setJobToDelete(null)}
      />
    </AdminLayout>
  );
};

export default RecruitmentEditPage;
