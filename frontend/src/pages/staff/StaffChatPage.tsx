import React, { useState } from 'react';
import { FiSend, FiHash, FiUsers, FiPaperclip, FiSmile, FiSearch } from 'react-icons/fi';
import StaffLayout from '@/components/layout/StaffLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { addMessage } from '@/features/chatSlice';
import { SAMPLE_USERS } from '@/data/sampleData';
import './StaffChatPage.css';

const StaffChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { channels, messages, activeChannelId } = useAppSelector(s => s.chat);
  const { user } = useAppSelector(s => s.auth);

  const [currentChannel, setCurrentChannel] = useState(activeChannelId || 'ch1');
  const [text, setText] = useState('');

  const activeChannel = channels.find(c => c.id === currentChannel) || channels[0];
  const channelMessages = messages.filter(m => m.channelId === currentChannel);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      channelId: currentChannel,
      senderId: user?.id || 'u2',
      senderName: user?.fullName || 'Nguyễn Văn Minh',
      senderAvatar: user?.avatar || 'https://i.pravatar.cc/100?img=12',
      senderRole: user?.role || 'staff',
      content: text,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(newMsg));
    setText('');
  };

  return (
    <StaffLayout>
      <div className="chat-app-card">
        {/* Left Sidebar: Channels & Team Members */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <h3>💬 Kênh Trò Chuyện Nội Bộ</h3>
          </div>

          <div className="chat-channels-section">
            <div className="chat-section-label">KÊNH CHUNG</div>
            {channels.map(ch => (
              <button
                key={ch.id}
                onClick={() => setCurrentChannel(ch.id)}
                className={`channel-item-btn ${currentChannel === ch.id ? 'active' : ''}`}>
                <FiHash />
                <span>{ch.name}</span>
              </button>
            ))}
          </div>

          <div className="chat-members-section">
            <div className="chat-section-label">THÀNH VIÊN ({SAMPLE_USERS.length})</div>
            {SAMPLE_USERS.map(u => (
              <div key={u.id} className="member-item">
                <div className="member-avatar-wrap">
                  <img src={u.avatar} alt="" className="member-avatar" />
                  <span className="online-dot" />
                </div>
                <div className="member-info">
                  <div className="member-name">{u.fullName}</div>
                  <div className="member-role">{u.role === 'admin' ? '👑 Admin' : u.role === 'staff' ? '🛠️ Kỹ thuật viên' : '👤 Khách hàng'}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {/* Header */}
          <div className="chat-main-header">
            <div className="ch-header-title">
              <FiHash className="hash-icon" />
              <div>
                <h2>{activeChannel?.name || 'Kênh Thảo Luận'}</h2>
                <p>{activeChannel?.description || 'Nơi trao đổi công việc hằng ngày'}</p>
              </div>
            </div>
            <div className="ch-header-stats">
              <FiUsers /> 6 Thành viên online
            </div>
          </div>

          {/* Messages Feed */}
          <div className="chat-messages-container">
            {channelMessages.length === 0 ? (
              <div className="empty-chat-state">Chưa có tin nhắn nào trong kênh này. Hãy gửi tin nhắn đầu tiên!</div>
            ) : (
              channelMessages.map(msg => (
                <div key={msg.id} className={`chat-message-row ${msg.senderId === user?.id ? 'own-msg' : ''}`}>
                  <img src={msg.senderAvatar} alt="" className="msg-avatar" />
                  <div className="msg-bubble-wrap">
                    <div className="msg-meta">
                      <span className="msg-sender">{msg.senderName}</span>
                      <span className={`msg-role-tag role-${msg.senderRole}`}>{msg.senderRole === 'admin' ? 'Admin' : 'Kỹ thuật'}</span>
                      <span className="msg-time">{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="msg-content">{msg.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              type="text"
              placeholder={`Nhập tin nhắn gửi đến #${activeChannel?.name || 'chat'}...`}
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
    </StaffLayout>
  );
};

export default StaffChatPage;
