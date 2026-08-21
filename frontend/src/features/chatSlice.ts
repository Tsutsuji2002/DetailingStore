import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ChatConversation, ChatMessage, ChatChannel } from '@/types';
import { SAMPLE_CONVERSATIONS, SAMPLE_MESSAGES } from '@/data/sampleData';

interface ChatState {
  channels: ChatChannel[];
  activeChannelId: string;
  conversations: ChatConversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
}

const initialChannels: ChatChannel[] = [
  { id: 'ch1', name: 'thong-bao-xut-quan', description: 'Thông báo chung từ ban quản lý' },
  { id: 'ch2', name: 'kho-vat-tu', description: 'Trao đổi & đề xuất linh kiện, hóa chất' },
  { id: 'ch3', name: 'ky-thuat-xe-may', description: 'Hỏi đáp kỹ thuật & mã lỗi động cơ' },
];

const initialMessages: ChatMessage[] = [
  {
    id: 'm1',
    channelId: 'ch1',
    senderId: 'u1',
    senderName: 'Admin MotoShine',
    senderRole: 'admin',
    senderAvatar: 'https://i.pravatar.cc/80?img=1',
    content: 'Chào mừng anh em kỹ thuật viên đến với hệ thống trao đổi nội bộ MotoShine!',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'm2',
    channelId: 'ch3',
    senderId: 'u2',
    senderName: 'Nguyễn Văn Minh',
    senderRole: 'staff',
    senderAvatar: 'https://i.pravatar.cc/80?img=12',
    content: 'Anh em lưu ý xe SH 150i hôm nay có mã lỗi P0115 vừa cập nhật cẩm nang nhé!',
    timestamp: new Date().toISOString(),
  },
];

const initialState: ChatState = {
  channels: initialChannels,
  activeChannelId: 'ch1',
  conversations: SAMPLE_CONVERSATIONS,
  messages: initialMessages,
  activeConversationId: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChannel(state, action: PayloadAction<string>) {
      state.activeChannelId = action.payload;
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    sendMessage(state, action: PayloadAction<ChatMessage>) {
      state.messages.push(action.payload);
    },
    addConversation(state, action: PayloadAction<ChatConversation>) {
      state.conversations.unshift(action.payload);
    },
  },
});

export const { setActiveChannel, setActiveConversation, addMessage, sendMessage, addConversation } = chatSlice.actions;
export default chatSlice.reducer;
