import React, { useEffect, useState } from 'react';
import { getQuizzes } from '../services/api';
import { FaBook, FaGraduationCap, FaQuestionCircle, FaClock, FaSpinner } from 'react-icons/fa';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface Quiz {
  _id: string;
  title: string;
  subject: string;
  difficulty: string;
  questions: QuizQuestion[];
  timeLimit: number;
}

interface QuizListProps {
  selectedSubject?: string;
  selectedDifficulty?: string;
}

const QuizList: React.FC<QuizListProps> = ({ selectedSubject = 'all', selectedDifficulty = 'all' }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const data = await getQuizzes();
        
        // Apply filters
        let filteredQuizzes = data;
        if (selectedSubject !== 'all') {
          filteredQuizzes = filteredQuizzes.filter(quiz => quiz.subject === selectedSubject);
        }
        if (selectedDifficulty !== 'all') {
          filteredQuizzes = filteredQuizzes.filter(quiz => quiz.difficulty === selectedDifficulty);
        }
        
        setQuizzes(filteredQuizzes);
        setError(null);
      } catch (err) {
        setError('Failed to fetch quizzes');
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [selectedSubject, selectedDifficulty]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <FaSpinner className="text-red-500 text-4xl mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No quizzes found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {quizzes.map((quiz) => (
        <div
          key={quiz._id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">{quiz.title}</h3>
          
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <FaBook className="mr-2" />
              <span>{quiz.subject}</span>
            </div>
            
            <div className="flex items-center">
              <FaGraduationCap className="mr-2" />
              <span className={`px-2 py-1 rounded-full text-sm ${
                quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {quiz.difficulty}
              </span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FaQuestionCircle className="mr-2" />
              <span>{quiz.questions.length} questions</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <FaClock className="mr-2" />
              <span>{quiz.timeLimit} minutes</span>
            </div>
          </div>
          
          <button
            className="mt-6 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-colors duration-300 flex items-center justify-center"
          >
            Start Quiz
          </button>
        </div>
      ))}
    </div>
  );
};

export default QuizList; 