import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiSearch, FiCalendar, FiImage, FiVideo } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { fetchPostsThunk, likePostThunk, setSearch } from '@/features/postsSlice';
import './PostsPage.css';

const PostsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, searchQuery, isLoading } = useAppSelector(s => s.posts);
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video' | 'text'>('all');

  useEffect(() => { dispatch(fetchPostsThunk()); }, [dispatch]);

  const filtered = items.filter(p => {
    if (!p.isPublished) return false;
    if (activeTab !== 'all' && p.mediaType !== activeTab) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Tin Tức & Bảng Tin</h1>
          <p className="page-hero-sub">Chia sẻ kinh nghiệm chăm sóc xe, tin tức & ưu đãi từ 61 Team</p>
        </div>
      </div>

      <div className="container posts-layout">
        {/* SNS Top Filter & Search */}
        <div className="posts-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết, chủ đề, hashtag..."
              value={searchQuery}
              onChange={e => dispatch(setSearch(e.target.value))}
              id="posts-search"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => dispatch(setSearch(''))}
                title="Xóa tìm kiếm"
              >
                ✕
              </button>
            )}
          </div>
          <div className="media-tabs">
            <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>Tất Cả</button>
            <button className={`tab-btn ${activeTab === 'image' ? 'active' : ''}`} onClick={() => setActiveTab('image')}><FiImage /> Hình Ảnh</button>
            <button className={`tab-btn ${activeTab === 'video' ? 'active' : ''}`} onClick={() => setActiveTab('video')}><FiVideo /> Video</button>
            <button className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`} onClick={() => setActiveTab('text')}>Bài Viết</button>
          </div>
        </div>

        {/* Feed List */}
        <div className="posts-feed">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>Không tìm thấy bài viết nào.</p></div>
          ) : filtered.map(post => (
            <article key={post.id} className="sns-post-card">
              {/* Header */}
              <div className="post-header">
                <img
                  src={
                    post.authorAvatar ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || '61 Team Admin')}&background=1a5cff&color=ffffff&bold=true`
                  }
                  alt=""
                  className="author-avatar"
                />
                <div className="author-meta">
                  <div className="author-name">{post.authorName || '61 Team Admin'}</div>
                  <div className="post-date"><FiCalendar /> {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                </div>
                <span className="media-badge">{post.mediaType === 'image' ? '🖼️ Ảnh' : post.mediaType === 'video' ? '🎬 Video' : '📝 Bài viết'}</span>
              </div>

              {/* Title & Excerpt */}
              <Link to={`/posts/${post.slug}`} className="post-title-link">
                <h2 className="post-title">{post.title}</h2>
              </Link>
              <p className="post-excerpt">{post.excerpt}</p>

              {/* Media preview */}
              {post.coverImage && (
                <Link to={`/posts/${post.slug}`} className="post-media-wrap">
                  <img src={post.coverImage} alt={post.title} className="post-media-img" />
                </Link>
              )}

              {/* Tags */}
              <div className="post-tags">
                {post.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
              </div>

              {/* Actions Bar */}
              <div className="post-actions">
                <button
                  className={`action-btn ${post.isLikedByCurrentUser ? 'liked' : ''}`}
                  onClick={() => dispatch(likePostThunk(post.id))}
                  id={`like-btn-${post.id}`}>
                  <FiHeart style={{ fill: post.isLikedByCurrentUser ? 'currentColor' : 'none' }} /> <span>{post.likes}</span>
                </button>

                <Link to={`/posts/${post.slug}`} className="action-btn">
                  <FiMessageCircle /> <span>{post.commentCount} bình luận</span>
                </Link>

                <button className="action-btn" onClick={() => navigator.clipboard.writeText(window.location.origin + '/posts/' + post.slug)}>
                  <FiShare2 /> <span>Chia sẻ</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default PostsPage;
