
import React, { useState, useEffect, useRef } from 'react';
import { Roadmap } from '../types';
import { generateMentorIntro } from '../services/geminiService';
import Spinner from './Spinner';
import { MicIcon, MicOffIcon, PhoneOffIcon, UserIcon } from './icons';

interface MentorCallProps {
  roadmap: Roadmap;
  onEndCall: () => void;
}

const MentorCall: React.FC<MentorCallProps> = ({ roadmap, onEndCall }) => {
  const [intro, setIntro] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const getIntro = async () => {
      try {
        const introMessage = await generateMentorIntro(roadmap.title);
        setIntro(introMessage);
        
        setTimeout(() => setIsListening(true), introMessage.length * 50); // Simulate AI finishing speaking
      } catch (error) {
        console.error("Failed to get mentor intro:", error);
        setIntro("Hello! I'm ready to discuss your path. Let's begin.");
      } finally {
        setIsLoading(false);
      }
    };

    const getMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
        } catch (err) {
            console.error("Microphone permission denied:", err);
            setPermissionError("Microphone access is needed for the full experience. You can still listen to your mentor.");
        }
    };
    
    getIntro();
    getMicPermission();
    
    return () => {
        streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [roadmap.title]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-black rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-fade-in">
      {/* Mentor's "Video" */}
      <div className="flex-grow bg-gray-800 flex items-center justify-center relative bg-gradient-to-br from-purple-900 via-gray-900 to-indigo-900">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="text-center p-8">
            <div className="w-32 h-32 rounded-full bg-purple-500/20 mx-auto mb-4 flex items-center justify-center border-2 border-purple-400 shadow-lg animate-pulse">
                <UserIcon className="w-20 h-20 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your AI Mentor</h2>
            <p className="text-lg text-purple-300">{roadmap.title}</p>
            <div className="mt-6 p-4 bg-black/30 rounded-lg max-w-lg mx-auto">
                <p className="text-gray-200 italic">"{intro}"</p>
            </div>
          </div>
        )}
         <div className="absolute top-4 left-4 text-sm bg-red-600 px-2 py-1 rounded-full flex items-center gap-2">
            <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            LIVE
        </div>
      </div>

      {/* User's "Video" and Controls */}
      <div className="bg-gray-900/80 backdrop-blur-sm p-4 flex items-center justify-between border-t border-gray-700">
        <div className="flex items-center gap-3">
             <div className="w-16 h-12 rounded-lg bg-gray-700 flex items-center justify-center relative overflow-hidden">
                <UserIcon className="w-8 h-8 text-gray-400" />
                {isListening && !isMuted && <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse"></div>}
            </div>
            <div>
                <p className="font-semibold">You</p>
                {permissionError ? <p className="text-xs text-yellow-400">{permissionError}</p> : <p className="text-xs text-green-400">{isListening ? "AI is listening..." : "AI is speaking..."}</p>}
            </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} disabled={!!permissionError} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isMuted || permissionError ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
          </button>
          <button onClick={onEndCall} className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
            <PhoneOffIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorCall;
