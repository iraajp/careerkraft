import React, { useState, useCallback, useEffect } from 'react';
import { AppState, QAndA, Roadmap, User } from './types';
import Welcome from './components/Welcome';
import Questionnaire from './components/Questionnaire';
import RoadmapDisplay from './components/RoadmapDisplay';
import MentorCall from './components/MentorCall';
import { generateRoadmaps } from './services/geminiService';
import Spinner from './components/Spinner';
import { BotMessageSquareIcon, LogOutIcon } from './components/icons';
import PhoneNumberInput from './components/PhoneNumberInput';
import Login from './components/Login';
import Signup from './components/Signup';

const API_BASE_URL = process.env.NODE_ENV === 'production' ? 'https://your-backend-app.railway.app' : 'http://localhost:3001';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<QAndA[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/me`);
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
          setAppState(AppState.WELCOME);
        } else {
          setAppState(AppState.LOGIN);
        }
      } catch (err) {
        setAppState(AppState.LOGIN);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    checkSession();
  }, []);

  const handleStart = () => setAppState(AppState.QUESTIONNAIRE);

  const handleQuestionnaireComplete = useCallback(async (history: QAndA[]) => {
    setConversationHistory(history);
    setAppState(AppState.GENERATING_ROADMAPS);
    setError(null);
    try {
      const generatedRoadmaps = await generateRoadmaps(history);
      if (generatedRoadmaps && generatedRoadmaps.length > 0) {
        setRoadmaps(generatedRoadmaps);
        setAppState(AppState.VIEWING_ROADMAPS);
      } else {
        setError("Sorry, I couldn't generate any roadmaps. Please try again.");
        setAppState(AppState.QUESTIONNAIRE);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An error occurred.";
      setError(`Error generating roadmaps: ${errorMessage}`);
      setAppState(AppState.WELCOME);
    }
  }, []);

  const handleRoadmapSelect = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setAppState(AppState.AWAITING_CALL_DETAILS);
  };

  const handleCallSubmit = async (phoneNumber: string) => {
    if (!selectedRoadmap) {
      setError("Something went wrong. Please select a roadmap again.");
      setAppState(AppState.VIEWING_ROADMAPS);
      return false;
    }
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/start-call`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, careerPath: selectedRoadmap.title }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initiate call.');
      }
      setAppState(AppState.MENTOR_CALL);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
      return false;
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, { method: 'POST' });
    setCurrentUser(null);
    handleRestart();
    setAppState(AppState.LOGIN);
  };

  const handleRestart = () => {
    setConversationHistory([]);
    setRoadmaps([]);
    setSelectedRoadmap(null);
    setError(null);
    setAppState(AppState.WELCOME);
  };

  const renderContent = () => {
    if (isLoadingAuth) {
        return <Spinner />;
    }
    
    if (!currentUser) {
        switch (appState) {
            case AppState.SIGNUP:
                return <Signup onSignupSuccess={(user) => { setCurrentUser(user); setAppState(AppState.WELCOME); }} onSwitchToLogin={() => setAppState(AppState.LOGIN)} />;
            case AppState.LOGIN:
            default:
                return <Login onLoginSuccess={(user) => { setCurrentUser(user); setAppState(AppState.WELCOME); }} onSwitchToSignup={() => setAppState(AppState.SIGNUP)} />;
        }
    }

    switch (appState) {
      case AppState.WELCOME:
        return <Welcome onStart={handleStart} />;
      case AppState.QUESTIONNAIRE:
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
      case AppState.GENERATING_ROADMAPS:
        return (
          <div className="text-center"><h2 className="text-2xl font-bold mb-4 text-purple-300">Crafting Your Future...</h2><p className="text-gray-400 mb-6">Our AI is analyzing your answers to build personalized career roadmaps.</p><Spinner /></div>
        );
      case AppState.VIEWING_ROADMAPS:
        return <RoadmapDisplay roadmaps={roadmaps} onSelect={handleRoadmapSelect} />;
      case AppState.AWAITING_CALL_DETAILS:
        return selectedRoadmap ? <PhoneNumberInput roadmap={selectedRoadmap} onCallSubmit={handleCallSubmit} onBack={() => setAppState(AppState.VIEWING_ROADMAPS)} /> : <div onClick={handleRestart}>Error: No roadmap selected. Click to restart.</div>;
      case AppState.MENTOR_CALL:
        return selectedRoadmap ? <MentorCall roadmap={selectedRoadmap} onEndCall={handleRestart} /> : <div onClick={handleRestart}>Error: No roadmap selected. Click to restart.</div>;
      default:
        return <Welcome onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center w-full">
        <div className="flex items-center gap-3">
          <BotMessageSquareIcon className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold tracking-wider">Career Compass AI</h1>
        </div>
        {currentUser && (
            <div className='flex items-center gap-4'>
                <span className='text-gray-300 hidden sm:inline'>{currentUser.email}</span>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors">
                    <LogOutIcon className="w-5 h-5" />
                    Logout
                </button>
            </div>
        )}
      </header>

       {error && (
        <div className="absolute top-24 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in" onClick={() => setError(null)}>
          <p>{error}</p>
        </div>
      )}
      <main className="w-full max-w-5xl mx-auto flex-grow flex items-center justify-center pt-16 sm:pt-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;