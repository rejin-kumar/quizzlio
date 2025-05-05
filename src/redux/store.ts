import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    settings: settingsReducer
  },
  // No middleware for persistence as requested
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;