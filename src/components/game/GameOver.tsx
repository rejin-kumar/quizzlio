import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import MainLayout from '../layout/MainLayout';
import Button from '../ui/Button';
import { resetGame } from '../../redux/slices/gameSlice';

const GameOver: React.FC = () => {
  const dispatch = useDispatch();
  const { finalLeaderboard } = useSelector((state: RootState) => state.game);

  const handlePlayAgain = () => {
    dispatch(resetGame());
    window.location.href = '/';
  };

  if (!finalLeaderboard) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading final results...</p>
        </div>
      </MainLayout>
    );
  }

  // Get top 3 players for special highlighting
  const topPlayers = finalLeaderboard.slice(0, 3);
  const otherPlayers = finalLeaderboard.slice(3);

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Game Over</h2>
        <p className="text-center text-gray-600 mb-8">
          Thank you for playing Quizzlio!
        </p>

        {topPlayers.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-medium text-gray-700 text-center mb-6">
              Final Results
            </h3>

            <div className="flex flex-col items-center justify-center md:flex-row md:justify-around mb-6">
              {/* Second Place */}
              {topPlayers.length > 1 && (
                <div className="text-center mb-4 md:mb-0 md:order-1">
                  <div className="rounded-full bg-gray-100 h-20 w-20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-3xl font-bold text-gray-700">2</span>
                  </div>
                  <h4 className="font-medium">{topPlayers[1].playerName}</h4>
                  <p className="text-gray-600">{topPlayers[1].score} points</p>
                </div>
              )}

              {/* First Place */}
              {topPlayers.length > 0 && (
                <div className="text-center mb-4 md:mb-0 md:order-2">
                  <div className="rounded-full bg-yellow-100 h-24 w-24 flex items-center justify-center mx-auto mb-2 border-2 border-yellow-400 shadow-md relative">
                    <span className="text-4xl font-bold text-yellow-700">1</span>
                    <div className="absolute -top-4">👑</div>
                  </div>
                  <h4 className="text-xl font-bold">{topPlayers[0].playerName}</h4>
                  <p className="text-gray-600 font-medium">{topPlayers[0].score} points</p>
                </div>
              )}

              {/* Third Place */}
              {topPlayers.length > 2 && (
                <div className="text-center mb-4 md:mb-0 md:order-3">
                  <div className="rounded-full bg-orange-100 h-18 w-18 flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl font-bold text-orange-700">3</span>
                  </div>
                  <h4 className="font-medium">{topPlayers[2].playerName}</h4>
                  <p className="text-gray-600">{topPlayers[2].score} points</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">
            Complete Leaderboard
          </h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {finalLeaderboard.map((player) => (
                  <tr key={player.playerId} className={player.rank <= 3 ? 'bg-gray-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-bold ${
                        player.rank === 1 ? 'text-yellow-600' :
                        player.rank === 2 ? 'text-gray-600' :
                        player.rank === 3 ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {player.rank}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {player.playerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {player.score} pts
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-center mt-8">
          <Button onClick={handlePlayAgain} fullWidth>
            Play Again
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default GameOver;