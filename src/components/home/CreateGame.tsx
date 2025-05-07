import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { setCreatingGame } from '../../redux/slices/gameSlice';
import {
  setAdminName,
  setQuestionAmount,
  setCategory,
  setDifficulty,
  setType,
  setTimePerQuestion,
  setLoadingCategories,
  setCategories,
} from '../../redux/slices/settingsSlice';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import socketService from '../../services/socketService';
import axios from 'axios';

interface CreateGameProps {
  disabled?: boolean;
}

const CreateGame: React.FC<CreateGameProps> = ({ disabled = false }) => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings);
  
  const [errors, setErrors] = useState<{
    adminName?: string;
    amount?: string;
    timePerQuestion?: string;
  }>({});

  // Fetch trivia categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      if (settings.categories.length === 0 && !settings.isLoadingCategories) {
        dispatch(setLoadingCategories(true));
        
        try {
          const response = await axios.get('http://localhost:5000/api/categories');
          dispatch(setCategories(response.data.trivia_categories));
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      }
    };
    
    fetchCategories();
  }, [dispatch, settings.categories.length, settings.isLoadingCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors: {
      adminName?: string;
      amount?: string;
      timePerQuestion?: string;
    } = {};
    
    if (!settings.adminName.trim()) {
      newErrors.adminName = 'Name is required';
    }
    
    if (settings.amount < 1 || settings.amount > 50) {
      newErrors.amount = 'Questions must be between 1 and 50';
    }
    
    if (settings.timePerQuestion < 5 || settings.timePerQuestion > 60) {
      newErrors.timePerQuestion = 'Time per question must be between 5 and 60 seconds';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors and create game
    setErrors({});
    
    // Set creating game state
    dispatch(setCreatingGame());
    
    // Emit create game event via socket
    socketService.createGame({
      adminName: settings.adminName,
      amount: settings.amount,
      category: settings.category,
      difficulty: settings.difficulty,
      type: settings.type,
      timePerQuestion: settings.timePerQuestion,
    });
  };

  // Generate difficulty options
  const difficultyOptions = [
    { value: 'any', label: 'Any Difficulty' },
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  // Generate question type options
  const typeOptions = [
    { value: 'any', label: 'Any Type' },
    { value: 'multiple', label: 'Multiple Choice' },
    { value: 'boolean', label: 'True / False' },
  ];

  // Generate category options
  const categoryOptions = [
    { value: 'any', label: 'Any Category' },
    ...settings.categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.name,
    })),
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create a New Game</h2>
      <form onSubmit={handleSubmit}>
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={settings.adminName}
          onChange={(e) => dispatch(setAdminName(e.target.value))}
          error={errors.adminName}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Number of Questions"
            value={settings.amount}
            onChange={(e) => dispatch(setQuestionAmount(parseInt(e.target.value) || 10))}
            min={1}
            max={50}
            error={errors.amount}
            required
          />
          
          <Input
            type="number"
            label="Seconds per Question"
            value={settings.timePerQuestion}
            onChange={(e) => dispatch(setTimePerQuestion(parseInt(e.target.value) || 15))}
            min={5}
            max={60}
            error={errors.timePerQuestion}
            required
          />
        </div>
        
        <Select
          label="Category"
          value={settings.category}
          onChange={(e) => dispatch(setCategory(e.target.value))}
          options={categoryOptions}
          disabled={settings.isLoadingCategories}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Difficulty"
            value={settings.difficulty}
            onChange={(e) => dispatch(setDifficulty(e.target.value as 'any' | 'easy' | 'medium' | 'hard'))}
            options={difficultyOptions}
          />
          
          <Select
            label="Question Type"
            value={settings.type}
            onChange={(e) => dispatch(setType(e.target.value as 'any' | 'multiple' | 'boolean'))}
            options={typeOptions}
          />
        </div>
        
        <Button 
          type="submit" 
          fullWidth 
          className="mt-4"
          disabled={disabled || settings.isLoadingCategories}
        >
          {disabled ? 'Creating Game...' : 'Create Game'}
        </Button>
      </form>
    </div>
  );
};

export default CreateGame;