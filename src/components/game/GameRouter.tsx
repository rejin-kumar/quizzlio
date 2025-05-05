import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import HomePage from '../home/HomePage';
import LobbyPage from './LobbyPage';
import QuestionPage from './QuestionPage';
import ResultsPage from './ResultsPage';
import GameOver from './GameOver';

// This component acts as a router based on the game state
const GameRouter: React.FC = () => {
  const { status } = useSelector((state: RootState) => state.game);

  // This effect is used for debugging
  useEffect(() => {
    console.log('Current game status:', status);
  }, [status]);

  // Render appropriate component based on game status
  switch (status) {
    case 'joined':
      return <LobbyPage />;
    case 'playing':
      return <QuestionPage />;
    case 'results':
      return <ResultsPage />;
    case 'ended':
      return <GameOver />;
    case 'idle':
    case 'creating':
    case 'joining':
    default:
      return <HomePage />;
  }
};

export default GameRouter;