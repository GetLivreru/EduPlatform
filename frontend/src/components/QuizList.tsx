import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaClock, FaQuestion, FaPlay, FaExclamationCircle } from 'react-icons/fa';
import { getQuizzes } from '../services/api';
import type { Quiz as APIQuiz } from '../services/api';

interface Quiz extends APIQuiz {
    id: string;
    title: string;
    description: string;
    category: string;
    questions: any[];
    difficulty: string;
    time_limit: number;
}

const QuizList: React.FC = () => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedLevel, setSelectedLevel] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await getQuizzes();
                setQuizzes(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch quizzes');
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const handleStartQuiz = (quizId: string) => {
        navigate(`/quiz/${quizId}`);
    };

    const filteredQuizzes = quizzes.filter(quiz => {
        const matchesSubject = selectedSubject === 'all' || quiz.category === selectedSubject;
        const matchesLevel = selectedLevel === 'all' || quiz.difficulty === selectedLevel;
        return matchesSubject && matchesLevel;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-600 p-4">
                <FaExclamationCircle className="inline-block mr-2" />
                {error}
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex gap-4 mb-6">
                <select
                    className="p-2 border rounded-lg"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                >
                    <option value="all">Все предметы</option>
                    <option value="math">Математика</option>
                    <option value="programming">Программирование</option>
                    <option value="ict">ИКТ</option>
                </select>
                <select
                    className="p-2 border rounded-lg"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                >
                    <option value="all">Все уровни</option>
                    <option value="beginner">Начинающий</option>
                    <option value="intermediate">Средний</option>
                    <option value="advanced">Продвинутый</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <FaBook className="text-2xl text-blue-500 mr-3" />
                            <h3 className="text-xl font-semibold">{quiz.title}</h3>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                            <FaGraduationCap className="mr-2" />
                            <span className={`px-2 py-1 rounded-full text-sm ${
                                quiz.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                                quiz.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {quiz.difficulty}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                            <FaQuestion className="mr-2" />
                            <span>{quiz.questions.length} questions</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-4">
                            <FaClock className="mr-2" />
                            <span>{quiz.time_limit} minutes</span>
                        </div>
                        <button
                            onClick={() => handleStartQuiz(quiz.id)}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
                        >
                            <FaPlay className="mr-2" />
                            Start Quiz
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuizList; 