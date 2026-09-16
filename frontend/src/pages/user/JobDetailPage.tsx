import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiSend, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchJobsThunk } from '@/features/jobsSlice';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items: jobs, isLoading } = useAppSelector(s => s.jobs);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (jobs.length === 0) dispatch(fetchJobsThunk(false));
  }, [dispatch, jobs.length]);

  const job = jobs.find(j => j.id === id);

  const shopInfo = useAppSelector(s => s.shop.info);
  const storeName = shopInfo?.name || '61 Team';

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  if (isLoading) return <UserLayout><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Đang tải...</div></UserLayout>;
  if (!job) return <UserLayout><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Vị trí không tồn tại.</h2><Link to="/recruitment">← Về trang tuyển dụng</Link></div></UserLayout>;

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/recruitment" className="back-link"><FiArrowLeft /> Tuyển Dụng</Link>
          <h1 className="page-hero-title">{job.title}</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 840, padding: '2rem 1rem 4rem' }}>
        <div style={{ background: 'var(--bg-card, #121826)', borderRadius: 20, border: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          {/* Header Pills */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            {job.department && <span className="meta-pill"><FiBriefcase /> <strong>Bộ phận:</strong> {job.department}</span>}
            {job.location && <span className="meta-pill"><FiMapPin /> <strong>Địa điểm:</strong> {job.location}</span>}
            {job.salary && <span className="job-salary-pill"><FiDollarSign /> {job.salary}</span>}
            <span className="meta-pill"><FiClock /> <strong>Hạn nộp:</strong> {job.deadline || 'Đang nhận hồ sơ'}</span>
          </div>

          {/* Description */}
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Mô Tả Công Việc</h3>
          <div className="job-desc-box" style={{ marginBottom: '1.75rem' }}>
            <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>

          {/* Requirements */}
          {(job.requirements || []).length > 0 && (
            <>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Yêu Cầu Vị Trí</h3>
              <div className="job-desc-box" style={{ marginBottom: '1.75rem' }}>
                <ul className="job-desc-list">
                  {(job.requirements || []).map((r, i) => (
                    <li key={i} className="job-desc-item">
                      <span className="job-desc-item-bullet">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Benefits */}
          {(job.benefits || []).length > 0 && (
            <>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Quyền Lợi &amp; Chế Độ</h3>
              <div className="job-desc-box" style={{ marginBottom: '2rem' }}>
                <ul className="job-desc-list">
                  {(job.benefits || []).map((b, i) => (
                    <li key={i} className="job-desc-item">
                      <span className="job-desc-item-bullet">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Form ứng tuyển */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: 16, padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', textAlign: 'center' }}>
              Ứng Tuyển Vị Trí Này
            </h3>

            {submitted ? (
              <div style={{ textAlign: 'center', color: '#34d399', padding: '1.75rem 0' }}>
                <FiCheckCircle style={{ fontSize: '3rem', marginBottom: '0.75rem' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Đã Nộp Hồ Sơ Thành Công!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bộ phận HR {storeName} sẽ liên hệ với bạn trong vòng 24-48 giờ tới.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Họ và tên *</label>
                    <input type="text" required placeholder="Nguyễn Văn A" style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Số điện thoại *</label>
                    <input type="tel" required placeholder="0901 234 567" style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Email</label>
                  <input type="email" placeholder="name@example.com" style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Kinh nghiệm / Giới thiệu bản thân</label>
                  <textarea rows={3} placeholder="Mô tả ngắn gọn kinh nghiệm làm việc hoặc lý do muốn gia nhập..." style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <button type="submit" className="btn-job-cta" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', cursor: 'pointer', border: 'none' }}>
                  <FiSend /> Nộp Hồ Sơ Ứng Tuyển
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default JobDetailPage;
