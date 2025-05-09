import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import MainLayout from '../layout/MainLayout';
import Button from '../ui/Button';
import { updateTimeRemaining, selectAnswer, submitAnswer, Player } from '../../redux/slices/gameSlice';
import socketService from '../../services/socketService';

const QuestionPage: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    currentQuestion, 
    gameCode, 
    timeRemaining, 
    selectedAnswer, 
    hasSubmitted, 
    players
  } = useSelector((state: RootState) => state.game);
  const [animateTimer, setAnimateTimer] = useState(false);
  
  // Sort players by scores for the leaderboard
  // Use the most recent player data that includes the updated scores
  const sortedPlayers = [...players].sort((a: Player, b: Player) => b.score - a.score);

  // Define handleSubmitAnswer before it's used in useEffect
  const handleSubmitAnswer = useCallback(() => {
    if (hasSubmitted || !gameCode) return;
    
    dispatch(submitAnswer());
    socketService.submitAnswer(gameCode, selectedAnswer || '', timeRemaining);
  }, [dispatch, gameCode, hasSubmitted, selectedAnswer, timeRemaining]);

  // Set up countdown timer
  useEffect(() => {
    if (!currentQuestion) return;

    // Reset timer when new question arrives
    dispatch(updateTimeRemaining(currentQuestion.timeLimit));

    // Set up interval for countdown
    const interval = setInterval(() => {
      dispatch(updateTimeRemaining((time) => Math.max(0, time - 1)));
    }, 1000);

    // Clean up interval on component unmount or when question changes
    return () => clearInterval(interval);
  }, [currentQuestion, dispatch]);

  // Effect for timer warning animation
  useEffect(() => {
    if (timeRemaining <= 5 && timeRemaining > 0) {
      setAnimateTimer(true);
    } else {
      setAnimateTimer(false);
    }
  }, [timeRemaining]);

  // Auto-submit when timer reaches zero
  useEffect(() => {
    if (timeRemaining === 0 && !hasSubmitted && gameCode) {
      // If no answer selected, submit a null answer
      handleSubmitAnswer();
    }
  }, [timeRemaining, hasSubmitted, gameCode, handleSubmitAnswer]);

  const handleAnswerSelect = (answer: string) => {
    if (hasSubmitted) return;
    dispatch(selectAnswer(answer));
  };

  if (!currentQuestion) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading question...</p>
        </div>
      </MainLayout>
    );
  }

  const { question, answers, category, difficulty, questionNumber, totalQuestions } = currentQuestion;
  
  // Calculate progress percentage for the timer
  const timeProgress = currentQuestion.timeLimit > 0 
    ? (timeRemaining / currentQuestion.timeLimit) * 100 
    : 0;

  // Function to calculate timer text color based on time remaining
  const getTimerTextColor = () => {
    if (timeProgress > 66) return 'text-green-500';
    if (timeProgress > 33) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Function to calculate gradient background colors for timer
  const getTimerBackgroundColor = () => {
    // More gradual color transition from green to yellow to red
    if (timeProgress > 75) return 'bg-gradient-to-r from-green-400 to-green-500';
    if (timeProgress > 50) return 'bg-gradient-to-r from-green-500 to-yellow-400';
    if (timeProgress > 25) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    return 'bg-gradient-to-r from-orange-500 to-red-600';
  };

  // Function to calculate border color for answer buttons
  const getAnswerBorderColor = () => {
    if (timeProgress > 66) return 'border-green-400';
    if (timeProgress > 33) return 'border-yellow-400';
    return 'border-red-500';
  };

  // Helper function to decode HTML entities
  const decodeHTML = (html: string) => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  // Format progress
  const progress = Math.round((questionNumber / totalQuestions) * 100);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:gap-6">
          {/* Question section (70%) */}
          <div className="md:w-[70%]">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <div className="flex items-center">
                  <span 
                    className={`text-lg font-bold ${
                      animateTimer ? 'animate-pulse ' : ''
                    }${getTimerTextColor()}`}
                  >
                    {timeRemaining}s
                  </span>
                </div>
              </div>
              {/* Question progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-linear"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Visual timer component with enhanced gradient colors */}
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 transition-all duration-1000 ease-linear ${getTimerBackgroundColor()}`}
                  style={{ width: `${timeProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs">
                <span className="text-gray-500">Time Remaining</span>
                <span className={`font-medium ${getTimerTextColor()}`}>
                  {timeRemaining} seconds {timeProgress < 33 && "- Hurry!"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">
                {category}
              </span>
              <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {decodeHTML(question)}
              </h2>
            </div>

            <div className="grid gap-4 mb-6">
              {answers.map((answer: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(answer)}
                  disabled={hasSubmitted}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedAnswer === answer
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : `${getAnswerBorderColor()} hover:border-gray-400 hover:bg-gray-50`
                  } ${hasSubmitted ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  <span className="font-medium">{decodeHTML(answer)}</span>
                </button>
              ))}
            </div>

            <Button
              onClick={handleSubmitAnswer}
              fullWidth
              disabled={!selectedAnswer || hasSubmitted}
            >
              {hasSubmitted ? 'Answer Submitted' : 'Submit Answer'}
            </Button>

            {hasSubmitted && (
              <p className="text-center mt-4 text-gray-500">
                Waiting for all players to answer...
              </p>
            )}

            {/* Points information */}
            <div className="mt-4 bg-gray-50 p-3 rounded-md text-sm text-gray-600">
              <p className="text-center">
                <span className="font-medium">Quick Tip:</span> Answer correctly faster for more points! 
                <br />
                <span className="text-xs">
                  Points = Remaining Time × 10
                </span>
              </p>
            </div>
          </div>

          {/* Leaderboard section (30%) */}
          <div className="md:w-[30%] mt-6 md:mt-0">
            <div className="bg-gray-50 rounded-lg p-4 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Leaderboard</h3>
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

export default QuestionPage;