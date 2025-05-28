/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserQuizResults, getQuiz, getLearningRecommendations } from '../services/api';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import type { QuizResult, Quiz } from '../services/api';
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

const LearningRecommendations = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const RecommendationSection = styled.div`
  margin-bottom: 20px;
`;

const RecommendationTitle = styled.h4`
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 18px;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecommendationItem = styled.li`
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const ResourceLink = styled.a`
  color: #3498db;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const RecommendationButton = styled(Link)`
  padding: 10px 20px;
  background-color: #4caf50;
  color: white;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background-color: #43a047;
  }
`;

const QuizResults: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [quizDetails, setQuizDetails] = useState<Quiz | null>(null);
  const [learningRecommendations, setLearningRecommendations] = useState<any>(null);

  // Моковые данные для разных квизов (по id или категории)
  const getWeakTopics = (quiz: Quiz | null) => {
    if (!quiz) return [];
    if (quiz.category?.toLowerCase().includes('math')) return ['Проценты', 'Линейные уравнения'];
    if (quiz.category?.toLowerCase().includes('history')) return ['XIX век', 'Великая Отечественная война'];
    return ['Общие темы'];
  };
  const getWeekPlan = (quiz: Quiz | null) => {
    if (!quiz) return [];
    if (quiz.category?.toLowerCase().includes('math')) return [
      { day: 'Пн', tasks: ['Видеоурок', 'Карточки'], done: true },
      { day: 'Вт', tasks: ['Мини-тест', 'Практика'], done: false },
      { day: 'Ср', tasks: ['Повторение'], done: false },
      { day: 'Чт', tasks: ['Видеоурок'], done: false },
      { day: 'Пт', tasks: ['Практика'], done: false },
      { day: 'Сб', tasks: ['Тестирование'], done: false },
      { day: 'Вс', tasks: ['Отдых'], done: false },
    ];
    if (quiz.category?.toLowerCase().includes('history')) return [
      { day: 'Пн', tasks: ['Чтение', 'Карточки'], done: true },
      { day: 'Вт', tasks: ['Мини-тест'], done: false },
      { day: 'Ср', tasks: ['Повторение'], done: false },
      { day: 'Чт', tasks: ['Видео'], done: false },
      { day: 'Пт', tasks: ['Практика'], done: false },
      { day: 'Сб', tasks: ['Тестирование'], done: false },
      { day: 'Вс', tasks: ['Отдых'], done: false },
    ];
    return [
      { day: 'Пн', tasks: ['Введение'], done: true },
      { day: 'Вт', tasks: ['Практика'], done: false },
      { day: 'Ср', tasks: ['Повторение'], done: false },
      { day: 'Чт', tasks: ['Видео'], done: false },
      { day: 'Пт', tasks: ['Практика'], done: false },
      { day: 'Сб', tasks: ['Тестирование'], done: false },
      { day: 'Вс', tasks: ['Отдых'], done: false },
    ];
  };
  const getAchievements = () => [
    { icon: '✅', label: 'Пройдено 5 квизов' },
    { icon: '🧠', label: 'Изучено 3 темы' },
  ];
  const getProgress = () => 54;

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
            
            // Fetch learning recommendations using the API function
            const recommendations = await getLearningRecommendations(
              quizData.category || 'General',
              quizData.level || 'Intermediate',
              { score: data[0].score },
              data[0].incorrect_questions || []
            );
            setLearningRecommendations(recommendations);
          }
        }
        setLoading(false);
      } catch (err) {
        setError('Ошибка загрузки');
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // При выборе результата — подгружаем детали квиза
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

  if (loading) return <LoadingMessage>Загрузка...</LoadingMessage>;
  if (error) return <div>{error}</div>;

  return (
    <PageContainer>
      {/* Sidebar — список всех результатов 
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
        <div style={{ fontSize: 20, marginBottom: 24 }}>
          Привет, {user?.name || 'друг'}! Вот твой персональный план.
        </div>
        {selectedResult && quizDetails && (
          <>
            <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px #0001', padding: 24, marginBottom: 32 }}>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                Квиз: {quizDetails.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                <ScoreCircle score={selectedResult.score} style={{ width: 100, height: 100, fontSize: 24 }}>
                  <ScoreValue score={selectedResult.score}>{Math.round(selectedResult.score)}%</ScoreValue>
                </ScoreCircle>
                <div>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>
                    Балл: <span style={{ fontWeight: 600, color: selectedResult.score >= 80 ? '#4caf50' : selectedResult.score >= 60 ? '#ff9800' : '#f44336' }}>{Math.round(selectedResult.score)}/100</span>
                  </div>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Уровень: B1 / Intermediate</div>
                  <div style={{ fontSize: 15, marginBottom: 4 }}>Слабые темы: {getWeakTopics(quizDetails).join(', ')}</div>
                  <PrimaryButton to={"/quiz/" + selectedResult.quiz_id}>🔁 Пройти ещё раз</PrimaryButton>
                </div>
              </div>
            </div>
            <SectionTitle>Учебный план на неделю</SectionTitle>
            <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              {getWeekPlan(quizDetails).map((d, i) => (
                <div key={i} style={{ background: d.done ? '#e8f5e9' : '#f5f5f5', borderRadius: 8, padding: 12, minWidth: 80, textAlign: 'center', border: d.done ? '2px solid #4caf50' : '1px solid #ddd' }}>
                  <div style={{ fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: 13, margin: '6px 0' }}>{d.tasks.join(' + ')}</div>
                  <div>{d.done ? '✔️' : ''}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 12, background: '#eee', borderRadius: 6, marginBottom: 32, overflow: 'hidden' }}>
              <div style={{ width: getProgress(quizDetails) + '%', background: '#3f51b5', height: '100%' }}></div>
            </div>
            <div style={{ marginBottom: 32, color: '#666' }}>Прогресс учебного плана: <b>{getProgress(quizDetails)}%</b></div>
            <SectionTitle>Тебе стоит изучить</SectionTitle>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
              <LearningMaterial>
                <LearningTopic>📹 Видео: Объяснение процентов</LearningTopic>
                <LearningDescription>Краткое видео по теме "Проценты" для закрепления материала.</LearningDescription>
                <LearningResourceLink href="https://www.youtube.com/watch?v=Vn8phH0k5HI" target="_blank">Смотреть</LearningResourceLink>
              </LearningMaterial>
              <LearningMaterial>
                <LearningTopic>📄 Статья: Как решать линейные уравнения</LearningTopic>
                <LearningDescription>Пошаговое руководство по решению линейных уравнений.</LearningDescription>
                <LearningResourceLink href="https://ege-study.ru/article/lineinye-uravneniya/" target="_blank">Читать</LearningResourceLink>
              </LearningMaterial>
              <LearningMaterial>
                <LearningTopic>🔗 Внешняя ссылка: Khan Academy: Линейные уравнения</LearningTopic>
                <LearningDescription>Интерактивные уроки и задачи по линейным уравнениям.</LearningDescription>
                <LearningResourceLink href="https://ru.khanacademy.org/math/algebra/one-variable-linear-equations" target="_blank">Перейти</LearningResourceLink>
              </LearningMaterial>
            </div>
             5. Генерация контента ИИ 
            <SectionTitle>Сгенерировать шпаргалку</SectionTitle>
            <div style={{ marginBottom: 16 }}>
              Быстрая шпаргалка по темам: <b>{getWeakTopics(quizDetails).join(', ')}</b>
            </div>
            <PrimaryButton to="#">Создать новый квиз по моим ошибкам</PrimaryButton>
            {/* 6. Прогресс и достижения 
            <SectionTitle>Достижения</SectionTitle>
            <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
              {getAchievements(quizDetails).map((a, i) => (
                <div key={i} style={{ background: '#f5f5f5', borderRadius: 8, padding: 16, minWidth: 120, textAlign: 'center', fontSize: 18 }}>
                  <div style={{ fontSize: 28 }}>{a.icon}</div>
                  <div>{a.label}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <RecommendationButton to={`/learning-recommendations/${selectedResult.quiz_id}`}>
                📚 Получить рекомендации по обучению
              </RecommendationButton>
            </div>
          </>
        )}
        
        {learningRecommendations && (
          <>
            <SectionTitle>Персональные рекомендации по обучению</SectionTitle>
            
            <LearningRecommendations>
              <RecommendationSection>
                <RecommendationTitle>Слабые места</RecommendationTitle>
                <RecommendationList>
                  {learningRecommendations.weak_areas.map((area: string, index: number) => (
                    <RecommendationItem key={index}>{area}</RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>

              <RecommendationSection>
                <RecommendationTitle>Рекомендуемые ресурсы</RecommendationTitle>
                <RecommendationList>
                  {learningRecommendations.learning_resources.map((resource: any, index: number) => (
                    <RecommendationItem key={index}>
                      <div>{resource.title}</div>
                      <ResourceLink href={resource.url} target="_blank">
                        Перейти к ресурсу
                      </ResourceLink>
                    </RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>

              <RecommendationSection>
                <RecommendationTitle>Практические упражнения</RecommendationTitle>
                <RecommendationList>
                  {learningRecommendations.practice_exercises.map((exercise: string, index: number) => (
                    <RecommendationItem key={index}>{exercise}</RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>

              <RecommendationSection>
                <RecommendationTitle>План обучения на неделю</RecommendationTitle>
                <RecommendationList>
                  {learningRecommendations.study_schedule.map((day: any, index: number) => (
                    <RecommendationItem key={index}>
                      <strong>{day.day}:</strong> {day.tasks.join(', ')}
                    </RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>

              <RecommendationSection>
                <RecommendationTitle>Ожидаемые результаты</RecommendationTitle>
                <RecommendationList>
                  {learningRecommendations.expected_outcomes.map((outcome: string, index: number) => (
                    <RecommendationItem key={index}>{outcome}</RecommendationItem>
                  ))}
                </RecommendationList>
              </RecommendationSection>
            </LearningRecommendations>
          </>
        )}
      </MainContent>
    </PageContainer>
  );
};

export default QuizResults; */