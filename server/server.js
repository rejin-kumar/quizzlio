const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Update CORS settings for production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? ['https://quizzlio.vercel.app', process.env.CORS_ORIGIN].filter(Boolean)
  : ['http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if(!origin) return callback(null, true);
    
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store active game sessions (no persistence as per request)
const gameRooms = new Map();

// Function to generate a unique 4-character game code
function generateGameCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // If code already exists, generate a new one
  if (gameRooms.has(code)) {
    return generateGameCode();
  }
  
  return code;
}

// Fetch questions from the Open Trivia DB API
async function fetchTriviaQuestions(settings) {
  try {
    // Build API URL with parameters
    let apiUrl = `https://opentdb.com/api.php?amount=${settings.amount || 10}`;
    
    if (settings.category && settings.category !== 'any') {
      apiUrl += `&category=${settings.category}`;
    }
    
    if (settings.difficulty && settings.difficulty !== 'any') {
      apiUrl += `&difficulty=${settings.difficulty.toLowerCase()}`;
    }
    
    if (settings.type && settings.type !== 'any') {
      apiUrl += `&type=${settings.type.toLowerCase()}`;
    }
    
    console.log(`Fetching trivia questions with URL: ${apiUrl}`);
    
    // Make the request with a timeout
    const response = await axios.get(apiUrl, {
      timeout: 15000 // 15-second timeout
    });
    
    // Handle response based on response code
    switch (response.data.response_code) {
      case 0: // Success
        console.log(`Successfully fetched ${response.data.results.length} questions`);
        return { 
          success: true, 
          questions: response.data.results.map((q, index) => ({ 
            ...q,
            id: index + 1,
            all_answers: shuffle([...q.incorrect_answers, q.correct_answer])
          }))
        };
        
      case 1: // No results
        console.error('No results found with current parameters');
        return { success: false, error: 'No questions available for these settings. Try different options.' };
        
      case 2: // Invalid parameter
        console.error('Invalid API parameters');
        return { success: false, error: 'Invalid settings parameters.' };
        
      default:
        console.error(`Unknown response code: ${response.data.response_code}`);
        return { success: false, error: 'Unknown API error. Please try again.' };
    }
  } catch (error) {
    console.error('Error fetching trivia questions:', error.message);
    
    // More specific error messages based on the error type
    if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Connection timeout. The trivia server might be experiencing high traffic.' };
    } else if (error.response) {
      return { success: false, error: `API error: ${error.response.status} - ${error.response.statusText}` };
    } else if (error.request) {
      return { success: false, error: 'No response from trivia server. Please check your internet connection.' };
    } else {
      return { success: false, error: 'Failed to fetch trivia questions. Please try again.' };
    }
  }
}

// Helper function to shuffle an array (for answer choices)
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Admin creates a new game room
  socket.on('create_game', async (settings) => {
    try {
      const gameCode = generateGameCode();
      console.log(`Creating new game with code: ${gameCode}`);
      
      // Fetch questions based on settings
      const result = await fetchTriviaQuestions(settings);
      
      if (!result.success) {
        socket.emit('game_error', { message: result.error || 'Failed to fetch trivia questions. Please try again.' });
        return;
      }
      
      // Create game room
      const gameRoom = {
        gameCode,
        admin: socket.id,
        settings,
        questions: result.questions,
        players: [{
          id: socket.id,
          isAdmin: true,
          name: settings.adminName || 'Admin',
          score: 0,
          answers: []
        }],
        currentQuestion: -1,
        status: 'lobby',
        timer: null,
        currentResults: null
      };
      
      gameRooms.set(gameCode, gameRoom);
      console.log(`Game room created: ${gameCode}, admin: ${socket.id}`);
      console.log(`Active game rooms: ${Array.from(gameRooms.keys()).join(', ')}`);
      
      // Join socket to the room
      socket.join(gameCode);
      
      // Emit game created event
      socket.emit('game_created', { 
        gameCode,
        isAdmin: true,
        questionCount: result.questions.length
      });
      
      // Emit player list to all in the room
      io.to(gameCode).emit('player_list_updated', {
        players: gameRoom.players.map(p => ({ id: p.id, name: p.name, score: p.score, isAdmin: p.isAdmin }))
      });
      
    } catch (error) {
      console.error('Error creating game:', error);
      socket.emit('game_error', { message: 'Failed to create game. Please try again.' });
    }
  });
  
  // Player joins a game room
  socket.on('join_game', (data) => {
    try {
      const { gameCode, playerName } = data;
      console.log(`Player ${playerName} (${socket.id}) attempting to join game: ${gameCode}`);
      
      // Check if game exists
      if (!gameRooms.has(gameCode)) {
        console.log(`Game not found: ${gameCode}`);
        socket.emit('game_error', { message: 'Game not found. Check your game code and try again.' });
        return;
      }
      
      const gameRoom = gameRooms.get(gameCode);
      
      // Check if game is in progress
      if (gameRoom.status !== 'lobby') {
        console.log(`Game ${gameCode} already in progress`);
        socket.emit('game_error', { message: 'Game already in progress. You cannot join at this time.' });
        return;
      }
      
      // Check if player limit is reached (10 players max)
      if (gameRoom.players.length >= 10) {
        console.log(`Game ${gameCode} is full`);
        socket.emit('game_error', { message: 'Game is full. Please try another game or create your own.' });
        return;
      }
      
      // Add player to game
      const newPlayer = {
        id: socket.id,
        name: playerName,
        score: 0,
        isAdmin: false,
        answers: []
      };
      
      gameRoom.players.push(newPlayer);
      console.log(`Player ${playerName} (${socket.id}) joined game ${gameCode}`);
      
      // Join socket to the room
      socket.join(gameCode);
      
      // Emit join success to player
      socket.emit('game_joined', { 
        gameCode,
        isAdmin: false,
        questionCount: gameRoom.questions.length
      });
      
      // Emit player list to all in the room
      io.to(gameCode).emit('player_list_updated', {
        players: gameRoom.players.map(p => ({ id: p.id, name: p.name, score: p.score, isAdmin: p.isAdmin }))
      });
      
    } catch (error) {
      console.error('Error joining game:', error);
      socket.emit('game_error', { message: 'Failed to join game. Please try again.' });
    }
  });
  
  // Admin starts the game
  socket.on('start_game', ({ gameCode }) => {
    try {
      console.log(`Attempt to start game ${gameCode} by socket ${socket.id}`);
      
      // Check if game exists and user is admin
      if (!gameRooms.has(gameCode)) {
        socket.emit('game_error', { message: 'Game not found.' });
        return;
      }
      
      const gameRoom = gameRooms.get(gameCode);
      
      if (gameRoom.admin !== socket.id) {
        socket.emit('game_error', { message: 'Only the admin can start the game.' });
        return;
      }
      
      if (gameRoom.status !== 'lobby') {
        socket.emit('game_error', { message: 'Game already in progress.' });
        return;
      }
      
      // Update game status
      gameRoom.status = 'playing';
      gameRoom.currentQuestion = 0;
      console.log(`Game ${gameCode} started by admin ${socket.id}`);
      
      // Send first question to all players
      sendNextQuestion(gameCode);
      
    } catch (error) {
      console.error('Error starting game:', error);
      socket.emit('game_error', { message: 'Failed to start game. Please try again.' });
    }
  });
  
  // Player submits an answer
  socket.on('submit_answer', ({ gameCode, answer, timeRemaining }) => {
    try {
      if (!gameRooms.has(gameCode)) {
        socket.emit('game_error', { message: 'Game not found.' });
        return;
      }
      
      const gameRoom = gameRooms.get(gameCode);
      
      if (gameRoom.status !== 'playing') {
        socket.emit('game_error', { message: 'Game is not in progress.' });
        return;
      }
      
      const playerIndex = gameRoom.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex === -1) {
        socket.emit('game_error', { message: 'Player not found in this game.' });
        return;
      }
      
      const currentQuestion = gameRoom.questions[gameRoom.currentQuestion];
      const isCorrect = answer === currentQuestion.correct_answer;
      
      // Calculate score based on time remaining
      // Scoring formula: correct answer scores points proportional to time remaining
      const scoreForAnswer = isCorrect ? Math.ceil(timeRemaining * 10) : 0;
      
      // Update player's score and mark as answered
      gameRoom.players[playerIndex].score += scoreForAnswer;
      gameRoom.players[playerIndex].answers[gameRoom.currentQuestion] = {
        answer,
        isCorrect,
        scoreGained: scoreForAnswer,
        timeRemaining
      };
      
      console.log(`Player ${gameRoom.players[playerIndex].name} answered question ${gameRoom.currentQuestion + 1} in game ${gameCode}. Correct: ${isCorrect}, Score: +${scoreForAnswer}`);
      
      // Emit to player that their answer was received
      socket.emit('answer_submitted', {
        isCorrect,
        correctAnswer: currentQuestion.correct_answer,
        scoreGained: scoreForAnswer
      });
      
      // Check if all players have answered
      const allAnswered = gameRoom.players.every(player => 
        player.answers[gameRoom.currentQuestion]
      );
      
      if (allAnswered) {
        console.log(`All players answered question ${gameRoom.currentQuestion + 1} in game ${gameCode}. Moving to results.`);
        // Clear timer if all players answered before time ran out
        if (gameRoom.timer) {
          clearTimeout(gameRoom.timer);
          gameRoom.timer = null;
        }
        
        // Show results after all players answered
        showQuestionResults(gameCode);
      }
      
    } catch (error) {
      console.error('Error submitting answer:', error);
      socket.emit('game_error', { message: 'Failed to submit answer. Please try again.' });
    }
  });
  
  // Admin requests next question
  socket.on('next_question', ({ gameCode }) => {
    try {
      if (!gameRooms.has(gameCode)) {
        socket.emit('game_error', { message: 'Game not found.' });
        return;
      }
      
      const gameRoom = gameRooms.get(gameCode);
      
      if (gameRoom.admin !== socket.id) {
        socket.emit('game_error', { message: 'Only the admin can advance to the next question.' });
        return;
      }
      
      if (gameRoom.status !== 'results') {
        socket.emit('game_error', { message: 'Cannot advance to next question at this time.' });
        return;
      }
      
      gameRoom.currentQuestion++;
      
      if (gameRoom.currentQuestion >= gameRoom.questions.length) {
        // End of game
        console.log(`All questions completed in game ${gameCode}. Ending game.`);
        endGame(gameCode);
      } else {
        // Next question
        console.log(`Moving to next question (${gameRoom.currentQuestion + 1}/${gameRoom.questions.length}) in game ${gameCode}`);
        gameRoom.status = 'playing';
        sendNextQuestion(gameCode);
      }
    } catch (error) {
      console.error('Error moving to next question:', error);
      socket.emit('game_error', { message: 'Failed to advance to next question.' });
    }
  });

  // Player leaves the game
  socket.on('leave_game', ({ gameCode }) => {
    try {
      if (!gameRooms.has(gameCode)) return;
      
      const gameRoom = gameRooms.get(gameCode);
      const playerIndex = gameRoom.players.findIndex(p => p.id === socket.id);
      
      if (playerIndex === -1) return;
      
      handlePlayerLeave(socket.id, gameCode);
      
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find games where the player is a participant
    for (const [gameCode, gameRoom] of gameRooms.entries()) {
      if (gameRoom.players.some(p => p.id === socket.id)) {
        handlePlayerLeave(socket.id, gameCode);
      }
    }
  });
});

// Helper function to handle player leaving
function handlePlayerLeave(socketId, gameCode) {
  const gameRoom = gameRooms.get(gameCode);
  if (!gameRoom) return;
  
  const playerIndex = gameRoom.players.findIndex(p => p.id === socketId);
  if (playerIndex === -1) return;
  
  const playerName = gameRoom.players[playerIndex].name;
  console.log(`Player ${playerName} (${socketId}) left game ${gameCode}`);
  
  // Remove player from game
  gameRoom.players.splice(playerIndex, 1);
  
  // If admin left, either assign new admin or end game
  if (gameRoom.admin === socketId) {
    if (gameRoom.players.length > 0) {
      // Assign new admin
      gameRoom.admin = gameRoom.players[0].id;
      gameRoom.players[0].isAdmin = true;
      console.log(`New admin assigned in game ${gameCode}: ${gameRoom.players[0].name} (${gameRoom.admin})`);
      
      // Notify new admin
      io.to(gameRoom.admin).emit('admin_assigned');
    } else {
      // No players left, remove the game
      console.log(`Removing empty game ${gameCode}`);
      
      // Clear any active timers
      if (gameRoom.timer) {
        clearTimeout(gameRoom.timer);
      }
      
      gameRooms.delete(gameCode);
      return;
    }
  }
  
  // Update player list for remaining players
  if (gameRoom.players.length > 0) {
    io.to(gameCode).emit('player_list_updated', {
      players: gameRoom.players.map(p => ({ id: p.id, name: p.name, score: p.score, isAdmin: p.isAdmin }))
    });
  }
}

// Helper function to send next question to all players
function sendNextQuestion(gameCode) {
  const gameRoom = gameRooms.get(gameCode);
  
  if (!gameRoom) return;
  
  const question = gameRoom.questions[gameRoom.currentQuestion];
  
  if (!question) {
    // End of game
    endGame(gameCode);
    return;
  }
  
  // Create question data with shuffled answers from the pre-shuffled all_answers
  const questionData = {
    question: question.question,
    answers: question.all_answers,
    category: question.category,
    difficulty: question.difficulty,
    questionNumber: gameRoom.currentQuestion + 1,
    totalQuestions: gameRoom.questions.length,
    timeLimit: gameRoom.settings.timePerQuestion || 15
  };
  
  console.log(`Sending question ${gameRoom.currentQuestion + 1}/${gameRoom.questions.length} to game ${gameCode}`);
  
  // Send question to all players
  io.to(gameCode).emit('new_question', questionData);
  
  // Set timer for question
  const timeLimit = gameRoom.settings.timePerQuestion * 1000 || 15000;
  gameRoom.questionStartTime = Date.now();
  
  gameRoom.timer = setTimeout(() => {
    console.log(`Time expired for question ${gameRoom.currentQuestion + 1} in game ${gameCode}`);
    showQuestionResults(gameCode);
  }, timeLimit);
}

// Helper function to show question results
function showQuestionResults(gameCode) {
  const gameRoom = gameRooms.get(gameCode);
  
  if (!gameRoom) return;
  
  // Clear timer if it exists
  if (gameRoom.timer) {
    clearTimeout(gameRoom.timer);
    gameRoom.timer = null;
  }
  
  const currentQuestionIndex = gameRoom.currentQuestion;
  const currentQuestion = gameRoom.questions[currentQuestionIndex];
  
  // Create results data
  const resultsData = {
    question: currentQuestion.question,
    correctAnswer: currentQuestion.correct_answer,
    playerAnswers: gameRoom.players.map(player => ({
      playerId: player.id,
      playerName: player.name,
      answer: player.answers[currentQuestionIndex]?.answer || null,
      isCorrect: player.answers[currentQuestionIndex]?.isCorrect || false,
      scoreGained: player.answers[currentQuestionIndex]?.scoreGained || 0,
      totalScore: player.score
    })),
    leaderboard: [...gameRoom.players]
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        playerName: player.name,
        score: player.score
      }))
  };
  
  // Update game status
  gameRoom.status = 'results';
  
  console.log(`Showing results for question ${currentQuestionIndex + 1} in game ${gameCode}`);
  
  // Send results to all players
  io.to(gameCode).emit('question_results', resultsData);
}

// Helper function to end the game and show final results
function endGame(gameCode) {
  const gameRoom = gameRooms.get(gameCode);
  
  if (!gameRoom) return;
  
  // Update game status
  gameRoom.status = 'ended';
  console.log(`Game ${gameCode} ended. Final scores:`);
  
  // Sort players by score for final ranking
  const finalLeaderboard = [...gameRoom.players]
    .sort((a, b) => b.score - a.score)
    .map((player, index) => ({
      rank: index + 1,
      playerId: player.id,
      playerName: player.name,
      score: player.score
    }));
    
  finalLeaderboard.forEach(player => {
    console.log(`${player.rank}. ${player.playerName}: ${player.score} points`);
  });
  
  // Send final results to all players
  io.to(gameCode).emit('game_ended', {
    leaderboard: finalLeaderboard
  });
}

// Server endpoint to get trivia categories
app.get('/api/categories', async (req, res) => {
  try {
    const response = await axios.get('https://opentdb.com/api_category.php');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});