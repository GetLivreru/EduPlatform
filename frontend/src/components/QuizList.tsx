import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaGraduationCap, FaClock, FaQuestion, FaPlay, FaExclamationCircle } from 'react-icons/fa';
import { getQuizzes, Quiz } from '../services/api';

interface QuizListProps {
    selectedSubject: string;
    selectedDifficulty: string;
}

const QuizList: React.FC<QuizListProps> = ({ selectedSubject, selectedDifficulty }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                const data = await getQuizzes();
                setQuizzes(data);
                setError(null);
            } catch (err) {
                setError('Ошибка при загрузке квизов');
            } finally {
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
        const matchesDifficulty = selectedDifficulty === 'all' || quiz.difficulty === selectedDifficulty;
        return matchesSubject && matchesDifficulty;
    });

    return (
        <div className="w-full">
            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && (
                <div className="flex items-center justify-center p-4 text-red-500">
                    <FaExclamationCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && filteredQuizzes.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    Квизы не найдены для выбранных фильтров
                </div>
            )}

            {!loading && !error && filteredQuizzes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                    {filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                        >
                            <div className="p-6">
                                <h3 className="text-xl font-bold mb-3 text-gray-800">{quiz.title}</h3>
                                <div className="flex items-center mb-2 text-gray-600">
                                    <FaBook className="mr-2" />
                                    <span>{quiz.category}</span>
                                </div>
                                <div className="flex items-center mb-2 text-gray-600">
                                    <FaQuestion className="mr-2" />
                                    <span>{quiz.questions.length} вопросов</span>
                                </div>
                                <div className="flex items-center mb-4 text-gray-600">
                                    <FaClock className="mr-2" />
                                    <span>{quiz.time_limit} минут</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold
                                        ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                        quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'}`}>
                                        {quiz.difficulty === 'easy' ? 'Легкий' :
                                         quiz.difficulty === 'medium' ? 'Средний' : 'Сложный'}
                                    </span>
                                    <button
                                        onClick={() => handleStartQuiz(quiz.id)}
                                        className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                                    >
                                        <FaPlay className="mr-2" />
                                        Начать
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizList; 