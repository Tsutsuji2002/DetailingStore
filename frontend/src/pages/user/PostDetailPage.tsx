import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiHeart, FiShare2, FiCalendar, FiSend } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { likePostThunk, addComment, fetchPostsThunk } from '@/features/postsSlice';
import postApi from '@/services/api/postApi';
import UserAvatar from '@/components/ui/UserAvatar';
import type { PostDto } from '@/services/api/postApi';
import type { Comment } from '@/types';
import './PostDetailPage.css';

const PostDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { items, comments } = useAppSelector(s => s.posts);
  const { user, isAuthenticated } = useAppSelector(s => s.auth);

  const [post, setPost] = useState<PostDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');

  // Try to find from Redux store first; fallback to API fetch
  useEffect(() => {
    const fromStore = items.find(p => p.slug === slug || p.id === slug);
    if (fromStore) {
      setPost(fromStore);
      setLoading(false);
    } else {
      if (slug) {
        postApi.getPost(slug)
          .then(data => setPost(data))
          .catch(() => setPost(null))
          .finally(() => setLoading(false));
      }
    }
    // If items list is empty (direct URL open), also fetch the list for the sidebar/future navigation
    if (items.length === 0) {
      dispatch(fetchPostsThunk());
    }
  }, [slug, items]);

  // Keep local post in sync with Redux store (e.g. after like)
  useEffect(() => {
    const fromStore = items.find(p => p.id === post?.id);
    if (fromStore) setPost(fromStore);
  }, [items]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !post) return;
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

  if (loading) return (
    <UserLayout>
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Đang tải bài viết...</p>
      </div>
    </UserLayout>
  );

  if (!post) return (
    <UserLayout>
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>😕</div>
        <h2>Bài viết không tồn tại hoặc đã bị xóa.</h2>
        <Link to="/posts" className="btn-back">← Về danh sách tin tức</Link>
      </div>
    </UserLayout>
  );

  const postComments = comments[post.id] || [];

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
          {/* Header */}
          <div className="author-info">
            <img
              src={
                post.authorAvatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName || '61 Team Admin')}&background=1a5cff&color=ffffff&bold=true`
              }
              alt={post.authorName || 'Author'}
              className="author-avatar-lg"
            />
            <div className="author-name-lg">{post.authorName || '61 Team Admin'}</div>
            <div className="post-meta-row">
              <FiCalendar /> {new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}
              &nbsp;•&nbsp;{post.likes} Lượt thích
            </div>
          </div>

          {/* Cover image */}
          {post.coverImage && (
            <div className="post-cover-wrap">
              <img src={post.coverImage} alt={post.title} />
            </div>
          )}

          {/* Rich content — renders HTML stored from editor */}
          <div
            className="post-full-content rte-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags-row">
              {post.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
            </div>
          )}

          {/* Reaction bar */}
          <div className="post-reaction-bar">
            <button
              className={`reaction-btn ${post.isLikedByCurrentUser ? 'liked' : ''}`}
              onClick={() => dispatch(likePostThunk(post.id))}
            >
              <FiHeart style={{ fill: post.isLikedByCurrentUser ? 'currentColor' : 'none', color: post.isLikedByCurrentUser ? 'var(--danger)' : 'inherit' }} /> <span>{post.likes} Thích</span>
            </button>
            <button className="reaction-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              <FiShare2 /> <span>Chia sẻ</span>
            </button>
          </div>

          {/* Comments section */}
          <section className="comments-section">
            <h3 className="comments-title">Bình Luận ({postComments.length})</h3>

            <form onSubmit={handleSendComment} className="comment-form">
              <UserAvatar src={user?.avatar || user?.avatarUrl} name={user?.fullName || user?.username} size={36} />
              <input
                type="text"
                placeholder={isAuthenticated ? 'Viết bình luận của bạn...' : 'Gõ bình luận của bạn...'}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                id="comment-input"
              />
              <button type="submit" className="comment-send-btn" id="comment-send"><FiSend /></button>
            </form>

            <div className="comments-list">
              {postComments.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem 0', fontSize: '0.9rem' }}>
                  Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ!
                </div>
              ) : postComments.map(c => (
                <div key={c.id} className="comment-item">
                  <UserAvatar src={c.author?.avatar || c.author?.avatarUrl} name={c.author?.fullName || c.author?.username} size={36} />
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
