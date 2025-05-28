import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuiz, getAttempt, Quiz, QuizAttempt } from '../services/api';
import styled from 'styled-components';

const ResultContainer = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const ResultHeader = styled.div`
  margin-bottom: 30px;
`;

const QuizTitle = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
`;

const QuizDescription = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 180px;
  height: 180px;
  margin: 0 auto 30px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${props => {
    if (props.score >= 80) return '#e8f5e9';
    if (props.score >= 60) return '#fff8e1';
    return '#ffebee';
  }};
  border: 6px solid ${props => {
    if (props.score >= 80) return '#4caf50';
    if (props.score >= 60) return '#ff9800';
    return '#f44336';
  }};
`;

const ScoreValue = styled.div<{ score: number }>`
  font-size: 42px;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#2e7d32';
    if (props.score >= 60) return '#e65100';
    return '#c62828';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 16px;
  color: #666;
`;

const ResultDetails = styled.div`
  margin: 30px 0;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  text-align: left;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #666;
`;

const DetailValue = styled.span`
  font-weight: 500;
  color: #333;
`;

const PointsEarned = styled.div`
  font-size: 18px;
  color: #4caf50;
  margin: 20px 0;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  display: inline-block;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled(Link)`
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #3f51b5;
  color: white;
  
  &:hover {
    background-color: #303f9f;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #f5f5f5;
  color: #333;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 18px;
`;

interface QuizResultPageProps {
  attemptId?: string;
}

const QuizResultPage: React.FC<QuizResultPageProps> = ({ attemptId: propAttemptId }) => {
  const params = useParams<{ attemptId: string }>();
  const attemptId = propAttemptId || params.attemptId;
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    if (!attemptId) {
      setError('Attempt ID is required');
      setLoading(false);
      return;
    }

    const loadAttemptAndQuiz = async () => {
      try {
        setLoading(true);
        const attemptData = await getAttempt(attemptId);
        setAttempt(attemptData);
        
        if (attemptData.quiz_id) {
          const quizData = await getQuiz(attemptData.quiz_id);
          setQuiz(quizData);
        }
        
        // Calculate points earned (1 point per 10% of score)
        if (attemptData.score !== undefined) {
          setPointsEarned(Math.floor(attemptData.score / 10));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading attempt result:', err);
        setError('Failed to load quiz result');
        setLoading(false);
      }
    };

    loadAttemptAndQuiz();
  }, [attemptId]);

  if (loading) {
    return <LoadingMessage>Загрузка результатов...</LoadingMessage>;
  }

  if (error || !attempt || !quiz) {
    return <div>Ошибка: {error || 'Результаты не найдены'}</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Отлично!';
    if (score >= 70) return 'Хороший результат!';
    if (score >= 50) return 'Неплохо!';
    return 'Старайтесь лучше!';
  };

  return (
    <ResultContainer>
      <ResultHeader>
        <QuizTitle>{quiz.title}</QuizTitle>
        <QuizDescription>{quiz.description}</QuizDescription>
      </ResultHeader>

      {attempt.score !== undefined && (
        <ScoreCircle score={attempt.score}>
          <ScoreValue score={attempt.score}>{attempt.score.toFixed(1)}%</ScoreValue>
          <ScoreLabel>{getScoreMessage(attempt.score)}</ScoreLabel>
        </ScoreCircle>
      )}

      <ResultDetails>
        <DetailItem>
          <DetailLabel>Категория:</DetailLabel>
          <DetailValue>{quiz.category}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Сложность:</DetailLabel>
          <DetailValue>{quiz.difficulty}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Дата прохождения:</DetailLabel>
          <DetailValue>{attempt.start_time ? formatDate(attempt.start_time) : 'Нет данных'}</DetailValue>
        </DetailItem>
        <DetailItem>
          <DetailLabel>Правильных ответов:</DetailLabel>
          <DetailValue>
            {attempt.answers.filter((a: any, i: number) => 
              i < quiz.questions.length && a.answer === quiz.questions[i].correct_answer
            ).length} из {quiz.questions.length}
          </DetailValue>
        </DetailItem>
      </ResultDetails>

      {pointsEarned > 0 && (
        <PointsEarned>
          Вы заработали {pointsEarned} {pointsEarned === 1 ? 'балл' : 
            pointsEarned < 5 ? 'балла' : 'баллов'}!
        </PointsEarned>
      )}

      <ButtonGroup>
        <PrimaryButton to="/">На главную</PrimaryButton>
        <SecondaryButton to="/quiz-results">Все результаты</SecondaryButton>
      </ButtonGroup>
    </ResultContainer>
  );
};

export default QuizResultPage; 