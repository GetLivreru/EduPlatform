import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserQuizResults, getSavedLearningRecommendations } from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

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
  padding: 30px;
  overflow-y: auto;
  max-height: calc(100vh - 140px);
`;

const SidebarHeader = styled.h2`
  padding: 20px;
  margin: 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #e1e5ea;
`;

const QuizItem = styled.div<{ active: boolean }>`
  padding: 15px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e1e5ea;
  background-color: ${props => props.active ? '#e1e9f6' : 'transparent'};
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#e1e9f6' : '#f0f3f7'};
  }
`;

const QuizTitle = styled.h3`
  margin: 0 0 5px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
`;

const QuizMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 5px;
  font-size: 0.9rem;
  color: #666;
`;

const ScoreBadge = styled.span<{ score: number }>`
  display: inline-block;
  padding: 2px 8px;
  margin-right: 10px;
  background-color: ${props => {
    if (props.score >= 80) return '#4caf50';
    if (props.score >= 60) return '#8bc34a';
    if (props.score >= 40) return '#ffeb3b';
    return '#f44336';
  }};
  color: ${props => props.score >= 40 && props.score < 60 ? '#333' : '#fff'};
  border-radius: 12px;
  font-weight: 500;
  font-size: 0.8rem;
`;

const ContentHeader = styled.div`
  margin-bottom: 30px;
  border-bottom: 1px solid #e1e5ea;
  padding-bottom: 20px;
`;

const ContentTitle = styled.h1`
  margin: 0 0 10px 0;
  font-size: 1.8rem;
  color: #333;
`;

const ContentMeta = styled.div`
  display: flex;
  align-items: center;
  margin-top: 15px;
  font-size: 0.9rem;
  color: #666;
`;

const NoResults = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
`;

// Компоненты для плана обучения
const LearningSection = styled.div`
  margin-bottom: 30px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 1px solid #e9ecef;
`;

const WeakAreasList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0 0 20px 0;
`;

const WeakAreaItem = styled.li`
  padding: 8px 0;
  margin-bottom: 8px;
  border-bottom: 1px dashed #e9ecef;
  font-size: 1rem;
`;

const ResourcesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const ResourceCard = styled.a`
  display: block;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ResourceTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #0366d6;
`;

const ScheduleSection = styled.div`
  margin-top: 30px;
`;

const ScheduleDay = styled.div`
  margin-bottom: 15px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const DayTitle = styled.h3`
  margin: 0 0 10px 0;
  font-size: 1.1rem;
  color: #333;
`;

const TasksList = styled.ul`
  padding-left: 20px;
  margin: 0;
`;

const TaskItem = styled.li`
  margin-bottom: 5px;
`;

const ExercisesList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const ExerciseItem = styled.li`
  padding: 10px 15px;
  margin-bottom: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #0366d6;
`;

const OutcomesList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const OutcomeItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px dashed #e9ecef;
  display: flex;
  align-items: center;

  &:before {
    content: '✓';
    margin-right: 10px;
    color: #4caf50;
    font-weight: bold;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #666;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 40px 0;
  color: #d32f2f;
`;

interface QuizResult {
  _id: string;
  quiz_id: string;
  quiz_title: string;
  user_id: string;
  score: number;
  completed_at: string;
}

interface LearningResource {
  title: string;
  url: string;
}

interface StudyDay {
  day: string;
  tasks: string[];
}

interface LearningRecommendation {
  id?: string;
  user_id?: string;
  quiz_id?: string;
  subject?: string;
  level?: string;
  message?: string;
  weak_areas: string[];
  learning_resources: LearningResource[];
  practice_exercises: string[];
  study_schedule: StudyDay[];
  expected_outcomes: string[];
  created_at?: string;
}

const MyLearning: React.FC = () => {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<LearningRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const quizResults = await getUserQuizResults();
        setResults(quizResults);
        
        if (quizResults.length > 0) {
          setSelectedQuiz(quizResults[0].quiz_id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quiz results:', err);
        setError('Не удалось загрузить результаты квизов');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (selectedQuiz) {
        try {
          setLoading(true);
          // Используем новый эндпоинт для получения сохраненных рекомендаций
          const data = await getSavedLearningRecommendations(selectedQuiz);
          setRecommendation(data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching learning recommendations:', err);
          setError('Не удалось загрузить рекомендации по обучению');
          setLoading(false);
        }
      }
    };

    fetchRecommendations();
  }, [selectedQuiz]);

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <PageContainer>
        <NoResults>
          <h2>Требуется авторизация</h2>
          <p>Пожалуйста, войдите в систему, чтобы увидеть ваш план обучения.</p>
          <Link to="/login">Войти</Link>
        </NoResults>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Sidebar>
        <SidebarHeader>Пройденные квизы</SidebarHeader>
        {results.length === 0 ? (
          <NoResults>
            <p>Нет пройденных квизов</p>
          </NoResults>
        ) : (
          results.map((result) => (
            <QuizItem 
              key={result._id} 
              active={selectedQuiz === result.quiz_id}
              onClick={() => handleQuizSelect(result.quiz_id)}
            >
              <QuizTitle>{result.quiz_title}</QuizTitle>
              <QuizMeta>
                <ScoreBadge score={result.score}>{Math.round(result.score)}%</ScoreBadge>
                <span>{formatDate(result.completed_at)}</span>
              </QuizMeta>
            </QuizItem>
          ))
        )}
      </Sidebar>

      <MainContent>
        {loading ? (
          <LoadingMessage>Загрузка...</LoadingMessage>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : !selectedQuiz ? (
          <NoResults>
            <h2>Выберите квиз</h2>
            <p>Выберите пройденный квиз слева, чтобы увидеть персонализированный план обучения.</p>
          </NoResults>
        ) : recommendation ? (
          <>
            <ContentHeader>
              <ContentTitle>Ваш персональный план обучения</ContentTitle>
              <ContentMeta>
                Дата создания: {recommendation.created_at ? formatDate(recommendation.created_at) : 'Только что'}
              </ContentMeta>
            </ContentHeader>

            {recommendation.weak_areas && recommendation.weak_areas.length > 0 && (
              <LearningSection>
                <SectionTitle>Области для улучшения</SectionTitle>
                <WeakAreasList>
                  {recommendation.weak_areas.map((area, index) => (
                    <WeakAreaItem key={index}>{area}</WeakAreaItem>
                  ))}
                </WeakAreasList>
              </LearningSection>
            )}

            {recommendation.learning_resources && recommendation.learning_resources.length > 0 && (
              <LearningSection>
                <SectionTitle>Рекомендуемые ресурсы</SectionTitle>
                <ResourcesList>
                  {recommendation.learning_resources.map((resource, index) => (
                    <ResourceCard key={index} href={resource.url} target="_blank" rel="noopener noreferrer">
                      <ResourceTitle>{resource.title}</ResourceTitle>
                    </ResourceCard>
                  ))}
                </ResourcesList>
              </LearningSection>
            )}

            {recommendation.practice_exercises && recommendation.practice_exercises.length > 0 && (
              <LearningSection>
                <SectionTitle>Практические упражнения</SectionTitle>
                <ExercisesList>
                  {recommendation.practice_exercises.map((exercise, index) => (
                    <ExerciseItem key={index}>{exercise}</ExerciseItem>
                  ))}
                </ExercisesList>
              </LearningSection>
            )}

            {recommendation.study_schedule && recommendation.study_schedule.length > 0 && (
              <ScheduleSection>
                <SectionTitle>График обучения</SectionTitle>
                {recommendation.study_schedule.map((day, index) => (
                  <ScheduleDay key={index}>
                    <DayTitle>{day.day}</DayTitle>
                    <TasksList>
                      {day.tasks.map((task, taskIndex) => (
                        <TaskItem key={taskIndex}>{task}</TaskItem>
                      ))}
                    </TasksList>
                  </ScheduleDay>
                ))}
              </ScheduleSection>
            )}

            {recommendation.expected_outcomes && recommendation.expected_outcomes.length > 0 && (
              <LearningSection>
                <SectionTitle>Ожидаемые результаты</SectionTitle>
                <OutcomesList>
                  {recommendation.expected_outcomes.map((outcome, index) => (
                    <OutcomeItem key={index}>{outcome}</OutcomeItem>
                  ))}
                </OutcomesList>
              </LearningSection>
            )}
          </>
        ) : (
          <NoResults>
            <h2>Рекомендации не найдены</h2>
            <p>К сожалению, для данного квиза нет персонализированных рекомендаций.</p>
          </NoResults>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default MyLearning; 