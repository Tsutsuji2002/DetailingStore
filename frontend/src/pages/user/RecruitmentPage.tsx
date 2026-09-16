import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiClock, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchJobsThunk } from '@/features/jobsSlice';
import type { Job } from '@/types';
import './RecruitmentPage.css';

// Helper: Format raw salary strings
const formatSalaryDisplay = (salaryStr?: string): string => {
  if (!salaryStr) return '';
  const trimmed = salaryStr.trim();
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    return `${num.toLocaleString('vi-VN')} VNĐ / tháng`;
  }
  return trimmed;
};

// Helper: Render description bullets
const renderDescriptionBullets = (descStr?: string) => {
  if (!descStr) return null;
  
  const lines = descStr
    .split(/\r?\n/)
    .map(l => l.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {lines.slice(0, 3).map((line, idx) => (
        <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-primary)', flexShrink: 0 }}>•</span>
          <span>{line}</span>
        </li>
      ))}
      {lines.length > 3 && (
        <li style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          ... và {lines.length - 3} yêu cầu khác
        </li>
      )}
    </ul>
  );
};

const RecruitmentPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const jobs = useAppSelector(s => s.jobs.items);
  const shopInfo = useAppSelector(s => s.shop.info);
  const storeName = shopInfo?.name || '61 Team';

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    dispatch(fetchJobsThunk(false));
  }, [dispatch]);

  const activeJobs = jobs.filter(j => j.isActive);

  // Don't auto-select on page load

  const getJobTypeLabel = (type: string) => {
    if (type === 'apprentice') return 'Học Nghề';
    if (type === 'fulltime' || type === 'full-time') return 'Toàn thời gian';
    return 'Bán thời gian';
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Tuyển Dụng</h1>
          <p className="page-hero-sub">
            Gia nhập đội ngũ {storeName} — Môi trường chuyên nghiệp &amp; cơ hội phát triển
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1rem' }}>
        {activeJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Hiện chưa có vị trí tuyển dụng mới nào.</p>
            <p style={{ fontSize: '0.875rem' }}>Vui lòng quay lại sau!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: selectedJob ? '400px 1fr' : '1fr', 
            gap: '2rem', 
            alignItems: 'start',
            maxWidth: selectedJob ? '100%' : '800px',
            margin: '0 auto'
          }}>
            {/* Left: Job Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: selectedJob ? '80vh' : 'none', overflowY: selectedJob ? 'auto' : 'visible', padding: '0.25rem' }}>
              {activeJobs.map(job => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/recruitment/${job.id}`)}
                    style={{
                      background: 'var(--bg-card)',
                      border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      borderRadius: 12,
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: isSelected ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {job.title}
                      </h3>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '0.25rem 0.65rem',
                        borderRadius: 6,
                        background: 'var(--accent-light)',
                        color: 'var(--accent-primary)',
                        whiteSpace: 'nowrap'
                      }}>
                        {getJobTypeLabel(job.type)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      {job.salary && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FiDollarSign size={14} />
                          <span>{formatSalaryDisplay(job.salary)}</span>
                        </div>
                      )}
                      {job.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FiMapPin size={14} />
                          <span>{job.location}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FiClock size={14} />
                        <span>Hạn: {job.deadline || 'Đang mở'}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedJob(job);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 8,
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent-light)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      Xem Trước
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Right: Job Preview Panel (only show when selected) */}
            {selectedJob && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 16,
                padding: '2rem',
                position: 'sticky',
                top: '2rem'
              }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      {selectedJob.title}
                    </h2>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.3rem 0.75rem',
                      borderRadius: 6,
                      background: 'var(--accent-light)',
                      color: 'var(--accent-primary)'
                    }}>
                      {getJobTypeLabel(selectedJob.type)}
                    </span>
                  </div>

                  {selectedJob.salary && (
                    <div style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                      marginBottom: '0.75rem'
                    }}>
                      {formatSalaryDisplay(selectedJob.salary)}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {selectedJob.location && <span>{selectedJob.location}</span>}
                    <span>Hạn: {selectedJob.deadline || 'Đang mở'}</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {selectedJob.description?.split('\n').slice(0, 3).join(' ').substring(0, 200)}
                    {selectedJob.description && selectedJob.description.length > 200 ? '...' : ''}
                  </p>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button
                    onClick={() => navigate(`/recruitment/${selectedJob.id}`)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.25rem',
                      borderRadius: 8,
                      background: 'var(--accent-primary)',
                      color: 'white',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Xem Chi Tiết
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
};

export default RecruitmentPage;
