import React from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { SAMPLE_JOBS } from '@/data/sampleData';
import './RecruitmentPage.css';

const RecruitmentPage: React.FC = () => {
  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Tuyển Dụng & Chiêu Chiêu Học Nghề</h1>
          <p className="page-hero-sub">Gia nhập đội ngũ MotoShine — Môi trường chuyên nghiệp & lộ trình thăng tiến rõ ràng</p>
        </div>
      </div>

      <div className="container jobs-layout">
        {/* Intro banner */}
        <div className="recruit-intro-card">
          <div className="ric-text">
            <h2>Tại Sao Nên Chọn MotoShine?</h2>
            <ul>
              <li>✨ Đào tạo chuyên sâu hoàn toàn miễn phí</li>
              <li>💰 Lương thưởng cạnh tranh + thưởng KPI hàng tháng</li>
              <li>🛡️ Đầy đủ chế độ bảo hiểm & phúc lợi theo luật định</li>
              <li>🚀 Lộ trình thăng tiến từ Học Viên → Thợ Chính → Quản Lý Xưởng</li>
            </ul>
          </div>
        </div>

        <h2 className="section-heading" style={{ margin: '2rem 0 1rem' }}>Vị Trí Đang Tuyển Dụng</h2>

        <div className="jobs-list">
          {SAMPLE_JOBS.map(job => (
            <div key={job.id} className="job-card">
              <div className="job-card-header">
                <div>
                  <span className={`job-type-badge job-type-${job.type}`}>
                    {job.type === 'full-time' ? 'Toàn Thời Gian' : job.type === 'part-time' ? 'Bán Thời Gian' : '🎓 Học Nghề (Apprentice)'}
                  </span>
                  <h3 className="job-title">{job.title}</h3>
                </div>
                {job.salary && <div className="job-salary">{job.salary}</div>}
              </div>

              <p className="job-desc">{job.description}</p>

              <div className="job-meta-row">
                <span><FiBriefcase /> {job.department}</span>
                <span><FiMapPin /> {job.location}</span>
                <span><FiClock /> Hạn nộp: Đang nhận hồ sơ</span>
              </div>

              <div className="job-card-footer">
                <Link to={`/recruitment/${job.id}`} className="btn-job-detail">
                  Xem Chi Tiết & Ứng Tuyển <FiArrowRight />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default RecruitmentPage;
