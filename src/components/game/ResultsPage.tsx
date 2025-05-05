import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import MainLayout from '../layout/MainLayout';
import Button from '../ui/Button';
import socketService from '../../services/socketService';

const ResultsPage: React.FC = () => {
  const { questionResults, isAdmin, gameCode } = useSelector((state: RootState) => state.game);

  const handleNextQuestion = () => {
    if (gameCode) {
      socketService.nextQuestion(gameCode);
    }
  };

  // Helper function to decode HTML entities
  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (!questionResults) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </MainLayout>
    );
  }

  const { question, correctAnswer, playerAnswers, leaderboard } = questionResults;

  return (
    <MainLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Question Results</h2>

        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Question:</h3>
          <p className="text-gray-800">{decodeHTML(question)}</p>
          
          <div className="mt-3 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-1">Correct Answer:</h4>
            <div className="bg-green-100 text-green-800 p-3 rounded-lg">
              {decodeHTML(correctAnswer)}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Player Answers:</h3>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {playerAnswers.map((playerAnswer, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {playerAnswer.playerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {playerAnswer.answer ? (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          playerAnswer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {playerAnswer.isCorrect ? 'Correct' : 'Incorrect'}
                          <span className="ml-2 text-gray-600">
                            {decodeHTML(playerAnswer.answer)}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          No Answer
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-medium">
                        +{playerAnswer.scoreGained} pts
                      </div>
                      <div className="text-gray-500 text-xs">
                        Total: {playerAnswer.totalScore}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Leaderboard:</h3>
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <ul className="divide-y divide-gray-200">
              {leaderboard.map((player) => (
                <li
                  key={player.playerId}
                  className="px-4 py-3 sm:px-6 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <span className="bg-blue-100 text-blue-700 h-6 w-6 rounded-full flex items-center justify-center font-medium mr-3">
                      {player.rank}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {player.playerName}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900">{player.score} pts</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {isAdmin ? (
          <div className="text-center">
            <Button onClick={handleNextQuestion}>
              Continue to Next Question
            </Button>
          </div>
        ) : (
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <p className="text-yellow-700">
              Waiting for admin to continue...
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ResultsPage;