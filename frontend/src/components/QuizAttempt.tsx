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
        if (!quizId) {
            setError('Quiz ID is required');
            setLoading(false);
            return;
        }

        const loadQuiz = async () => {
            try {
                const quizData = await getQuiz(quizId);
                setQuiz(quizData);
                setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
                
                // Start quiz attempt
                const attempt = await startQuiz(quizId);
                setAttemptId(attempt._id);
                setLoading(false);
            } catch (err) {
                setError('Failed to load quiz');
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
            await submitAnswer(attemptId, {
                question_id: quiz.questions[currentQuestion]._id,
                selected_option: selectedOption
            });

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
            navigate(`/quiz-results/${attemptId}`, { state: { result } });
        } catch (err) {
            setError('Failed to finish quiz');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
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
                className="inline-flex items-center text-blue-500 hover:text-blue-600 mb-6"
            >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Quizzes
            </Link>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
                    <div className="text-lg font-semibold text-gray-700">
                        Time: {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        {currentQuestionData.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestionData.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                                    selectedOption === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => handleOptionSelect(index)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        onClick={() => navigate('/')}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
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