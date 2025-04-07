import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface Question {
  question: string;
  options: string[];
  correct_answer: string;
}

interface Quiz {
  _id: string;
  subject: string;
  questions: Question[];
  difficulty_level: string;
  time_limit?: number;
}

const QuizDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${id}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке квиза');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === quiz?.questions[currentQuestion].correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!quiz) {
    return <div className="text-center py-8">Квиз не найден</div>;
  }

  if (showResult) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Результаты квиза</h2>
        <p className="text-xl">
          Ваш результат: {score} из {quiz.questions.length}
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Вернуться к списку квизов
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">{quiz.subject}</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <span className="text-gray-600">Вопрос {currentQuestion + 1} из {quiz.questions.length}</span>
        </div>
        <h2 className="text-xl font-semibold mb-4">
          {quiz.questions[currentQuestion].question}
        </h2>
        <div className="space-y-3">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-3 text-left rounded ${
                selectedAnswer === option
                  ? 'bg-blue-100 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              } border`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          className={`mt-6 w-full py-2 rounded ${
            selectedAnswer
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentQuestion < quiz.questions.length - 1 ? 'Следующий вопрос' : 'Завершить квиз'}
        </button>
      </div>
    </div>
  );
};

export default QuizDetail; 