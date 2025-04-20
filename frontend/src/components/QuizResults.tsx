import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserQuizResults, getQuiz, getQuizResult, QuizResult, Quiz } from '../services/api';
import styled from 'styled-components';

const PageContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 100px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Sidebar = styled.div`
  width: 300px;
  background-color: #f5f7fa;
  border-radius: 8px 0 0 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 140px);
`;

const MainContent = styled.div`
  flex: 1;
  background-color: #fff;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const ResultItem = styled.div<{ active: boolean }>`
  padding: 15px;
  border-left: 4px solid ${props => props.active ? '#3f51b5' : 'transparent'};
  background-color: ${props => props.active ? '#e8eaf6' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background-color: ${props => props.active ? '#e8eaf6' : '#f0f2f5'};
  }
`;

const ResultTitle = styled.h3`
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
`;

const ResultMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
`;

const ResultScore = styled.span<{ score: number }>`
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#4caf50';
    if (props.score >= 60) return '#ff9800';
    return '#f44336';
  }};
`;

const Category = styled.span`
  background-color: #e3f2fd;
  padding: 2px 6px;
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

// Result detail components
const ResultHeader = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
`;

const ResultDetailTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
`;

const ResultDescription = styled.p`
  color: #666;
  margin-bottom: 15px;
`;

const ScoreCircle = styled.div<{ score: number }>`
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
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
  border: 4px solid ${props => {
    if (props.score >= 80) return '#4caf50';
    if (props.score >= 60) return '#ff9800';
    return '#f44336';
  }};
`;

const ScoreValue = styled.div<{ score: number }>`
  font-size: 32px;
  font-weight: bold;
  color: ${props => {
    if (props.score >= 80) return '#2e7d32';
    if (props.score >= 60) return '#e65100';
    return '#c62828';
  }};
`;

const ScoreLabel = styled.div`
  font-size: 14px;
  color: #666;
`;

const ResultDetails = styled.div`
  margin: 20px 0;
  background-color: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
`;

const DetailItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
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

const SectionTitle = styled.h3`
  font-size: 20px;
  margin: 30px 0 15px 0;
  color: #333;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
`;

const LearningMaterial = styled.div`
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
`;

const LearningTopic = styled.h4`
  font-size: 16px;
  margin: 0 0 10px 0;
  color: #333;
`;

const LearningDescription = styled.p`
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const LearningResourceLink = styled.a`
  display: block;
  margin-top: 10px;
  color: #3f51b5;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 15px;
`;

const Button = styled(Link)`
  padding: 10px 20px;
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

const QuizResults: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getUserQuizResults();
        setResults(data);
        
        if (data.length > 0) {
          setSelectedResult(data[0]);
          if (data[0].quiz_id) {
            const quizData = await getQuiz(data[0].quiz_id);
            setQuizDetails(quizData);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Failed to load quiz results');
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const selectResult = async (result: QuizResult) => {
    setSelectedResult(result);
    try {
      if (result.quiz_id) {
        const quizData = await getQuiz(result.quiz_id);
        setQuizDetails(quizData);
      }
    } catch (err) {
      console.error('Error fetching quiz details:', err);
    }
  };

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

  // Mock learning materials based on the quiz category
  const getLearningMaterials = (category?: string) => {
    if (!category) return [];

    switch (category.toLowerCase()) {
      case 'programming':
      case 'программирование':
        return [
          {
            topic: 'Основы программирования',
            description: 'Изучите базовые концепции программирования, включая переменные, типы данных и управляющие структуры.',
            link: 'https://learn.javascript.ru/'
          },
          {
            topic: 'Алгоритмы и структуры данных',
            description: 'Познакомьтесь с основными алгоритмами и структурами данных, используемыми в программировании.',
            link: 'https://visualgo.net/'
          }
        ];
      case 'math':
      case 'математика':
        return [
          {
            topic: 'Алгебра и геометрия',
            description: 'Укрепите свои знания в алгебре и геометрии с помощью интерактивных упражнений.',
            link: 'https://www.khanacademy.org/math'
          },
          {
            topic: 'Математический анализ',
            description: 'Изучите основы дифференциального и интегрального исчисления.',
            link: 'https://www.coursera.org/learn/calculus1'
          }
        ];
      case 'history':
      case 'история':
        return [
          {
            topic: 'История Казахстана',
            description: 'Узнайте больше о ключевых событиях и личностях в истории Казахстана.',
            link: 'https://e-history.kz/ru/'
          },
          {
            topic: 'Мировая история',
            description: 'Изучите важнейшие исторические события, изменившие ход мировой истории.',
            link: 'https://www.history.com/'
          }
        ];
      default:
        return [
          {
            topic: 'Дополнительные материалы',
            description: 'Расширьте свои знания с помощью этих дополнительных ресурсов.',
            link: 'https://www.coursera.org/'
          }
        ];
    }
  };

  if (loading) {
    return <LoadingMessage>Загрузка результатов...</LoadingMessage>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <PageContainer>
      <Sidebar>
        <PageTitle>Моё обучение</PageTitle>
        {results.length === 0 ? (
          <EmptyResults>
            <p>У вас пока нет пройденных квизов</p>
            <Link to="/">Пройти квиз</Link>
          </EmptyResults>
        ) : (
          results.map((result) => (
            <ResultItem 
              key={result._id} 
              active={selectedResult?._id === result._id}
              onClick={() => selectResult(result)}
            >
              <ResultTitle>{result.quiz_title}</ResultTitle>
              <ResultMeta>
                <Category>{result.quiz_category || 'Общее'}</Category>
                <ResultScore score={result.score}>{result.score.toFixed(1)}%</ResultScore>
              </ResultMeta>
              <ResultMeta>
                <span>Пройден: {formatDate(result.completed_at)}</span>
              </ResultMeta>
            </ResultItem>
          ))
        )}
      </Sidebar>
      
      <MainContent>
        {selectedResult && quizDetails ? (
          <>
            <ResultHeader>
              <ResultDetailTitle>{quizDetails.title}</ResultDetailTitle>
              <ResultDescription>{quizDetails.description}</ResultDescription>
              
              <ScoreCircle score={selectedResult.score}>
                <ScoreValue score={selectedResult.score}>
                  {selectedResult.score.toFixed(1)}%
                </ScoreValue>
                <ScoreLabel>{getScoreMessage(selectedResult.score)}</ScoreLabel>
              </ScoreCircle>
              
              <ResultDetails>
                <DetailItem>
                  <DetailLabel>Категория:</DetailLabel>
                  <DetailValue>{quizDetails.category}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Сложность:</DetailLabel>
                  <DetailValue>{quizDetails.difficulty}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Дата прохождения:</DetailLabel>
                  <DetailValue>{formatDate(selectedResult.completed_at)}</DetailValue>
                </DetailItem>
                <DetailItem>
                  <DetailLabel>Баллы:</DetailLabel>
                  <DetailValue>{Math.floor(selectedResult.score / 10)} баллов</DetailValue>
                </DetailItem>
              </ResultDetails>
            </ResultHeader>
            
            <SectionTitle>Материалы для обучения</SectionTitle>
            {getLearningMaterials(quizDetails.category).map((material, index) => (
              <LearningMaterial key={index}>
                <LearningTopic>{material.topic}</LearningTopic>
                <LearningDescription>{material.description}</LearningDescription>
                <LearningResourceLink href={material.link} target="_blank" rel="noopener noreferrer">
                  Изучить материал &rarr;
                </LearningResourceLink>
              </LearningMaterial>
            ))}
            
            <ButtonGroup>
              <PrimaryButton to="/">На главную</PrimaryButton>
            </ButtonGroup>
          </>
        ) : (
          <EmptyResults>
            <p>Выберите результат квиза из списка слева для просмотра детальной информации</p>
          </EmptyResults>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default QuizResults; 