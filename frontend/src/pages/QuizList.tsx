import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Quiz {
  _id: string;
  subject: string;
  difficulty_level: string;
  time_limit?: number;
}

const QuizList = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('/api/quizzes/math'); // Пример для предмета "математика"
        if (!response.ok) {
          throw new Error('Ошибка при загрузке квизов');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Доступные квизы</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Link
            key={quiz._id}
            to={`/quiz/${quiz._id}`}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-800">{quiz.subject}</h2>
            <p className="text-gray-600 mt-2">Уровень сложности: {quiz.difficulty_level}</p>
            {quiz.time_limit && (
              <p className="text-gray-600">Время на прохождение: {quiz.time_limit} минут</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuizList; 