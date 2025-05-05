import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {children}
        </div>
        <footer className="mt-4 text-center text-sm text-gray-500 py-2">
          <p className="text-white">© {new Date().getFullYear()} Quizzlio - The Multiplayer Trivia Game</p>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;