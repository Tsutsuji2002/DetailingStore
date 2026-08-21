import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { ShopInfo } from '@/types';
import { SHOP_INFO as DEFAULT_SHOP_INFO } from '@/data/sampleData';
import { contentApi, UpdateContentRequest } from '@/services/api/contentApi';

export interface HeroSlide {
  id: number | string;
  tag: string;
  title: string;
  desc: string;
  img: string;
}

const LOCAL_STORAGE_KEY = 'detailing_shop_info';

const loadShopInfo = (): ShopInfo => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SHOP_INFO, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load shop info from localStorage', e);
  }
  return DEFAULT_SHOP_INFO;
};

interface ShopState {
  info: ShopInfo;
  heroSlides: HeroSlide[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ShopState = {
  info: loadShopInfo(),
  heroSlides: [
    { id: 1, tag: '✨ Dịch Vụ Nổi Bật', title: 'Detailing Xe Máy Cao Cấp Tại TP.HCM', desc: 'Phủ Ceramic, đánh bóng sơn, vệ sinh khoang máy chuyên sâu.', img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&q=80' },
    { id: 2, tag: '🔧 Sửa Chữa & Bảo Dưỡng', title: 'Kỹ Thuật Chuyên Sâu - Bảo Hành Tận Tâm', desc: 'Đội ngũ thợ 10+ năm kinh nghiệm.', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&q=80' },
  ],
  isLoading: false,
  error: null,
};

export const fetchShopContentThunk = createAsyncThunk(
  'shop/fetchContent',
  async (_, { rejectWithValue }) => {
    try {
      const data = await contentApi.getContent();
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể lấy thông tin website.');
    }
  }
);

export const updateShopContentThunk = createAsyncThunk(
  'shop/updateContent',
  async (payload: UpdateContentRequest, { rejectWithValue }) => {
    try {
      const res = await contentApi.updateContent(payload);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Không thể cập nhật nội dung website.');
    }
  }
);

export const shopSlice = createSlice({
  name: 'shop',
  initialState,
  reducers: {
    updateShopInfo: (state, action: PayloadAction<Partial<ShopInfo>>) => {
      state.info = { ...state.info, ...action.payload };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
      } catch (e) {
        console.error('Failed to save shop info to localStorage', e);
      }
    },
    resetShopInfo: (state) => {
      state.info = DEFAULT_SHOP_INFO;
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchShopContentThunk.fulfilled, (state, action) => {
      const data = action.payload;
      state.info = {
        ...state.info,
        name: data.shopName || state.info.name,
        tagline: data.tagline || state.info.tagline,
        logoUrl: data.logoUrl || undefined,
        logoIcon: data.logoIcon || state.info.logoIcon || '🏍️',
      };
      try {
        if (data.heroSlidesJson) {
          const parsed = JSON.parse(data.heroSlidesJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            state.heroSlides = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse heroSlidesJson', e);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
    });

    builder.addCase(updateShopContentThunk.fulfilled, (state, action) => {
      const data = action.payload.content;
      state.info = {
        ...state.info,
        name: data.shopName || state.info.name,
        tagline: data.tagline || state.info.tagline,
        logoUrl: data.logoUrl || undefined,
        logoIcon: data.logoIcon || state.info.logoIcon || '🏍️',
      };
      try {
        if (data.heroSlidesJson) {
          const parsed = JSON.parse(data.heroSlidesJson);
          if (Array.isArray(parsed)) {
            state.heroSlides = parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse heroSlidesJson', e);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state.info));
    });
  },
});

export const { updateShopInfo, resetShopInfo } = shopSlice.actions;
export default shopSlice.reducer;
