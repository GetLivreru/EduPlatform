import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaClock, FaQuestion, FaPlay, FaExclamationCircle, FaSignInAlt, FaUserPlus, FaTimes } from 'react-icons/fa';
import { getQuizzes, Quiz } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface QuizListProps {
    selectedSubject: string;
    selectedDifficulty: string;
}

const QuizList: React.FC<QuizListProps> = ({ selectedSubject, selectedDifficulty }) => {
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                setLoading(true);
                console.log('Загрузка списка квизов...');
                const data = await getQuizzes();
                
                console.log('Получены данные квизов:', data);
                
                // Проверяем, что данные являются массивом
                if (!Array.isArray(data)) {
                    console.error('Полученные данные не являются массивом:', data);
                    setError('Ошибка формата данных квизов');
                    setLoading(false);
                    return;
                }
                
                // Проверяем поля квизов
                const validQuizzes = data.filter(quiz => {
                    const hasValidId = Boolean(quiz.id || quiz._id);
                    if (!hasValidId) {
                        console.warn('Квиз без действительного ID:', quiz);
                    }
                    return hasValidId;
                });
                
                console.log(`Загружено ${validQuizzes.length} квизов из ${data.length} полученных`);
                setQuizzes(validQuizzes);
                setError(null);
            } catch (err) {
                console.error('Ошибка при загрузке квизов:', err);
                setError('Ошибка при загрузке квизов');
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzes();
    }, []);

    const handleStartQuiz = (quizId: string) => {
        if (!quizId || quizId === 'undefined') {
            console.error('Попытка начать квиз с недопустимым ID:', quizId);
            setError('Ошибка: невозможно начать квиз с указанным ID');
            return;
        }
        
        console.log('Начинаем квиз с ID:', quizId);
        
        if (user) {
            navigate(`/quiz/${quizId}`);
        } else {
            // Для незарегистрированных пользователей показываем модальное окно
            setSelectedQuizId(quizId);
            setShowAuthModal(true);
        }
    };

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
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
                            key={quiz.id || quiz._id}
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
                                        ${quiz.difficulty?.toLowerCase() === 'easy' ? 'bg-green-100 text-green-800' :
                                        quiz.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'}`}>
                                        {quiz.difficulty?.toLowerCase() === 'easy' ? 'Легкий' :
                                         quiz.difficulty?.toLowerCase() === 'medium' ? 'Средний' : 'Сложный'}
                                    </span>
                                    <button
                                        onClick={() => handleStartQuiz(quiz.id || quiz._id)}
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

            {/* Модальное окно авторизации */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">Требуется авторизация</h3>
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-700 mb-4">
                                Для прохождения теста необходимо войти в систему или зарегистрироваться.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    <FaSignInAlt className="mr-2" />
                                    Войти
                                </button>
                                <button
                                    onClick={handleRegister}
                                    className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    <FaUserPlus className="mr-2" />
                                    Регистрация
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizList; 