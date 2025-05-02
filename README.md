# 🎮 Quizzlio

**Quizzlio** is a real-time multiplayer trivia game inspired by **Skribbl.io**, where players compete by answering questions as quickly as possible. The faster you answer correctly, the higher your score!

---

## 🚀 Features

- 👥 Multiplayer game sessions (up to 10 players)
- 🧠 Real-time trivia powered by [Open Trivia DB](https://opentdb.com/)
- ⏱️ Timed questions and speed-based scoring
- 📊 Live leaderboard between rounds
- 🎨 Sleek UI with minimalistic gradients and subtle animations
- ⚙️ Admin controls: set number of questions, category, time per question, and number of rounds

---

## 📦 Tech Stack

- **Frontend**: React, TailwindCSS
- **Backend**: Node.js (Express or similar), WebSocket (e.g., Socket.IO)
- **API**: [Open Trivia DB](https://opentdb.com/api_config.php)
- **State Management**: Context API or Redux
- **Hosting**: Vercel / Netlify (Frontend), Render / Railway / Heroku (Backend)

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Clone the Repo
```bash
git clone https://github.com/your-username/quizzlio.git
cd quizzlio
```

### Install Dependencies
```bash
# For frontend
cd client
npm install

# For backend
cd ../server
npm install
```

### Run Locally
```bash
# In one terminal for backend
cd server
npm run dev

# In another terminal for frontend
cd client
npm start
```

---

## 🧪 Project Structure

```plaintext
trivia.io/
├── client/              # React frontend
│   ├── components/
│   ├── pages/
│   └── ...
├── server/              # Node.js backend with WebSocket
│   ├── routes/
│   ├── sockets/
│   └── ...
├── PRD.md               # Functional Requirements
├── README.md
└── ...
```

---

## 🧠 Gameplay Overview

1. **Admin** creates a game session, sets question count, round count, and time per question.
2. **Players** join using a game code.
3. Once started, questions are displayed one-by-one.
4. Players race to answer quickly — faster answers score more!
5. After each round, a leaderboard updates in real-time.
6. At the end, final scores are displayed.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a pull request

---

## 📄 License

MIT License. See `LICENSE` file for details.

---

## 🌐 Acknowledgments

- [Open Trivia DB](https://opentdb.com/)
- [Skribbl.io](https://skribbl.io/) — for multiplayer game inspiration
- [TailwindCSS](https://tailwindcss.com/)
- [Socket.IO](https://socket.io/)
