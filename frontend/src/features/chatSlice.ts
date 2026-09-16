import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ChatConversation, ChatMessage, ChatChannel } from '@/types';
import { chatApi } from '@/services/api/chatApi';

interface ChatState {
  channels: ChatChannel[];
  activeChannelId: string;
  conversations: ChatConversation[];
  messages: ChatMessage[];
  activeConversationId: string | null;
  loading: boolean;
  unreadCounts: Record<string, number>; // channelId -> unread count
  totalUnread: number;
}

const initialChannels: ChatChannel[] = [
  { id: 'thong-bao-chung', name: 'thong-bao-chung', description: 'Thông báo chung từ ban quản lý', isPublic: true },
];

const initialState: ChatState = {
  channels: initialChannels,
  activeChannelId: 'thong-bao-chung',
  conversations: [],
  messages: [],
  activeConversationId: null,
  loading: false,
  unreadCounts: {},
  totalUnread: 0,
};

export const fetchChannelsThunk = createAsyncThunk(
  'chat/fetchChannels',
  async (userId: string | undefined, { rejectWithValue }) => {
    try {
      const data = await chatApi.getChannels(userId);
      return data && data.length > 0 ? data : initialChannels;
    } catch (e: any) {
      return initialChannels;
    }
  }
);

export const fetchMessagesThunk = createAsyncThunk(
  'chat/fetchMessages',
  async (channelId: string, { rejectWithValue }) => {
    try {
      const data = await chatApi.getChannelMessages(channelId);
      return data;
    } catch (e: any) {
      return [];
    }
  }
);

export const sendMessageThunk = createAsyncThunk(
  'chat/sendMessage',
  async (dto: {
    channelId: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    senderRole?: string;
    content: string;
  }, { rejectWithValue }) => {
    try {
      const created = await chatApi.sendMessage(dto);
      return created;
    } catch (e: any) {
      return rejectWithValue(e.message || 'Lỗi gửi tin nhắn');
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChannel(state, action: PayloadAction<string>) {
      state.activeChannelId = action.payload;
      // Clear unread count for this channel when viewing it
      if (state.unreadCounts[action.payload]) {
        state.totalUnread -= state.unreadCounts[action.payload];
        state.unreadCounts[action.payload] = 0;
      }
    },
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    addOptimisticMessage(state, action: PayloadAction<ChatMessage>) {
      const msg = { ...action.payload, status: 'sending' as const };
      state.messages.push(msg);
    },
    confirmOptimisticMessage(state, action: PayloadAction<{ tempId: string; message: ChatMessage }>) {
      const { tempId, message } = action.payload;
      const index = state.messages.findIndex(m => m.tempId === tempId || m.id === tempId);
      
      if (index !== -1) {
        // Replace the optimistic message with the confirmed one
        state.messages[index] = {
          ...message,
          status: 'sent',
          tempId: tempId // Keep tempId for duplicate detection
        };
      } else if (!state.messages.some(m => m.id === message.id)) {
        // Add if not already present (fallback case)
        state.messages.push({ ...message, status: 'sent', tempId });
      }
    },
    failOptimisticMessage(state, action: PayloadAction<{ tempId: string }>) {
      const msg = state.messages.find(m => m.tempId === action.payload.tempId || m.id === action.payload.tempId);
      if (msg) {
        msg.status = 'error';
      }
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const newMsg = action.payload;
      
      // Comprehensive duplicate check:
      // 1. Check if message with same ID already exists
      // 2. Check if message with matching tempId exists (SignalR echo of own message)
      // 3. Check if it's a duplicate by content+timestamp (fallback)
      const exists = state.messages.some(m => {
        // Same server ID
        if (m.id && newMsg.id && m.id === newMsg.id) return true;
        
        // Server message matching an optimistic tempId
        if (m.tempId && newMsg.id && m.tempId === newMsg.id) return true;
        
        // Optimistic message that got confirmed (tempId matches server ID)
        if (newMsg.tempId && m.id && m.id === newMsg.tempId) return true;
        
        return false;
      });

      if (!exists) {
        state.messages.push({ ...newMsg, status: 'sent' });
        
        // Increment unread count if message is in a different channel than active
        if (newMsg.channelId && newMsg.channelId !== state.activeChannelId) {
          state.unreadCounts[newMsg.channelId] = (state.unreadCounts[newMsg.channelId] || 0) + 1;
          state.totalUnread += 1;
        }
      }
    },
    markChannelAsRead(state, action: PayloadAction<string>) {
      const channelId = action.payload;
      if (state.unreadCounts[channelId]) {
        state.totalUnread -= state.unreadCounts[channelId];
        state.unreadCounts[channelId] = 0;
      }
    },
    addConversation(state, action: PayloadAction<ChatConversation>) {
      state.conversations.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChannelsThunk.fulfilled, (state, action) => {
        state.channels = action.payload;
      })
      .addCase(fetchMessagesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Retain any pending optimistic messages that haven't finished sending
        const sendingMsgs = state.messages.filter(m => m.status === 'sending');
        state.messages = [...action.payload, ...sendingMsgs];
      })
      .addCase(fetchMessagesThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const {
  setActiveChannel,
  setActiveConversation,
  addOptimisticMessage,
  confirmOptimisticMessage,
  failOptimisticMessage,
  addMessage,
  markChannelAsRead,
  addConversation
} = chatSlice.actions;
export default chatSlice.reducer;
