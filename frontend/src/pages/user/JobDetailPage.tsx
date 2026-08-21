import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiSend, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { SAMPLE_JOBS } from '@/data/sampleData';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const job = SAMPLE_JOBS.find(j => j.id === id);
  const [submitted, setSubmitted] = useState(false);

  if (!job) return <UserLayout><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Vị trí không tồn tại.</h2><Link to="/recruitment" className="btn-back">← Về trang tuyển dụng</Link></div></UserLayout>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/recruitment" className="back-link"><FiArrowLeft /> Tuyển Dụng</Link>
          <h1 className="page-hero-title">{job.title}</h1>
        </div>
      </div>

      <div className="container" style={{ maxWidth: 800, padding: '2.5rem 0 4rem' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 18, border: '1px solid var(--border-color)', padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span><FiBriefcase /> <strong>Bộ phận:</strong> {job.department}</span>
            <span><FiMapPin /> <strong>Địa điểm:</strong> {job.location}</span>
            {job.salary && <span><FiDollarSign /> <strong>Lương:</strong> {job.salary}</span>}
          </div>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Mô Tả Công Việc</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>{job.description}</p>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Yêu Cầu Vị Trí</h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {(job.requirements || []).map((r, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{r}</li>)}
          </ul>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Quyền Lợi</h3>
          <ul style={{ paddingLeft: '1.25rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '2rem' }}>
            {(job.benefits || []).map((b, i) => <li key={i} style={{ marginBottom: '0.4rem' }}>{b}</li>)}
          </ul>

          {/* Form ứng tuyển */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Ứng Tuyển Vị Trí Này</h3>

            {submitted ? (
              <div style={{ textAlign: 'center', color: 'var(--success)', padding: '1.5rem 0' }}>
                <FiCheckCircle style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }} />
                <h4>Đã Nộp Hồ Sơ Thành Công!</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bộ phận HR MotoShine sẽ liên hệ với bạn trong vòng 24-48 giờ tới.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Họ và tên *</label>
                    <input type="text" required placeholder="Nguyễn Văn A" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Số điện thoại *</label>
                    <input type="tel" required placeholder="0901 234 567" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Email</label>
                  <input type="email" placeholder="name@example.com" style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Gợi ý kinh nghiệm / Giới thiệu bản thân</label>
                  <textarea rows={3} placeholder="Đã từng sửa xe 1 năm / chưa có kinh nghiệm muốn học nghề..." style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                </div>
                <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem', borderRadius: 12, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
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
