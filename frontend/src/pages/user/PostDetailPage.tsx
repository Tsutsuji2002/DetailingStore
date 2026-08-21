import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiShare2, FiCalendar, FiUser, FiSend } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { toggleLike, addComment } from '@/features/postsSlice';
import type { Comment } from '@/types';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { items, comments } = useAppSelector(s => s.posts);
  const { user, isAuthenticated } = useAppSelector(s => s.auth);
  const post = items.find(p => p.slug === slug);
  const [commentText, setCommentText] = useState('');

  if (!post) return (
    <UserLayout>
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Bài viết không tồn tại.</h2>
        <Link to="/posts" className="btn-back">← Về danh sách tin tức</Link>
      </div>
    </UserLayout>
  );

  const postComments = comments[post.id] || [
    { id: 'c1', postId: post.id, authorId: 'u3', author: { id: 'u3', username: 'khang', email: '', firstName: 'Khang', lastName: 'Trần Văn', fullName: 'Trần Văn Khang', role: 'customer', createdAt: '' }, content: 'Bài viết rất hữu ích! Cảm ơn shop.', likes: 3, createdAt: '2024-08-11T10:00:00Z' },
    { id: 'c2', postId: post.id, authorId: 'u2', author: { id: 'u2', username: 'minh', email: '', firstName: 'Minh', lastName: 'Nguyễn Văn', fullName: 'Nguyễn Văn Minh', role: 'staff', createdAt: '' }, content: 'Mọi người nhớ phủ ceramic bảo vệ sơn xe mùa mưa này nhé!', likes: 5, createdAt: '2024-08-11T11:30:00Z' },
  ];

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC: Comment = {
      id: 'c_' + Date.now(),
      postId: post.id,
      authorId: user?.id || 'guest',
      author: user || { id: 'guest', username: 'khach', email: '', firstName: 'Khách', lastName: 'Hàng', fullName: 'Khách Hàng', role: 'customer', createdAt: '' },
      content: commentText.trim(),
      likes: 0,
      createdAt: new Date().toISOString(),
    };
    dispatch(addComment({ postId: post.id, comment: newC }));
    setCommentText('');
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/posts" className="back-link"><FiArrowLeft /> Tin Tức</Link>
          <h1 className="page-hero-title" style={{ fontSize: '1.75rem' }}>{post.title}</h1>
        </div>
      </div>

      <div className="container post-detail-container">
        <article className="post-detail-main">
          <div className="post-detail-header">
            <img src={post.author?.avatar || `https://i.pravatar.cc/48?u=${post.authorId}`} alt="" className="author-avatar-lg" />
            <div>
              <div className="author-name-lg">{post.author?.fullName || 'MotoShine Admin'}</div>
              <div className="post-meta-row"><FiCalendar /> {new Date(post.createdAt).toLocaleDateString('vi-VN')} • {post.likes} Lượt thích</div>
            </div>
          </div>

          {post.coverImage && (
            <div className="post-cover-wrap">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}

          <div className="post-full-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="post-tags-row">
            {post.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
          </div>

          <div className="post-reaction-bar">
            <button className={`reaction-btn ${post.isLiked ? 'liked' : ''}`} onClick={() => dispatch(toggleLike(post.id))}>
              <FiHeart /> <span>{post.likes} Thích</span>
            </button>
            <button className="reaction-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <FiShare2 /> <span>Chia sẻ</span>
            </button>
          </div>

          {/* Comments section */}
          <section className="comments-section">
            <h3 className="comments-title">Bình Luận ({postComments.length})</h3>

            {/* Form */}
            <form onSubmit={handleSendComment} className="comment-form">
              <img src={user?.avatar || 'https://i.pravatar.cc/40?img=33'} alt="" className="user-avatar-sm" />
              <input type="text" placeholder={isAuthenticated ? 'Viết bình luận của bạn...' : 'Đăng nhập để viết bình luận (hoặc gửi dưới danh nghĩa Khách)...'} value={commentText} onChange={e => setCommentText(e.target.value)} id="comment-input" />
              <button type="submit" className="comment-send-btn" id="comment-send"><FiSend /></button>
            </form>

            {/* List */}
            <div className="comments-list">
              {postComments.map(c => (
                <div key={c.id} className="comment-item">
                  <img src={c.author?.avatar || `https://i.pravatar.cc/36?u=${c.authorId}`} alt="" className="comment-avatar" />
                  <div className="comment-body">
                    <div className="comment-author-name">{c.author?.fullName}</div>
                    <div className="comment-text">{c.content}</div>
                    <div className="comment-meta">{new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    </UserLayout>
  );
};

export default PostDetailPage;
