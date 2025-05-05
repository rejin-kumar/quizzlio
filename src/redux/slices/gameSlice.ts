import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Player {
  id: string;
  name: string;
  score: number;
  isAdmin: boolean;
}

export interface Question {
  question: string;
  answers: string[];
  category: string;
  difficulty: string;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
}

export interface QuestionResult {
  question: string;
  correctAnswer: string;
  playerAnswers: {
    playerId: string;
    playerName: string;
    answer: string | null;
    isCorrect: boolean;
    scoreGained: number;
    totalScore: number;
  }[];
  leaderboard: {
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
  }[];
}

interface GameState {
  gameCode: string | null;
  isAdmin: boolean;
  status: 'idle' | 'creating' | 'joining' | 'joined' | 'lobby' | 'playing' | 'results' | 'ended';
  players: Player[];
  error: string | null;
  currentQuestion: Question | null;
  questionResults: QuestionResult | null;
  finalLeaderboard: {
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
  }[] | null;
  timeRemaining: number;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
}

const initialState: GameState = {
  gameCode: null,
  isAdmin: false,
  status: 'idle',
  players: [],
  error: null,
  currentQuestion: null,
  questionResults: null,
  finalLeaderboard: null,
  timeRemaining: 0,
  selectedAnswer: null,
  hasSubmitted: false
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setCreatingGame: (state) => {
      state.status = 'creating';
      state.error = null;
    },
    setGameCreated: (state, action: PayloadAction<{ gameCode: string; isAdmin: boolean }>) => {
      state.gameCode = action.payload.gameCode;
      state.isAdmin = action.payload.isAdmin;
      state.status = 'joined';
      state.error = null;
    },
    setJoiningGame: (state) => {
      state.status = 'joining';
      state.error = null;
    },
    setGameJoined: (state, action: PayloadAction<{ gameCode: string; isAdmin: boolean }>) => {
      state.gameCode = action.payload.gameCode;
      state.isAdmin = action.payload.isAdmin;
      state.status = 'joined';
      state.error = null;
    },
    updatePlayerList: (state, action: PayloadAction<{ players: Player[] }>) => {
      state.players = action.payload.players;
    },
    setGameStarted: (state) => {
      state.status = 'playing';
      state.error = null;
    },
    setNewQuestion: (state, action: PayloadAction<Question>) => {
      state.currentQuestion = action.payload;
      state.questionResults = null;
      state.selectedAnswer = null;
      state.hasSubmitted = false;
      state.timeRemaining = action.payload.timeLimit;
    },
    updateTimeRemaining: (state, action: PayloadAction<number | ((currentTime: number) => number)>) => {
      if (typeof action.payload === 'function') {
        state.timeRemaining = action.payload(state.timeRemaining);
      } else {
        state.timeRemaining = action.payload;
      }
    },
    selectAnswer: (state, action: PayloadAction<string>) => {
      state.selectedAnswer = action.payload;
    },
    submitAnswer: (state) => {
      state.hasSubmitted = true;
    },
    setQuestionResults: (state, action: PayloadAction<QuestionResult>) => {
      state.status = 'results';
      state.questionResults = action.payload;
    },
    setGameEnded: (state, action: PayloadAction<{ leaderboard: { rank: number; playerId: string; playerName: string; score: number; }[] }>) => {
      state.status = 'ended';
      state.finalLeaderboard = action.payload.leaderboard;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      
      // Reset status to idle if currently joining or creating
      if (state.status === 'joining' || state.status === 'creating') {
        state.status = 'idle';
      }
    },
    resetGame: () => {
      return initialState;
    },
  },
});

export const {
  setCreatingGame,
  setGameCreated,
  setJoiningGame,
  setGameJoined,
  updatePlayerList,
  setGameStarted,
  setNewQuestion,
  updateTimeRemaining,
  selectAnswer,
  submitAnswer,
  setQuestionResults,
  setGameEnded,
  setError,
  resetGame
} = gameSlice.actions;

export default gameSlice.reducer;