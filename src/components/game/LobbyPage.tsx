import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import MainLayout from '../layout/MainLayout';
import Button from '../ui/Button';
import socketService from '../../services/socketService';
import { resetGame, Player } from '../../redux/slices/gameSlice';

const LobbyPage: React.FC = () => {
  const dispatch = useDispatch();
  const { gameCode, isAdmin, players, error } = useSelector((state: RootState) => state.game as any);

  // Sort players by scores
  const sortedPlayers = [...players].sort((a: Player, b: Player) => b.score - a.score);

  const handleStartGame = () => {
    if (gameCode) {
      socketService.startGame(gameCode);
    }
  };

  const handleLeaveGame = () => {
    if (gameCode) {
      socketService.leaveGame(gameCode);
    }
    dispatch(resetGame());
    window.location.href = '/';
  };

  const copyGameCode = () => {
    if (gameCode) {
      navigator.clipboard.writeText(gameCode);
      alert('Game code copied to clipboard!');
    }
  };

  if (!gameCode) {
    window.location.href = '/';
    return null;
  }

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Game Lobby</h2>

        {error && (
          <div className="bg-red-100 p-3 rounded-lg mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="md:flex gap-6">
          {/* Main lobby content */}
          <div className="md:w-3/5">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700">Game Code:</h3>
                <div className="flex items-center">
                  <span className="text-3xl font-bold tracking-wider bg-gray-100 py-2 px-4 rounded-lg">
                    {gameCode}
                  </span>
                  <button
                    onClick={copyGameCode}
                    className="ml-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-lg"
                    aria-label="Copy game code"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              {isAdmin ? (
                <Button 
                  onClick={handleStartGame}
                  disabled={players.length < 1}
                  className="mt-4 md:mt-0"
                >
                  Start Game
                </Button>
              ) : (
                <div className="mt-4 md:mt-0 bg-yellow-100 p-3 rounded-lg">
                  <p className="text-yellow-800">
                    Waiting for admin to start the game...
                  </p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Players ({players.length}/10):
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                {players.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No players have joined yet
                  </p>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {players.map((player: Player) => (
                      <li
                        key={player.id}
                        className="py-3 flex items-center justify-between"
                      >
                        <span className="text-lg">
                          {player.name}
                          {player.isAdmin && (
                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                              Admin
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button 
                onClick={handleLeaveGame}
                variant="outline"
              >
                Leave Game
              </Button>
            </div>
          </div>

          {/* Leaderboard section */}
          <div className="md:w-2/5 mt-6 md:mt-0">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Game Leaderboard</h3>
              <div className="overflow-hidden">
                {players.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                        <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedPlayers.map((player: Player, index: number) => (
                        <tr key={player.id} className="border-b border-gray-100">
                          <td className="py-2 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-medium ${
                              index === 0 ? 'bg-yellow-100 text-yellow-800' :
                              index === 1 ? 'bg-gray-100 text-gray-800' :
                              index === 2 ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-50 text-blue-600'
                            }`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {player.name}
                            {player.isAdmin && (
                              <span className="ml-1 text-xs text-gray-500">(Admin)</span>
                            )}
                          </td>
                          <td className="py-2 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                            {player.score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No players have joined yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LobbyPage;