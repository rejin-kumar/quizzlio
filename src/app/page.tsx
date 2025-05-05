'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import GameRouter from '@/components/game/GameRouter';

// Prevent hydration issues with server vs client rendering
const AppWithProvider = () => (
  <Provider store={store}>
    <GameRouter />
  </Provider>
);

// Prevent hydration issues with server components
const App = dynamic(() => Promise.resolve(AppWithProvider), { ssr: false });

export default function Home() {
  return <App />;
}
