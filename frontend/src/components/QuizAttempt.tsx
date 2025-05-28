import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuiz, startQuiz, submitAnswer, finishQuiz } from '../services/api';

const QuizAttempt: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!quizId || quizId === 'undefined') {
            console.error('Invalid Quiz ID provided:', quizId);
            setError('Недопустимый ID квиза. Пожалуйста, вернитесь на главную страницу и выберите действительный квиз.');
            setLoading(false);
            return;
        }

        const loadQuiz = async () => {
            try {
                console.log(`Загрузка квиза с ID: ${quizId}`);
                const quizData = await getQuiz(quizId);
                
                if (!quizData) {
                    console.error('Quiz data is null or undefined');
                    throw new Error('Квиз не найден');
                }
                
                // Проверка наличия вопросов
                if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
                    console.error('Quiz has no questions:', quizData);
                    throw new Error('В квизе нет вопросов');
                }
                
                setQuiz(quizData);
                setTimeLeft(((quizData.time_limit ?? 30) * 60)); // Значение по умолчанию 30 минут
                
                // Start quiz attempt
                console.log('Начинаем попытку для квиза с ID:', quizId);
                const attempt = await startQuiz(quizId);
                
                if (!attempt || !attempt._id) {
                    console.error('Failed to create quiz attempt:', attempt);
                    throw new Error('Не удалось создать попытку квиза');
                }
                
                console.log('Создана попытка квиза с ID:', attempt._id);
                setAttemptId(attempt._id ?? attempt.id ?? null);
                setLoading(false);
            } catch (err) {
                console.error('Error loading quiz:', err);
                setError('Не удалось загрузить квиз. Пожалуйста, попробуйте позже или выберите другой квиз.');
                setLoading(false);
            }
        };

        loadQuiz();
    }, [quizId]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && attemptId) {
            handleFinish();
        }
    }, [timeLeft]);

    const handleOptionSelect = (optionIndex: number) => {
        setSelectedOption(optionIndex);
    };

    const handleNext = async () => {
        if (selectedOption === null || !attemptId) return;

        try {
            await submitAnswer(attemptId, currentQuestion, selectedOption);

            if (currentQuestion < quiz.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedOption(null);
            } else {
                handleFinish();
            }
        } catch (err) {
            setError('Failed to submit answer');
        }
    };

    const handleFinish = async () => {
        if (!attemptId) return;

        try {
            const result = await finishQuiz(attemptId);
            navigate(`/quiz-result/${attemptId}`, { state: { result } });
        } catch (err) {
            setError('Failed to finish quiz');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 dark:border-blue-400"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!quiz) return null;

    const currentQuestionData = quiz.questions[currentQuestion];
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Link 
                to="/"
                className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-6"
            >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Quizzes
            </Link>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quiz.title}</h2>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                        Time: {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                        {currentQuestionData.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestionData.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                                    selectedOption === index
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                                } dark:text-white`}
                                onClick={() => handleOptionSelect(index)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50"
                        onClick={handleNext}
                        disabled={selectedOption === null}
                    >
                        {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuizAttempt; 