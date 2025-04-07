import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { testConnection, getWelcomeMessage } from './services/api';
import QuizList from './components/QuizList';

const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Checking connection...');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test backend connection
        const testResult = await testConnection();
        setBackendStatus(`Backend status: ${testResult.status}`);
        
        // Get welcome message
        const welcomeData = await getWelcomeMessage();
        setWelcomeMessage(welcomeData.message);
      } catch (error) {
        setBackendStatus('Failed to connect to backend');
        console.error('Connection error:', error);
      }
    };

    checkConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{welcomeMessage}</h1>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{backendStatus}</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  Profile
                </button>
                <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Quizzes</h2>
              <div className="flex space-x-4">
                <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Subjects</option>
                  <option>Mathematics</option>
                  <option>Physics</option>
                  <option>Chemistry</option>
                </select>
                <select className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>All Levels</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>
            <QuizList />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © 2024 Educational Quiz Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App; 