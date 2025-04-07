import React from 'react';
import QuizList from './components/QuizList';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Learning Path</h1>
        </div>
      </header>
      <main>
        <QuizList />
      </main>
    </div>
  );
}

export default App; 