
import React, { useState, useCallback } from 'react';
import { AppState, QAndA, Roadmap } from './types';
import Welcome from './components/Welcome';
import Questionnaire from './components/Questionnaire';
import RoadmapDisplay from './components/RoadmapDisplay';
import MentorCall from './components/MentorCall';
import { generateRoadmaps } from './services/geminiService';
import Spinner from './components/Spinner';
import { BotMessageSquareIcon } from './components/icons';


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [conversationHistory, setConversationHistory] = useState<QAndA[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStart = () => {
    setAppState(AppState.QUESTIONNAIRE);
  };

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
      setError("An error occurred while generating your roadmaps. Please refresh and try again.");
      setAppState(AppState.WELCOME);
    }
  }, []);

  const handleRoadmapSelect = (roadmap: Roadmap) => {
    setSelectedRoadmap(roadmap);
    setAppState(AppState.MENTOR_CALL);
  };
  
  const handleRestart = () => {
    setConversationHistory([]);
    setRoadmaps([]);
    setSelectedRoadmap(null);
    setError(null);
    setAppState(AppState.WELCOME);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.WELCOME:
        return <Welcome onStart={handleStart} />;
      case AppState.QUESTIONNAIRE:
        return <Questionnaire onComplete={handleQuestionnaireComplete} />;
      case AppState.GENERATING_ROADMAPS:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-purple-300">Crafting Your Future...</h2>
            <p className="text-gray-400 mb-6">Our AI is analyzing your answers to build personalized career roadmaps.</p>
            <Spinner />
          </div>
        );
      case AppState.VIEWING_ROADMAPS:
        return <RoadmapDisplay roadmaps={roadmaps} onSelect={handleRoadmapSelect} />;
      case AppState.MENTOR_CALL:
        return selectedRoadmap ? <MentorCall roadmap={selectedRoadmap} onEndCall={handleRestart} /> : <div onClick={handleRestart}>Error: No roadmap selected. Click to restart.</div>;
      default:
        return <Welcome onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="absolute top-6 left-8 flex items-center gap-3">
        <BotMessageSquareIcon className="w-8 h-8 text-purple-400" />
        <h1 className="text-2xl font-bold tracking-wider">Career Compass AI</h1>
      </div>
       {error && (
        <div className="absolute top-20 bg-red-800 text-white p-4 rounded-lg shadow-lg z-50">
          <p>{error}</p>
        </div>
      )}
      <main className="w-full max-w-5xl mx-auto flex-grow flex items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
