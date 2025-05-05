import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setJoiningGame } from '../../redux/slices/gameSlice';
import { setPlayerName } from '../../redux/slices/settingsSlice';
import Input from '../ui/Input';
import Button from '../ui/Button';
import socketService from '../../services/socketService';

interface JoinGameProps {
  disabled?: boolean;
}

const JoinGame: React.FC<JoinGameProps> = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const [gameCode, setGameCode] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    gameCode?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors: { name?: string; gameCode?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!gameCode.trim()) {
      newErrors.gameCode = 'Game code is required';
    } else if (gameCode.trim().length !== 4) {
      newErrors.gameCode = 'Game code must be 4 characters';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors
    setErrors({});
    
    // Update player name in settings
    dispatch(setPlayerName(name));
    
    // Set joining game status
    dispatch(setJoiningGame());
    
    // Join game via socket
    socketService.joinGame(gameCode.toUpperCase(), name);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Join a Game</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        
        <Input
          label="Game Code"
          placeholder="Enter 4-character code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value.toUpperCase())}
          error={errors.gameCode}
          required
          maxLength={4}
        />
        
        <Button
          type="submit"
          fullWidth
          className="mt-4"
          disabled={disabled}
        >
          {disabled ? 'Joining...' : 'Join Game'}
        </Button>
      </form>
    </div>
  );
};

export default JoinGame;