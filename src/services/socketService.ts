import { io, Socket } from 'socket.io-client';
import { store } from '../redux/store';
import {
  setGameCreated,
  setGameJoined,
  updatePlayerList,
  setNewQuestion,
  setQuestionResults,
  setGameEnded,
  setError,
  setGameStarted,
  resetGame
} from '../redux/slices/gameSlice';

// Define interfaces for socket event payloads
interface GameCreatedPayload {
  gameCode: string;
  isAdmin: boolean;
  questionCount: number;
}

interface GameJoinedPayload {
  gameCode: string;
  isAdmin: boolean;
  questionCount: number;
}

interface PlayerListPayload {
  players: Array<{
    id: string;
    name: string;
    score: number;
    isAdmin: boolean;
  }>;
}

interface QuestionPayload {
  question: string;
  answers: string[];
  category: string;
  difficulty: string;
  questionNumber: number;
  totalQuestions: number;
  timeLimit: number;
}

interface QuestionResultsPayload {
  question: string;
  correctAnswer: string;
  playerAnswers: Array<{
    playerId: string;
    playerName: string;
    answer: string | null;
    isCorrect: boolean;
    scoreGained: number;
    totalScore: number;
  }>;
  leaderboard: Array<{
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
  }>;
}

interface GameEndedPayload {
  leaderboard: Array<{
    rank: number;
    playerId: string;
    playerName: string;
    score: number;
  }>;
}

interface GameErrorPayload {
  message: string;
}

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private dispatch = store.dispatch;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  // Initialize and connect socket
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      // If already connected, disconnect first
      if (this.socket && this.socket.connected) {
        this.socket.disconnect();
      }

      // Get socket server URL based on environment
      const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      console.log('Connecting to socket server at:', socketUrl);

      // Connect to the server
      this.socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true
      });

      this.socket.on('connect', () => {
        console.log('Connected to socket server with ID:', this.socket?.id);
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });
    });
  }

  // Set up socket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Game created event
    this.socket.on('game_created', (data: GameCreatedPayload) => {
      console.log('Game created:', data);
      this.dispatch(setGameCreated({ 
        gameCode: data.gameCode, 
        isAdmin: data.isAdmin
      }));
    });

    // Game joined event
    this.socket.on('game_joined', (data: GameJoinedPayload) => {
      console.log('Game joined:', data);
      this.dispatch(setGameJoined({ 
        gameCode: data.gameCode, 
        isAdmin: data.isAdmin
      }));
    });

    // Player list updated
    this.socket.on('player_list_updated', (data: PlayerListPayload) => {
      console.log('Player list updated:', data);
      this.dispatch(updatePlayerList({ players: data.players }));
    });

    // New question
    this.socket.on('new_question', (data: QuestionPayload) => {
      console.log('New question received:', data);
      this.dispatch(setGameStarted());
      this.dispatch(setNewQuestion(data));
    });

    // Question results
    this.socket.on('question_results', (data: QuestionResultsPayload) => {
      console.log('Question results received:', data);
      this.dispatch(setQuestionResults(data));
    });

    // Game ended
    this.socket.on('game_ended', (data: GameEndedPayload) => {
      console.log('Game ended:', data);
      this.dispatch(setGameEnded({ leaderboard: data.leaderboard }));
    });

    // Game error handling
    this.socket.on('game_error', (data: GameErrorPayload) => {
      console.error('Game error:', data.message);
      this.dispatch(setError(data.message));
    });

    // Admin assignment (if previous admin left)
    this.socket.on('admin_assigned', () => {
      console.log('You have been assigned as the admin');
      // Update UI to show admin controls
      const state = store.getState();
      this.dispatch(setGameCreated({
        gameCode: state.game.gameCode || '', 
        isAdmin: true
      }));
    });
  }

  // Create a new game
  createGame(settings: any): void {
    if (!this.socket) return;
    console.log('Creating game with settings:', settings);
    this.socket.emit('create_game', settings);
  }

  // Join an existing game
  joinGame(gameCode: string, playerName: string): void {
    if (!this.socket) return;
    console.log('Joining game:', gameCode, 'as', playerName);
    this.socket.emit('join_game', { gameCode, playerName });
  }

  // Start the game (admin only)
  startGame(gameCode: string): void {
    if (!this.socket) return;
    console.log('Starting game:', gameCode);
    this.socket.emit('start_game', { gameCode });
  }

  // Submit an answer
  submitAnswer(gameCode: string, answer: string, timeRemaining: number): void {
    if (!this.socket) return;
    console.log('Submitting answer:', answer, 'with time remaining:', timeRemaining);
    this.socket.emit('submit_answer', { gameCode, answer, timeRemaining });
  }

  // Request the next question (admin only)
  nextQuestion(gameCode: string) {
    if (!this.socket) return;
    console.log('Requesting next question for game:', gameCode);
    this.socket?.emit('next_question', { gameCode });
  }
  
  // Leave the current game
  leaveGame(gameCode: string) {
    if (this.socket) {
      console.log('Leaving game:', gameCode);
      this.socket.emit('leave_game', { gameCode });
    }
  }

  // Clear session data
  clearSession(): void {
    console.log('Clearing session data');
    this.dispatch(resetGame());
    // If connected, disconnect from socket
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket.connect(); // Reconnect to have a fresh session
    }
  }

  // Check connection status
  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Disconnect and clean up
  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    console.log('Disconnected from server');
  }
}

// Create a singleton instance
const socketService = SocketService.getInstance();

export default socketService;