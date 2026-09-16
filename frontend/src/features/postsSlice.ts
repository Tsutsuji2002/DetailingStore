import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import postApi from '@/services/api/postApi';
import type { PostDto } from '@/services/api/postApi';
import type { Comment } from '@/types';

export type { PostDto };

interface PostsState {
  items: PostDto[];
  comments: Record<string, Comment[]>;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: PostsState = {
  items: [],
  comments: {},
  searchQuery: '',
  isLoading: false,
  error: null,
};

export const fetchPostsThunk = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { search?: string; tag?: string } | undefined, { rejectWithValue }) => {
    try {
      return await postApi.getPosts(params);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const createPostThunk = createAsyncThunk(
  'posts/createPost',
  async (dto: Parameters<typeof postApi.createPost>[0], { rejectWithValue }) => {
    try {
      return await postApi.createPost(dto);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const updatePostThunk = createAsyncThunk(
  'posts/updatePost',
  async ({ id, dto }: { id: string; dto: Parameters<typeof postApi.updatePost>[1] }, { rejectWithValue }) => {
    try {
      return await postApi.updatePost(id, dto);
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const deletePostThunk = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      await postApi.deletePost(id);
      return id;
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

export const likePostThunk = createAsyncThunk(
  'posts/likePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await postApi.likePost(id);
      return { id, likes: result.likes, isLiked: result.isLiked, likedUserIds: result.likedUserIds };
    } catch (e: any) {
      return rejectWithValue(e.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) { state.searchQuery = action.payload; },
    setComments(state, action: PayloadAction<{ postId: string; comments: Comment[] }>) {
      state.comments[action.payload.postId] = action.payload.comments;
    },
    addComment(state, action: PayloadAction<{ postId: string; comment: Comment }>) {
      if (!state.comments[action.payload.postId]) state.comments[action.payload.postId] = [];
      state.comments[action.payload.postId].unshift(action.payload.comment);
      const post = state.items.find(p => p.id === action.payload.postId);
      if (post) post.commentCount += 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPostsThunk.pending, state => { state.isLoading = true; state.error = null; })
      .addCase(fetchPostsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPostsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPostThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePostThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deletePostThunk.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      })
      .addCase(likePostThunk.fulfilled, (state, action) => {
        const post = state.items.find(p => p.id === action.payload.id);
        if (post) {
          post.likes = action.payload.likes;
          post.likedUserIds = action.payload.likedUserIds;
          post.isLikedByCurrentUser = action.payload.isLiked;
        }
      });
  },
});

export const { setSearch, setComments, addComment } = postsSlice.actions;
export default postsSlice.reducer;
