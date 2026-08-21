import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'dim';
export type AccentColor = '#1a5cff' | '#7c3aed' | '#059669' | '#dc2626';

interface ThemeState {
  mode: ThemeMode;
  accent: AccentColor;
}

const storedTheme = localStorage.getItem('motoshine_theme') as ThemeMode | null;
const storedAccent = localStorage.getItem('motoshine_accent') as AccentColor | null;

const initialState: ThemeState = {
  mode: storedTheme || 'light',
  accent: storedAccent || '#1a5cff',
};

// Apply theme on init
document.documentElement.setAttribute('data-theme', initialState.mode);

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
      document.documentElement.setAttribute('data-theme', action.payload);
      localStorage.setItem('motoshine_theme', action.payload);
    },
    setAccent(state, action: PayloadAction<AccentColor>) {
      state.accent = action.payload;
      localStorage.setItem('motoshine_accent', action.payload);
    },
  },
});

export const { setTheme, setAccent } = themeSlice.actions;
export default themeSlice.reducer;
