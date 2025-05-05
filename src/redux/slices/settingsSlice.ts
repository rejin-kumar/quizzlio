import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: number;
  name: string;
}

interface SettingsState {
  amount: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'any';
  type: 'multiple' | 'boolean' | 'any';
  timePerQuestion: number;
  adminName: string;
  playerName: string;
  categories: Category[];
  isLoadingCategories: boolean;
}

const initialState: SettingsState = {
  amount: 10,
  category: 'any',
  difficulty: 'any',
  type: 'any',
  timePerQuestion: 15,
  adminName: '',
  playerName: '',
  categories: [],
  isLoadingCategories: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setQuestionAmount: (state, action: PayloadAction<number>) => {
      state.amount = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setDifficulty: (state, action: PayloadAction<'easy' | 'medium' | 'hard' | 'any'>) => {
      state.difficulty = action.payload;
    },
    setType: (state, action: PayloadAction<'multiple' | 'boolean' | 'any'>) => {
      state.type = action.payload;
    },
    setTimePerQuestion: (state, action: PayloadAction<number>) => {
      state.timePerQuestion = action.payload;
    },
    setAdminName: (state, action: PayloadAction<string>) => {
      state.adminName = action.payload;
    },
    setPlayerName: (state, action: PayloadAction<string>) => {
      state.playerName = action.payload;
    },
    setLoadingCategories: (state, action: PayloadAction<boolean>) => {
      state.isLoadingCategories = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.isLoadingCategories = false;
    },
    resetSettings: () => initialState,
  },
});

export const {
  setQuestionAmount,
  setCategory,
  setDifficulty,
  setType,
  setTimePerQuestion,
  setAdminName,
  setPlayerName,
  setLoadingCategories,
  setCategories,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;