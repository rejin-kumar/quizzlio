import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import JoinGame from '@/components/home/JoinGame';
import CreateGame from '@/components/home/CreateGame';
import socketService from '../../services/socketService';

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');
  const [isConnecting, setIsConnecting] = useState(false);
  const { error, status } = useSelector((state: RootState) => state.game as any);
  
  // Refs and state for height animation
  const contentRef = useRef<HTMLDivElement>(null);
  const joinRef = useRef<HTMLDivElement>(null);
  const createRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // Connect to socket server on component mount
  useEffect(() => {
    const connectToServer = async () => {
      try {
        setIsConnecting(true);
        await socketService.connect();
      } catch (err) {
        console.error('Failed to connect to server:', err);
      } finally {
        setIsConnecting(false);
      }
    };

    connectToServer();

    // Clean up socket connection on unmount
    return () => {
      // We don't want to disconnect when navigating between game states
      // The socket will be managed by the game components
    };
  }, []);

  // Update content height when tab changes
  useEffect(() => {
    if (activeTab === 'join' && joinRef.current) {
      setContentHeight(joinRef.current.scrollHeight);
    } else if (activeTab === 'create' && createRef.current) {
      setContentHeight(createRef.current.scrollHeight);
    }
  }, [activeTab]);

  // Handle window resize to update height
  useEffect(() => {
    const handleResize = () => {
      if (activeTab === 'join' && joinRef.current) {
        setContentHeight(joinRef.current.scrollHeight);
      } else if (activeTab === 'create' && createRef.current) {
        setContentHeight(createRef.current.scrollHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-pacifico text-white mb-24">Quizzlio</h1>
      <div className="shadow-lg rounded-lg overflow-hidden w-full max-w-4xl" style={{ backgroundColor: 'var(--card-background)' }}>
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {status === 'creating' || status === 'joining' ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">
                {status === 'creating' ? 'Creating game...' : 'Joining game...'}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex mb-6">
                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex-1 py-2 font-medium ${
                    activeTab === 'join'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'border-b border-gray-300 text-gray-500'
                  }`}
                >
                  Join Game
                </button>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex-1 py-2 font-medium ${
                    activeTab === 'create'
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'border-b border-gray-300 text-gray-500'
                  }`}
                >
                  Create Game
                </button>
              </div>

              {/* Content container with height transition */}
              <div 
                ref={contentRef} 
                className="overflow-hidden transition-height duration-300 ease-in-out"
                style={{ height: contentHeight ? `${contentHeight}px` : 'auto' }}
              >
                {/* Hidden div for Join Game content */}
                <div 
                  ref={joinRef} 
                  style={{ display: activeTab === 'join' ? 'block' : 'none' }}
                >
                  <JoinGame disabled={isConnecting} />
                </div>
                
                {/* Hidden div for Create Game content */}
                <div 
                  ref={createRef} 
                  style={{ display: activeTab === 'create' ? 'block' : 'none' }}
                >
                  <CreateGame disabled={false} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 text-center w-full max-w-4xl mt-12 rounded-lg">
        <p className="text-white">
          © {new Date().getFullYear()} Quizzlio - The Multiplayer Trivia Game
        </p>
      </div>
    </div>
  );
};

export default HomePage;