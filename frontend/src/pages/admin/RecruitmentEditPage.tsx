import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { SAMPLE_JOBS } from '@/data/sampleData';
import type { JobPosition } from '@/types';

const RecruitmentEditPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosition[]>(SAMPLE_JOBS);
  const [editingJob, setEditingJob] = useState<Partial<JobPosition> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openNewModal = () => {
    setEditingJob({
      id: 'job_' + Date.now(),
      title: '',
      type: 'fulltime',
      salary: '10.000.000₫ – 15.000.000₫',
      location: 'Quận 10, TP.HCM',
      description: 'Mô tả công việc...',
      requirements: ['Có kinh nghiệm 1-2 năm', 'Tự giác, cẩn thận'],
      benefits: ['Thưởng doanh số hàng tháng', 'Bao cơm trưa'],
      isActive: true,
      deadline: '2024-09-30',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobPosition) => {
    setEditingJob({ ...job });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !editingJob.title) return;

    const finalJob = { ...editingJob } as JobPosition;
    const exists = jobs.some(j => j.id === finalJob.id);
    if (exists) {
      setJobs(jobs.map(j => (j.id === finalJob.id ? finalJob : j)));
      setSuccessMsg('Đã cập nhật vị trí tuyển dụng!');
    } else {
      setJobs([finalJob, ...jobs]);
      setSuccessMsg('Đã đăng vị trí tuyển dụng mới!');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài tuyển dụng này?')) {
      setJobs(jobs.filter(j => j.id !== id));
      setSuccessMsg('Đã xóa tin tuyển dụng.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
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
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
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
            {jobs.map(j => (
              <tr key={j.id}>
                <td>
                  <strong>{j.title}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>📍 {j.location}</div>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 6, background: j.type === 'apprentice' ? '#fef3c7' : '#dbeafe', color: j.type === 'apprentice' ? '#b45309' : '#1d4ed8' }}>
                    {j.type === 'apprentice' ? '🎓 Đào Tạo Nghề' : j.type === 'fulltime' ? '💼 Toàn Thời Gian' : '⏱️ Bán Thời Gian'}
                  </span>
                </td>
                <td><strong style={{ color: 'var(--accent-primary)' }}>{j.salary}</strong></td>
                <td>{j.deadline || 'Vô thời hạn'}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: j.isActive ? '#dcfce7' : '#fee2e2', color: j.isActive ? '#15803d' : '#b91c1c' }}>
                    {j.isActive ? 'Đang Tuyển' : 'Đã Đóng'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => openEditModal(j)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                    <button onClick={() => handleDelete(j.id)} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mức Lương / Học Phí</label>
                  <input type="text" value={editingJob.salary || ''} onChange={e => setEditingJob({ ...editingJob, salary: e.target.value })} placeholder="12.000.000₫ / tháng..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hạn Nộp Hồ Sơ</label>
                  <input type="date" value={editingJob.deadline || ''} onChange={e => setEditingJob({ ...editingJob, deadline: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Công Việc</label>
                <textarea rows={3} value={editingJob.description || ''} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Yêu Cầu (Mỗi yêu cầu 1 dòng)</label>
                <textarea rows={3} value={(editingJob.requirements || []).join('\n')} onChange={e => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n').filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Quyền Lợi & Chế Độ (Mỗi chế độ 1 dòng)</label>
                <textarea rows={3} value={(editingJob.benefits || []).join('\n')} onChange={e => setEditingJob({ ...editingJob, benefits: e.target.value.split('\n').filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={editingJob.isActive ?? true} onChange={e => setEditingJob({ ...editingJob, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                  Mở nhận hồ sơ ngay
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="save-job-modal-btn">Lưu Tin Tuyển Dụng</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default RecruitmentEditPage;
