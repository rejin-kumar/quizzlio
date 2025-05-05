# Quizzlio - Multiplayer Trivia Game

Quizzlio is a real-time multiplayer trivia game built with Next.js, Socket.IO, and Redux. Players can create and join game sessions, answer trivia questions, and compete for the highest score.

## Features

- **Real-time Multiplayer**: Play with up to 10 players simultaneously
- **Game Sessions**: Create or join game sessions using unique game codes
- **Customizable Settings**: Configure questions, categories, difficulty, and time limits
- **Dynamic Scoring**: Score points based on how quickly correct answers are submitted 
- **Live Leaderboard**: See real-time rankings after each question
- **Responsive Design**: Play on any device with a clean, modern UI

## Tech Stack

- **Frontend**: 
  - Next.js (React)
  - TypeScript
  - Redux Toolkit for state management
  - TailwindCSS for styling
  - Socket.IO Client for real-time communication

- **Backend**: 
  - Express.js
  - Socket.IO for WebSocket communication
  - Open Trivia DB API for trivia questions

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/quizzlio.git
   cd quizzlio
   ```

2. Install dependencies
   ```bash
   npm install
   ```

### Running the Application

You can run both the frontend and backend simultaneously using:

```bash
npm run dev:all
```

Or run them separately:

- Frontend: `npm run dev`
- Backend: `npm run server` (or `npm run dev:server` for development with auto-reload)

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## How to Play

1. **Create a Game**:
   - Click "Create Game"
   - Enter your name
   - Configure game settings (questions, category, difficulty, time)
   - Share the generated game code with friends

2. **Join a Game**:
   - Click "Join Game"
   - Enter your name and the 4-character game code
   - Wait for the admin to start the game

3. **During Gameplay**:
   - Answer questions as quickly as possible
   - Correct answers earn points based on remaining time
   - View results and leaderboard after each question
   - Final results and winner announced at the end

## Game Configuration Options

- **Number of Questions**: 1-50
- **Category**: Select from various trivia categories
- **Difficulty**: Easy, Medium, Hard, or Any
- **Question Type**: Multiple Choice, True/False, or Any
- **Time per Question**: 5-60 seconds

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Open Trivia Database](https://opentdb.com/) for providing the trivia questions API
