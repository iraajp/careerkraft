import React from 'react';
import { Roadmap } from '../types';
import { PhoneCallIcon, PhoneOffIcon, UserIcon } from './icons';

interface MentorCallProps {
  roadmap: Roadmap;
  onEndCall: () => void;
}

const MentorCall: React.FC<MentorCallProps> = ({ roadmap, onEndCall }) => {
  return (
    <div className="w-full max-w-2xl p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in text-center">
      
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-purple-500/20 mx-auto flex items-center justify-center border-2 border-purple-400 shadow-lg">
            <UserIcon className="w-16 h-16 text-purple-300" />
          </div>
          <span className="absolute -bottom-2 -right-2 flex h-10 w-10">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-10 w-10 bg-green-500 items-center justify-center border-2 border-gray-800">
                <PhoneCallIcon className="w-6 h-6 text-white"/>
            </span>
          </span>
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-white mb-2">Call in Progress...</h1>
      <p className="text-lg text-purple-300 mb-6">{roadmap.title} Mentor</p>
      
      <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
        <p className="text-gray-300">
            Your AI mentor should be calling you shortly. Please answer the call to begin your session.
        </p>
      </div>

      <button
        onClick={onEndCall}
        className="mt-8 px-6 py-3 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2 mx-auto"
      >
        <PhoneOffIcon className="w-5 h-5" />
        End Session & Restart
      </button>

    </div>
  );
};

export default MentorCall;
