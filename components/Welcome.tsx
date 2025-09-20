
import React from 'react';
import { SparklesIcon } from './icons';

interface WelcomeProps {
  onStart: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  return (
    <div className="text-center p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 max-w-2xl animate-fade-in">
      <div className="flex justify-center mb-6">
        <SparklesIcon className="w-16 h-16 text-purple-400" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
        Find Your Career Path
      </h1>
      <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
        Answer a few questions about your interests and skills, and our AI will generate personalized career roadmaps just for you.
      </p>
      <button
        onClick={onStart}
        className="px-8 py-3 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
      >
        Let's Get Started
      </button>
    </div>
  );
};

export default Welcome;
