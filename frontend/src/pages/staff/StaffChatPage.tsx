import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSend, FiHash, FiUsers, FiPlus, FiX, FiMessageSquare, FiShield, FiCheckSquare, FiSquare, FiChevronLeft } from 'react-icons/fi';
import * as signalR from '@microsoft/signalr';
import StaffLayout from '@/components/layout/StaffLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { addMessage, addOptimisticMessage, confirmOptimisticMessage, failOptimisticMessage, fetchChannelsThunk, fetchMessagesThunk, sendMessageThunk, markChannelAsRead } from '@/features/chatSlice';
import UserAvatar from '@/components/ui/UserAvatar';
import { chatApi } from '@/services/api/chatApi';
import { usersApi } from '@/services/api/usersApi';
import { useToast } from '@/context/ToastContext';
import type { ChatMessage, ChatChannel, User } from '@/types';
import './StaffChatPage.css';

const StaffChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId?: string }>();
  const { channels, messages, unreadCounts } = useAppSelector(s => s.chat);
  const { user } = useAppSelector(s => s.auth);
  const { showToast } = useToast();

  const [currentChannelId, setCurrentChannelId] = useState(channelId || 'thong-bao-chung');
  const [text, setText] = useState('');
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const hubConnectionRef = useRef<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = user?.role === 'admin';

  // 1. Fetch channels and staff users on mount
  const loadChannelsAndStaff = () => {
    dispatch(fetchChannelsThunk(user?.id));
    usersApi.getStaffUsers().then(setStaffUsers).catch(() => {});
  };

  useEffect(() => {
    loadChannelsAndStaff();
  }, [dispatch, user?.id]);

  // Set default active channel once loaded
  useEffect(() => {
    if (channels.length > 0 && !channels.some(c => c.id === currentChannelId)) {
      const firstChannel = channels[0].id;
      setCurrentChannelId(firstChannel);
      navigate(`/staff/chat/${firstChannel}`, { replace: true });
    }
  }, [channels, currentChannelId, navigate]);

  // Update URL when channelId param changes
  useEffect(() => {
    if (channelId && channelId !== currentChannelId) {
      setCurrentChannelId(channelId);
    }
  }, [channelId]);

  // 2. Fetch messages when active channel changes
  useEffect(() => {
    if (currentChannelId) {
      dispatch(fetchMessagesThunk(currentChannelId));
    }
  }, [dispatch, currentChannelId]);

  // 3. Auto-scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Connect SignalR WebSocket Hub
  useEffect(() => {
    if (!currentChannelId) return;
    const hubUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5080').replace('/api', '') + '/hubs/chat';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        connection.invoke('JoinChannel', currentChannelId).catch(() => {});
      })
      .catch(err => console.warn('SignalR connect error:', err));

    connection.on('ReceiveMessage', (msg: ChatMessage) => {
      // Only add message if it's not from current user OR if we don't have it yet
      // This prevents duplicate when SignalR broadcasts back our own sent message
      const isOwnMessage = String(msg.senderId) === String(user?.id);
      
      if (isOwnMessage) {
        // For own messages, only add if not already in state (shouldn't happen with proper duplicate detection)
        // The API response already handled it via confirmOptimisticMessage
        console.log('SignalR: Skipping own message echo', msg.id);
      } else {
        // For others' messages, add them
        dispatch(addMessage(msg));
        
        // Show toast notification if message is from another channel
        if (msg.channelId !== currentChannelId) {
          showToast({
            type: 'info',
            title: `💬 ${msg.senderName}`,
            subtitle: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
            actionUrl: `/staff/chat/${msg.channelId}`,
            actionText: 'Xem tin nhắn'
          });
        }
      }
    });

    hubConnectionRef.current = connection;

    return () => {
      connection.invoke('LeaveChannel', currentChannelId).catch(() => {});
      connection.stop();
    };
  }, [dispatch, currentChannelId, user?.id, channels, showToast]);

  const groupChannels = channels.filter(c => !c.isDirect);
  const directChannels = channels.filter(c => c.isDirect);
  const activeChannel = channels.find(c => c.id === currentChannelId) || groupChannels[0] || channels[0];
  const channelMessages = messages.filter(m => m.channelId === currentChannelId);

  // Direct chat partner information
  const getDirectPartnerInfo = (ch: ChatChannel) => {
    if (!ch.isDirect) return null;
    const partnerId = ch.memberIds?.find(id => String(id) !== String(user?.id)) ||
      (ch.name.replace('dm_', '').split('_').find(id => String(id) !== String(user?.id)));
    const partner = staffUsers.find(u => String(u.id) === String(partnerId));
    return partner;
  };

  const activeDirectPartner = activeChannel?.isDirect ? getDirectPartnerInfo(activeChannel) : null;

  const handleSend = async (e?: React.FormEvent, retryMsg?: ChatMessage) => {
    if (e) e.preventDefault();
    const contentText = retryMsg ? retryMsg.content : text.trim();
    if (!contentText || !currentChannelId) return;

    const tempId = retryMsg?.tempId || ('temp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));

    const tempMessage: ChatMessage = {
      id: tempId,
      tempId: tempId,
      channelId: currentChannelId,
      senderId: String(user?.id ?? 'guest'),
      senderName: user?.fullName || user?.username || 'Nhân viên',
      senderAvatar: user?.avatar || user?.avatarUrl,
      senderRole: user?.role || 'staff',
      content: contentText,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      status: 'sending',
    };

    if (!retryMsg) {
      setText('');
      dispatch(addOptimisticMessage(tempMessage));
    }

    try {
      const serverMsg = await chatApi.sendMessage({
        channelId: currentChannelId,
        senderId: tempMessage.senderId,
        senderName: tempMessage.senderName || '',
        senderAvatar: tempMessage.senderAvatar,
        senderRole: tempMessage.senderRole,
        content: contentText,
      });

      dispatch(confirmOptimisticMessage({ tempId, message: serverMsg }));
    } catch (err) {
      dispatch(failOptimisticMessage({ tempId }));
    }
  };

  const handleOpenDirectChat = async (targetUser: User) => {
    if (!user?.id) return;
    try {
      const dmChannel = await chatApi.getOrCreateDirectChannel({
        userId1: String(user.id),
        userId2: String(targetUser.id),
      });
      await dispatch(fetchChannelsThunk(user.id));
      setCurrentChannelId(dmChannel.id);
      navigate(`/staff/chat/${dmChannel.id}`);
    } catch (err: any) {
      console.error('Lỗi mở chat 1-1:', err);
    }
  };

  const handleToggleStaffSelection = (staffId: string) => {
    setSelectedStaffIds(prev =>
      prev.includes(staffId) ? prev.filter(id => id !== staffId) : [...prev, staffId]
    );
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    setCreating(true);
    try {
      const created = await chatApi.createChannel({
        name: newChannelName.trim(),
        description: newChannelDesc.trim() || undefined,
        creatorId: user?.id,
        memberIds: selectedStaffIds,
      });
      await dispatch(fetchChannelsThunk(user?.id));
      setCurrentChannelId(created.id);
      navigate(`/staff/chat/${created.id}`);
      setShowCreateModal(false);
      setNewChannelName('');
      setNewChannelDesc('');
      setSelectedStaffIds([]);
    } catch (err: any) {
      alert('Lỗi tạo kênh: ' + (err.message || ''));
    } finally {
      setCreating(false);
    }
  };

  const roleLabel = (role: string) =>
    role === 'admin' ? '👑 Admin' : role === 'staff' ? '🛠️ Kỹ thuật viên' : '👤 Nhân viên';

  const [mobileTab, setMobileTab] = useState<'sidebar' | 'chat'>('chat');

  const selectChannel = (chId: string) => {
    setCurrentChannelId(chId);
    navigate(`/staff/chat/${chId}`);
    setMobileTab('chat');
  };

  const selectDirectUser = async (u: User) => {
    await handleOpenDirectChat(u);
    setMobileTab('chat');
  };

  return (
    <StaffLayout>
      <div className={`chat-app-card mobile-show-${mobileTab}`}>
        {/* Left Sidebar */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>💬 Kênh Trò Chuyện Nội Bộ</h3>
          </div>

          {/* Group Channels list */}
          <div className="chat-channels-section">
            <div className="chat-section-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>KÊNH CHUNG</span>
              {isAdmin && (
                <button
                  title="Tạo kênh mới (chỉ Admin)"
                  onClick={() => setShowCreateModal(true)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', padding: '0 0.25rem' }}
                >
                  <FiPlus size={16} />
                </button>
              )}
            </div>
            {groupChannels.map(ch => {
              const unreadCount = unreadCounts[ch.id] || 0;
              return (
                <button
                  key={ch.id}
                  onClick={() => selectChannel(ch.id)}
                  className={`channel-item-btn ${currentChannelId === ch.id ? 'active' : ''}`}
                  style={{ position: 'relative' }}>
                  <FiHash />
                  <span>{ch.name}</span>
                  {ch.isPublic && <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 'auto' }}>Chung</span>}
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '50%',
                      right: '0.75rem',
                      transform: 'translateY(-50%)',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 9999,
                      minWidth: '1.2rem',
                      textAlign: 'center'
                    }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Direct Messages List (If Any) */}
          {directChannels.length > 0 && (
            <div className="chat-channels-section">
              <div className="chat-section-label">TIN NHẮN TRỰC TIẾP</div>
              {directChannels.map(ch => {
                const partner = getDirectPartnerInfo(ch);
                const partnerName = partner ? (partner.fullName || partner.username) : 'Chat 1-1';
                const unreadCount = unreadCounts[ch.id] || 0;
                return (
                  <button
                    key={ch.id}
                    onClick={() => selectChannel(ch.id)}
                    className={`channel-item-btn ${currentChannelId === ch.id ? 'active' : ''}`}
                    style={{ position: 'relative' }}>
                    <FiMessageSquare />
                    <span>{partnerName}</span>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '50%',
                        right: '0.75rem',
                        transform: 'translateY(-50%)',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: 9999,
                        minWidth: '1.2rem',
                        textAlign: 'center'
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Real Staff Members */}
          <div className="chat-members-section">
            <div className="chat-section-label">THÀNH VIÊN ({staffUsers.length})</div>
            {staffUsers.map(u => {
              const isCurrentUser = String(u.id) === String(user?.id);
              return (
                <div
                  key={u.id}
                  className="member-item"
                  onClick={() => !isCurrentUser && selectDirectUser(u)}
                  style={{ cursor: isCurrentUser ? 'default' : 'pointer' }}
                  title={isCurrentUser ? 'Tài khoản của bạn' : `Bấm để chat 1-1 với ${u.fullName || u.username}`}
                >
                  <div className="member-avatar-wrap">
                    <UserAvatar src={(u as any).avatar || (u as any).avatarUrl} name={u.fullName || u.username} size={32} />
                    <span className="online-dot" />
                  </div>
                  <div className="member-info">
                    <div className="member-name">
                      {u.fullName || u.username} {isCurrentUser && <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>(Bạn)</span>}
                    </div>
                    <div className="member-role">{roleLabel(u.role)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {/* Header */}
          <div className="chat-main-header">
            <button
              className="chat-mobile-back-btn"
              onClick={() => setMobileTab('sidebar')}
              title="Quay lại danh sách kênh"
            >
              <FiChevronLeft /> Kênh chat
            </button>

            <div className="ch-header-title">
              {activeChannel?.isDirect ? (
                <>
                  <UserAvatar
                    src={(activeDirectPartner as any)?.avatar || (activeDirectPartner as any)?.avatarUrl}
                    name={activeDirectPartner?.fullName || activeDirectPartner?.username || 'User'}
                    size={38}
                  />
                  <div style={{ marginLeft: '0.5rem' }}>
                    <h2>{activeDirectPartner ? (activeDirectPartner.fullName || activeDirectPartner.username) : 'Tin Nhắn Trực Tiếp'}</h2>
                    <p>{activeDirectPartner ? roleLabel(activeDirectPartner.role) : 'Trao đổi riêng tư 1-1'}</p>
                  </div>
                </>
              ) : (
                <>
                  <FiHash className="hash-icon" />
                  <div>
                    <h2>{activeChannel?.name || 'Kênh Thảo Luận'}</h2>
                    <p>{activeChannel?.description || 'Nơi trao đổi công việc hằng ngày'}</p>
                  </div>
                </>
              )}
            </div>
            <div className="ch-header-stats">
              <FiUsers /> {staffUsers.length} thành viên
            </div>
          </div>

          {/* Messages Feed */}
          <div className="chat-messages-container">
            {channelMessages.length === 0 ? (
              <div className="empty-chat-state">Chưa có tin nhắn nào trong cuộc trò chuyện này. Hãy gửi tin nhắn đầu tiên!</div>
            ) : (
              channelMessages.map(msg => {
                const isOwn = String(msg.senderId) === String(user?.id);
                const timestamp = msg.createdAt || (msg as any).timestamp || new Date().toISOString();
                return (
                  <div key={msg.id || msg.tempId} className={`chat-message-row ${isOwn ? 'own-msg' : ''} ${msg.status === 'sending' ? 'sending-msg' : ''}`}>
                    <UserAvatar src={msg.senderAvatar} name={msg.senderName} size={36} />
                    <div className="msg-bubble-wrap">
                      <div className="msg-meta">
                        <span className="msg-sender">{msg.senderName}</span>
                        <span className={`msg-role-tag role-${msg.senderRole}`}>
                          {msg.senderRole === 'admin' ? 'Admin' : 'Kỹ thuật'}
                        </span>
                        <span className="msg-time">
                          {new Date(timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.status === 'sending' && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            ⏳ Đang gửi...
                          </span>
                        )}
                      </div>
                      <div className="msg-content" style={{ opacity: msg.status === 'sending' ? 0.7 : 1 }}>
                        {msg.content}
                      </div>
                      {msg.status === 'error' && (
                        <div style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span>❌ Lỗi gửi tin nhắn</span>
                          <button
                            type="button"
                            onClick={() => handleSend(undefined, msg)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--accent-primary)',
                              textDecoration: 'underline', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem'
                            }}
                          >
                            Thử lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              type="text"
              placeholder={
                activeChannel?.isDirect
                  ? `Nhập tin nhắn riêng gửi tới ${activeDirectPartner?.fullName || activeDirectPartner?.username || 'nhân viên'}...`
                  : `Nhập tin nhắn gửi đến #${activeChannel?.name || 'chat'}...`
              }
              value={text}
              onChange={e => setText(e.target.value)}
              className="chat-text-input"
              id="staff-chat-input"
            />
            <button type="submit" className="btn-send-msg" id="staff-chat-send">
              <FiSend /> Gửi
            </button>
          </form>
        </main>
      </div>

      {/* Create Channel Modal (Only for Admin) */}
      {showCreateModal && isAdmin && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, padding: '2rem',
            width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiShield style={{ color: 'var(--accent-primary)' }} /> Tạo Kênh Chat Riêng (Admin)
              </h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateChannel}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Tên kênh *
              </label>
              <input
                placeholder="kho-vat-tu, ky-thuat-xe"
                value={newChannelName}
                onChange={e => setNewChannelName(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10,
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', marginBottom: '1rem', boxSizing: 'border-box'
                }}
              />
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Mô tả (tuỳ chọn)
              </label>
              <input
                placeholder="Mục đích và nội dung trao đổi..."
                value={newChannelDesc}
                onChange={e => setNewChannelDesc(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.9rem', borderRadius: 10,
                  border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)', marginBottom: '1.25rem', boxSizing: 'border-box'
                }}
              />

              {/* Select Members to invite */}
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Chọn thành viên được phép truy cập kênh:
              </label>
              <div style={{
                maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border-color)',
                borderRadius: 10, padding: '0.5rem', background: 'var(--bg-secondary)', marginBottom: '1.5rem'
              }}>
                {staffUsers.filter(u => String(u.id) !== String(user?.id)).map(u => {
                  const isSelected = selectedStaffIds.includes(String(u.id));
                  return (
                    <div
                      key={u.id}
                      onClick={() => handleToggleStaffSelection(String(u.id))}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.45rem 0.6rem',
                        borderRadius: 8, cursor: 'pointer', background: isSelected ? 'var(--bg-card)' : 'transparent'
                      }}
                    >
                      {isSelected ? <FiCheckSquare style={{ color: 'var(--accent-primary)' }} /> : <FiSquare style={{ color: 'var(--text-muted)' }} />}
                      <UserAvatar src={(u as any).avatar || (u as any).avatarUrl} name={u.fullName || u.username} size={28} />
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.fullName || u.username}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCreateModal(false)}
                  style={{ padding: '0.55rem 1.2rem', borderRadius: 9999, border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--text-primary)' }}>
                  Huỷ
                </button>
                <button type="submit" disabled={creating}
                  style={{ padding: '0.55rem 1.4rem', borderRadius: 9999, border: 'none', background: 'var(--accent-primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                  {creating ? 'Đang tạo...' : 'Tạo Kênh'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
};

export default StaffChatPage;
