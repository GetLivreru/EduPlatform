import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBook, FaClock, FaArrowLeft } from 'react-icons/fa';
import { getQuiz, startQuiz, submitAnswer } from '../services/api';
import type { Quiz as QuizType } from '../services/api';

const Quiz: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<QuizType | null>(null);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                if (!id) return;
                const quizData = await getQuiz(id);
                setQuiz(quizData);
                setTimeLeft(((quizData.time_limit ?? 30) * 60)); // Значение по умолчанию 30 минут
                const attempt = await startQuiz(id);
                setAttemptId(attempt.id ?? attempt._id ?? null);
                setLoading(false);
            } catch (err) {
                setError('Failed to load quiz');
                setLoading(false);
            }
        };

        loadQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (index: number) => {
        setSelectedAnswer(index);
    };

    const handleNextQuestion = async () => {
        if (!quiz || selectedAnswer === null || !attemptId) return;

        try {
            await submitAnswer(attemptId, currentQuestion, selectedAnswer);
            
            if (currentQuestion < quiz.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
                setSelectedAnswer(null);
            } else {
                // Quiz completed
                navigate('/results');
            }
        } catch (err) {
            setError('Failed to submit answer');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="text-center text-red-600 p-4">
                {error || 'Quiz not found'}
            </div>
        );
    }

    const currentQuestionData = quiz.questions[currentQuestion];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-500 hover:text-blue-600"
                >
                    <FaArrowLeft className="mr-2" />
                    Back to Quizzes
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                        <FaBook className="text-2xl text-blue-500 mr-3" />
                        <h1 className="text-2xl font-bold">{quiz.title}</h1>
                    </div>
                    <div className="flex items-center">
                        <FaClock className="text-xl text-blue-500 mr-2" />
                        <span className="text-lg font-semibold">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-2">
                        Question {currentQuestion + 1} of {quiz.questions.length}
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div
                            className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">{currentQuestionData.text}</h2>
                    <div className="space-y-3">
                        {currentQuestionData.options.map((option: string, index: number) => (
                            <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full p-4 text-left rounded-lg border transition-colors ${
                                    selectedAnswer === index
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-200'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className={`w-full py-3 px-6 rounded-lg text-white font-semibold ${
                        selectedAnswer === null
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                >
                    {currentQuestion === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                </button>
            </div>
        </div>
    );
};

export default Quiz; 