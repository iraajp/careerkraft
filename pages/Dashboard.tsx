import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TodoList from '../components/TodoList';
import Chat from '../components/Chat';
import { UserIcon } from '../components/icons';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleCreateRoadmap = () => {
    navigate('/questionnaire');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-400">
            <UserIcon className="w-6 h-6 text-purple-300" />
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
            <p className="text-gray-400">{currentUser?.email}</p>
          </div>
          <button
            onClick={handleCreateRoadmap}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Career Roadmap
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700 hover:border-purple-500 transition-colors cursor-pointer" onClick={handleCreateRoadmap}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Create Roadmap</h3>
            </div>
            <p className="text-gray-400">Generate a personalized career roadmap based on your goals and interests</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Schedule Call</h3>
            </div>
            <p className="text-gray-400">Book a mentoring session with an AI career advisor</p>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">Track Progress</h3>
            </div>
            <p className="text-gray-400">Monitor your career development and milestone achievements</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Todo List */}
          <div className="flex flex-col gap-6">
            <TodoList />
          </div>

          {/* Right Column - Chat */}
          <div className="flex flex-col gap-6">
            <Chat />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;