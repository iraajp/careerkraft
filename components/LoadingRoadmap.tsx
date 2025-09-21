import React from 'react';
import Spinner from './Spinner';

const LoadingRoadmap: React.FC = () => {
  return (
    <div className="w-full h-[80vh] flex flex-col items-center justify-center p-6 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in">
      <div className="max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-purple-300">Crafting Your Career Roadmap</h1>
        <div className="space-y-4 mb-8">
          <p className="text-gray-300">Our AI is analyzing your responses and designing personalized career paths...</p>
          <div className="flex justify-center">
            <Spinner />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-700/30 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-600/50 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-600/50 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="mt-8 space-y-2 text-gray-400 text-sm">
          <p>• Analyzing career preferences</p>
          <p>• Mapping skill requirements</p>
          <p>• Generating growth trajectories</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingRoadmap;