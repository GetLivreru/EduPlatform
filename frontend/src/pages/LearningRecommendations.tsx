import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getLearningRecommendations, getQuiz, Quiz, getQuizResult } from '../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  font-size: 28px;
  color: #333;
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: #666;
  font-size: 16px;
`;

const RecommendationsContainer = styled.div`
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ResourceLink = styled.a`
  color: #3498db;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #e74c3c;
`;

const BackButton = styled.button`
  padding: 10px 20px;
  background: #3f51b5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;

  &:hover {
    background: #303f9f;
  }
`;

const LearningRecommendations: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!quizId) {
          throw new Error('ID квиза не указан');
        }

        // Получаем детали квиза
        const quiz = await getQuiz(quizId);
        setQuizDetails(quiz);

        // Получаем результаты теста
        const quizResult = await getQuizResult(quizId);
        
        // Получаем рекомендации с реальными результатами
        const recommendations = await getLearningRecommendations(
          quiz.category || 'Общее',
          quiz.level || 'Средний',
          { score: quizResult.score },
          quizResult.incorrect_questions || []
        );
        setRecommendations(recommendations);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке рекомендаций');
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  if (loading) return <LoadingMessage>Загрузка рекомендаций...</LoadingMessage>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!recommendations) return <ErrorMessage>Рекомендации не найдены</ErrorMessage>;

  return (
    <PageContainer>
      <BackButton onClick={() => navigate(-1)}>← Назад</BackButton>
      
      <Header>
        <Title>Персональные рекомендации по обучению</Title>
        <Description>
          На основе ваших результатов в квизе "{quizDetails?.title}" мы подготовили для вас индивидуальный план обучения
        </Description>
      </Header>

      <RecommendationsContainer>
        <Section>
          <SectionTitle>Слабые места</SectionTitle>
          <List>
            {recommendations.weak_areas.map((area: string, index: number) => (
              <ListItem key={index}>• {area}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Рекомендуемые ресурсы</SectionTitle>
          <List>
            {recommendations.learning_resources.map((resource: any, index: number) => (
              <ListItem key={index}>
                <div>
                  <div style={{ fontWeight: 500 }}>{resource.title}</div>
                  <ResourceLink href={resource.url} target="_blank">
                    Перейти к ресурсу →
                  </ResourceLink>
                </div>
              </ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Практические упражнения</SectionTitle>
          <List>
            {recommendations.practice_exercises.map((exercise: string, index: number) => (
              <ListItem key={index}>• {exercise}</ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>План обучения на неделю</SectionTitle>
          <List>
            {recommendations.study_schedule.map((day: any, index: number) => (
              <ListItem key={index}>
                <strong>{day.day}:</strong> {day.tasks.join(', ')}
              </ListItem>
            ))}
          </List>
        </Section>

        <Section>
          <SectionTitle>Ожидаемые результаты</SectionTitle>
          <List>
            {recommendations.expected_outcomes.map((outcome: string, index: number) => (
              <ListItem key={index}>• {outcome}</ListItem>
            ))}
          </List>
        </Section>
      </RecommendationsContainer>
    </PageContainer>
  );
};

export default LearningRecommendations; 