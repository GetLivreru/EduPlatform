import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getMyDocuments, 
  getMyGeneratedQuizzes, 
  deleteDocument, 
  getQuizStats,
  DocumentInfo, 
  TeacherQuiz, 
  QuizStats 
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  FaFileAlt, 
  FaRobot, 
  FaTrash, 
  FaEye, 
  FaChartBar, 
  FaUsers, 
  FaClock, 
  FaPercent,
  FaExclamationTriangle,
  FaPlus,
  FaSpinner,
  FaTrophy,
  FaCheckCircle
} from 'react-icons/fa';

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [quizzes, setQuizzes] = useState<TeacherQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'documents' | 'quizzes'>('documents');
  const [selectedQuizStats, setSelectedQuizStats] = useState<QuizStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Check if user is teacher
  if (!user || user.role !== 'teacher') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center text-red-600 dark:text-red-400">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <h2 className="text-xl font-bold mb-2">Доступ запрещен</h2>
          <p>Только преподаватели могут просматривать этот раздел.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [documentsResponse, quizzesResponse] = await Promise.all([
        getMyDocuments(),
        getMyGeneratedQuizzes()
      ]);
      
      setDocuments(documentsResponse.documents);
      setQuizzes(quizzesResponse.quizzes);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Вы уверены? Это также удалит все связанные тесты.')) {
      return;
    }

    try {
      await deleteDocument(documentId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Ошибка при удалении документа');
    }
  };

  const handleViewQuizStats = async (quizId: string) => {
    try {
      setStatsLoading(true);
      const stats = await getQuizStats(quizId);
      setSelectedQuizStats(stats);
    } catch (error) {
      console.error('Error loading quiz stats:', error);
      alert('Ошибка при загрузке статистики');
    } finally {
      setStatsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (contentType: string) => {
    if (contentType.includes('pdf')) return '📄';
    if (contentType.includes('word')) return '📝';
    if (contentType.includes('text')) return '📋';
    return '📄';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <FaSpinner className="animate-spin mr-3 text-xl" />
          <span>Загрузка данных...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FaRobot className="text-3xl text-blue-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Панель преподавателя
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Управляйте своими документами и ИИ-тестами
              </p>
            </div>
          </div>
          <Link 
            to="/teacher/upload"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg 
                     flex items-center transition-colors"
          >
            <FaPlus className="mr-2" />
            Создать тест с ИИ
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <FaFileAlt className="text-xl mr-2" />
              <span className="font-semibold">Загруженных документов</span>
            </div>
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
              {documents.length}
            </p>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center text-green-600 dark:text-green-400">
              <FaRobot className="text-xl mr-2" />
              <span className="font-semibold">Созданных тестов</span>
            </div>
            <p className="text-2xl font-bold text-green-800 dark:text-green-200 mt-1">
              {quizzes.length}
            </p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center text-purple-600 dark:text-purple-400">
              <FaUsers className="text-xl mr-2" />
              <span className="font-semibold">Всего попыток</span>
            </div>
            <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
              {quizzes.reduce((sum, quiz) => sum + quiz.attempts_count, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FaFileAlt className="inline mr-2" />
              Мои документы ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'quizzes'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
              }`}
            >
              <FaRobot className="inline mr-2" />
              Мои тесты ({quizzes.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'documents' ? (
            // Documents Tab
            <div>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FaFileAlt className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Нет загруженных документов
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    Загрузите документ, чтобы создать тест с помощью ИИ
                  </p>
                  <Link 
                    to="/teacher/upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                             inline-flex items-center transition-colors"
                  >
                    <FaPlus className="mr-2" />
                    Загрузить документ
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{getFileIcon(doc.content_type)}</span>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                              {doc.filename}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Удалить документ"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                        <p>Загружен: {formatDate(doc.uploaded_at)}</p>
                        <p>Символов: {doc.text_length.toLocaleString()}</p>
                        <p className="flex items-center">
                          <FaRobot className="mr-1" />
                          Тестов создано: {doc.generated_quizzes}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Quizzes Tab
            <div>
              {quizzes.length === 0 ? (
                <div className="text-center py-12">
                  <FaRobot className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Нет созданных тестов
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    Загрузите документ, чтобы создать первый тест с ИИ
                  </p>
                  <Link 
                    to="/teacher/upload"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg 
                             inline-flex items-center transition-colors"
                  >
                    <FaRobot className="mr-2" />
                    Создать тест с ИИ
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div key={quiz.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <FaRobot className="text-blue-500 mr-2" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {quiz.title}
                            </h3>
                            <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${
                              quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                              quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {quiz.difficulty}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {quiz.description}
                          </p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FaClock className="mr-1" />
                              Создан: {formatDate(quiz.created_at)}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FaUsers className="mr-1" />
                              Попыток: {quiz.attempts_count}
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <FaTrophy className="mr-1" />
                              Категория: {quiz.category}
                            </div>
                            {quiz.source_document_id && (
                              <div className="flex items-center text-blue-600 dark:text-blue-400">
                                <FaFileAlt className="mr-1" />
                                ИИ-тест
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => navigate(`/quiz/${quiz.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm 
                                     flex items-center transition-colors"
                            title="Просмотреть тест"
                          >
                            <FaEye className="mr-1" />
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleViewQuizStats(quiz.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm 
                                     flex items-center transition-colors"
                            title="Статистика"
                          >
                            <FaChartBar className="mr-1" />
                            Статистика
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Stats Modal */}
      {selectedQuizStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Статистика: {selectedQuizStats.quiz_title}
                </h2>
                <button
                  onClick={() => setSelectedQuizStats(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-center">
                  <FaUsers className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Всего попыток</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                    {selectedQuizStats.total_attempts}
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
                  <FaCheckCircle className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Завершено</p>
                  <p className="text-xl font-bold text-green-800 dark:text-green-200">
                    {selectedQuizStats.completed_attempts}
                  </p>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
                  <FaTrophy className="mx-auto text-yellow-600 dark:text-yellow-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Средний балл</p>
                  <p className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
                    {selectedQuizStats.average_score}%
                  </p>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-center">
                  <FaPercent className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">% завершения</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                    {selectedQuizStats.completion_rate}%
                  </p>
                </div>
              </div>

              {selectedQuizStats.total_attempts === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <FaChartBar className="mx-auto text-4xl mb-2" />
                  <p>Пока нет попыток прохождения этого теста</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard; 