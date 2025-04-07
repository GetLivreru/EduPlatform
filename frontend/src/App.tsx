import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { testConnection, getWelcomeMessage } from './services/api';
import QuizList from './components/QuizList';
import QuizAttempt from './components/QuizAttempt';
import QuizManager from './components/admin/QuizManager';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [backendStatus, setBackendStatus] = useState<string>('checking');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await testConnection();
        setBackendStatus('success');
      } catch (error) {
        setBackendStatus('error');
      }
    };

    const fetchWelcomeMessage = async () => {
      try {
        const data = await getWelcomeMessage();
        setWelcomeMessage(data.message);
      } catch (error) {
        console.error('Error fetching welcome message:', error);
      }
    };

    checkConnection();
    fetchWelcomeMessage();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                {welcomeMessage}
              </Link>
              <p className="text-sm text-gray-500">
                Backend status: <span className={`font-semibold ${backendStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {backendStatus}
                </span>
              </p>
            </div>
            <div className="flex space-x-4">
              <Link 
                to="/admin/quizzes" 
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Admin Panel
              </Link>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Profile
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 text-sm">
            © 2024 Educational Quiz Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Quizzes</h2>
      <div className="flex space-x-4 mb-4">
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Subjects</option>
          <option value="mathematics">Mathematics</option>
          <option value="programming">Programming</option>
          <option value="science">Science</option>
        </select>
        <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <QuizList />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          <Route path="/admin/quizzes" element={<QuizManager />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App; 