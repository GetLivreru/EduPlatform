import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserQuizResults, getQuiz, QuizResult, Quiz } from '../services/api';
import styled from 'styled-components';

const ResultsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const ResultsTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ResultCard = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-3px);
  }
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const QuizTitle = styled.h2`
  font-size: 18px;
  margin: 0;
`;

const Score = styled.div<{ score: number }>`
  font-size: 18px;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#4caf50';
    if (props.score >= 60) return '#ff9800';
    return '#f44336';
  }};
`;

const ResultInfo = styled.div`
  display: flex;
  justify-content: space-between;
  color: #666;
  font-size: 14px;
`;

const Category = styled.span`
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const EmptyResults = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 30px;
  color: #666;
`;

const QuizResults: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getUserQuizResults();
        setResults(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

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

  if (loading) {
    return <LoadingMessage>Загрузка результатов...</LoadingMessage>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ResultsContainer>
      <ResultsTitle>Мои результаты квизов</ResultsTitle>
      {results.length === 0 ? (
        <EmptyResults>
          <p>У вас пока нет пройденных квизов</p>
          <Link to="/">Пройти квиз</Link>
        </EmptyResults>
      ) : (
        <ResultsList>
          {results.map((result) => (
            <ResultCard key={result._id}>
              <ResultHeader>
                <QuizTitle>{result.quiz_title}</QuizTitle>
                <Score score={result.score}>{result.score.toFixed(1)}%</Score>
              </ResultHeader>
              <ResultInfo>
                <div>
                  {result.quiz_category && <Category>{result.quiz_category}</Category>}
                </div>
                <div>Пройден: {formatDate(result.completed_at)}</div>
              </ResultInfo>
            </ResultCard>
          ))}
        </ResultsList>
      )}
    </ResultsContainer>
  );
};

export default QuizResults; 