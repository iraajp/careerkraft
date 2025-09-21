import React, { useState, useEffect, useCallback } from 'react';
import { generateQuestion } from '../services/geminiService';
import { QAndA, QuestionWithOptions } from '../types';
import Spinner from './Spinner';

interface QuestionnaireProps {
  onComplete: (history: QAndA[]) => void;
}

const TOTAL_QUESTIONS = 4;

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [history, setHistory] = useState<QAndA[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionWithOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  const fetchNextQuestion = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSelectedOption(null);
    try {
      const questionData = await generateQuestion(history);
      // Additional validation
      if (!questionData || !questionData.question || !Array.isArray(questionData.options)) {
        throw new Error('Invalid question format received');
      }
      setCurrentQuestion(questionData);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to load question. Please try again.");
      setCurrentQuestion(null);
    } finally {
      setIsLoading(false);
    }
  }, [history]);

  useEffect(() => {
    if (history.length < TOTAL_QUESTIONS) {
      fetchNextQuestion();
    } else {
      // Show loading state for a moment before transitioning
      setIsLoading(true);
      setTimeout(() => {
        onComplete(history);
      }, 500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history.length]);

  const handleAnswer = (answer: string) => {
    if (!currentQuestion || isAnswering) return;

    setIsAnswering(true);
    setSelectedOption(answer);
    
    setTimeout(() => {
      const newHistory = [...history, { question: currentQuestion.question, answer }];
      setHistory(newHistory);
      setIsAnswering(false);
    }, 500);
  };

  const progressPercentage = (history.length / TOTAL_QUESTIONS) * 100;

  return (
    <div className="w-full max-w-3xl p-8 bg-gray-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-gray-700 animate-fade-in flex flex-col justify-center min-h-[420px]">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-400">
            Question {history.length + 1} of {TOTAL_QUESTIONS}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-center">
        {isLoading ? (
            <div className="text-center">
                <h2 className="text-xl font-semibold mb-4 text-purple-300">Generating your next question...</h2>
                <Spinner />
            </div>
        ) : error ? (
            <div className="text-red-400 text-center">{error}</div>
        ) : currentQuestion && currentQuestion.options && Array.isArray(currentQuestion.options) ? (
            <>
            <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 text-gray-100">
                {currentQuestion.question}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswering}
                    className={`p-4 border-2 rounded-lg text-left transition-all duration-300
                    ${selectedOption === option
                        ? 'bg-purple-600 border-purple-400 scale-105 shadow-lg'
                        : 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-purple-500'
                    }
                    ${isAnswering ? 'cursor-not-allowed' : 'cursor-pointer'}`
                    }
                >
                    {option}
                </button>
                ))}
            </div>
            </>
        ) : (
            <div className="text-red-400 text-center">
                <p>There was an error loading the question. Please try again.</p>
                <button 
                    onClick={fetchNextQuestion}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-800 transition-all duration-300"
                >
                    Retry
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Questionnaire;