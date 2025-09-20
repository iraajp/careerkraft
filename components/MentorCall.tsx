import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Roadmap } from '../types';
import { generateMentorIntro } from '../services/geminiService';
import Spinner from './Spinner';
import { MicIcon, MicOffIcon, PhoneOffIcon, UserIcon } from './icons';

interface MentorCallProps {
  roadmap: Roadmap;
  onEndCall: () => void;
}

type CallState = 'LOADING' | 'SPEAKING' | 'LISTENING' | 'ERROR' | 'IDLE';

const MentorCall: React.FC<MentorCallProps> = ({ roadmap, onEndCall }) => {
  const [intro, setIntro] = useState('');
  const [callState, setCallState] = useState<CallState>('LOADING');
  const [isMuted, setIsMuted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript(prev => prev + finalTranscript);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleEndCall = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    window.speechSynthesis.cancel();
    streamRef.current?.getTracks().forEach(track => track.stop());
    onEndCall();
  }, [onEndCall]);

  // Fetch intro and get mic permission
  useEffect(() => {
    const setupCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
      } catch (err) {
        console.error("Microphone permission denied:", err);
        setPermissionError("Microphone access is required for voice interaction.");
      }

      try {
        const introMessage = await generateMentorIntro(roadmap.title);
        setIntro(introMessage);
      } catch (error) {
        console.error("Failed to get mentor intro:", error);
        setIntro("Hello! I'm ready to discuss your path. Let's begin.");
        setCallState('ERROR');
      }
    };
    setupCall();
    
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [roadmap.title]);

  // TTS Effect: Speak the intro when it's ready
  useEffect(() => {
    if (intro && callState === 'LOADING') {
      setCallState('SPEAKING');
      const utterance = new SpeechSynthesisUtterance(intro);
      utterance.onend = () => {
        setCallState('LISTENING');
      };
      utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        setCallState('LISTENING'); // Fallback to listening
      }
      window.speechSynthesis.speak(utterance);
    }
  }, [intro, callState]);

  // STT Effect: Listen when it's the user's turn
  useEffect(() => {
    if (callState === 'LISTENING' && recognitionRef.current && !permissionError && !isMuted) {
      try {
        recognitionRef.current.start();
      } catch(e) {
        console.error("Speech recognition already started.", e)
      }
    } else if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [callState, permissionError, isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const getStatusText = () => {
    if (permissionError) return permissionError;
    switch (callState) {
        case 'LOADING': return "Connecting...";
        case 'SPEAKING': return "AI Mentor is speaking...";
        case 'LISTENING': return "Listening for your response...";
        case 'IDLE': return "Call ended.";
        case 'ERROR': return "An error occurred.";
        default: return "";
    }
  }

  return (
    <div className="w-full max-w-4xl h-[85vh] flex flex-col bg-black rounded-2xl shadow-2xl border border-gray-700 overflow-hidden animate-fade-in">
      {/* Mentor's "Video" */}
      <div className="flex-grow bg-gray-800 flex items-center justify-center relative bg-gradient-to-br from-purple-900 via-gray-900 to-indigo-900">
        {callState === 'LOADING' ? (
          <Spinner />
        ) : (
          <div className="text-center p-8">
            <div className={`w-32 h-32 rounded-full bg-purple-500/20 mx-auto mb-4 flex items-center justify-center border-2 border-purple-400 shadow-lg ${callState === 'SPEAKING' && 'animate-pulse'}`}>
                <UserIcon className="w-20 h-20 text-purple-300" />
            </div>
            <h2 className="text-2xl font-bold text-white">Your AI Mentor</h2>
            <p className="text-lg text-purple-300">{roadmap.title}</p>
            <div className="mt-6 p-4 bg-black/30 rounded-lg max-w-lg mx-auto min-h-[6rem]">
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
                {callState === 'LISTENING' && !isMuted && <div className="absolute inset-0 border-2 border-green-400 rounded-lg animate-pulse"></div>}
            </div>
            <div>
                <p className="font-semibold">You</p>
                <p className={`text-xs ${permissionError ? 'text-yellow-400' : 'text-green-400'}`}>{getStatusText()}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={toggleMute} disabled={!!permissionError} className="p-3 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isMuted || permissionError ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
          </button>
          <button onClick={handleEndCall} className="p-3 bg-red-600 rounded-full hover:bg-red-700 transition-colors">
            <PhoneOffIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MentorCall;
