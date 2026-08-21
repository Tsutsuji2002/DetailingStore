import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Post, Comment } from '@/types';
import { SAMPLE_POSTS } from '@/data/sampleData';

interface PostsState {
  items: Post[];
  comments: Record<string, Comment[]>;
  searchQuery: string;
  isLoading: boolean;
}

const initialState: PostsState = {
  items: SAMPLE_POSTS,
  comments: {},
  searchQuery: '',
  isLoading: false,
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) { state.searchQuery = action.payload; },
    setPosts(state, action: PayloadAction<Post[]>) { state.items = action.payload; },
    addPost(state, action: PayloadAction<Post>) { state.items.unshift(action.payload); },
    updatePost(state, action: PayloadAction<Post>) {
      const idx = state.items.findIndex(p => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    deletePost(state, action: PayloadAction<string>) {
      state.items = state.items.filter(p => p.id !== action.payload);
    },
    toggleLike(state, action: PayloadAction<string>) {
      const post = state.items.find(p => p.id === action.payload);
      if (post) {
        post.isLiked = !post.isLiked;
        post.likes += post.isLiked ? 1 : -1;
      }
    },
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
});

export const { setSearch, setPosts, addPost, updatePost, deletePost, toggleLike, setComments, addComment } = postsSlice.actions;
export default postsSlice.reducer;
