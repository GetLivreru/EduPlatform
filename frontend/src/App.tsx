import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { testConnection, checkIsAdmin } from './services/api';
import QuizList from './components/QuizList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizAttempt from './components/QuizAttempt';
import QuizManager from './components/admin/QuizManager';
import AdminPanel from './components/admin/AdminPanel';
import QuizResultPage from './components/QuizResultPage';
import MyLearning from './components/MyLearning';
import { FaFilter } from 'react-icons/fa';
import Quiz from './components/Quiz';
import { AuthProvider, useAuth } from './context/AuthContext';
import LearningRecommendations from './pages/LearningRecommendations';
import Navbar from './components/Navbar';
import DocumentUpload from './components/teacher/DocumentUpload';
import TeacherDashboard from './components/teacher/TeacherDashboard';

// Компонент для проверки прав администратора
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAdminStatus = async () => {
            try {
                setIsLoading(true);
                // Сначала проверяем, авторизован ли пользователь
                if (!user) {
                    setIsAdmin(false);
                    setIsLoading(false);
                    return;
                }

                // Проверяем права администратора через API
                const isAdminResult = await checkIsAdmin();
                setIsAdmin(isAdminResult);
            } catch (error) {
                console.error('Error checking admin rights:', error);
                setIsAdmin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="ml-3 text-gray-700">Проверка прав доступа...</p>
        </div>;
    }

    if (!isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

// Компонент для проверки прав преподавателя или админа
const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Проверяем роль преподавателя или старое поле is_admin для обратной совместимости
    const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'admin' || user.is_admin;
    
    if (!isTeacherOrAdmin) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};

// Компонент для проверки прав только преподавателя (НЕ админа)
const TeacherOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();
    
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Проверяем, что пользователь именно преподаватель (НЕ админ)
    if (user.role !== 'teacher') {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [backendStatus, setBackendStatus] = useState<string>('checking');

    useEffect(() => {
        const checkConnection = async () => {
            try {
                await testConnection();
                setBackendStatus('success');
            } catch (error) {
                setBackendStatus('error');
            }
        };

        checkConnection();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 dark:text-white">
            <Navbar />
            
            {/* Статус подключения */}
            <div className="bg-white shadow-sm dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Статус сервера: <span className={`font-semibold ${backendStatus === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {backendStatus === 'success' ? 'Подключен' : 'Ошибка подключения'}
                        </span>
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
                        © 2024 Платформа образовательных тестов. Все права защищены.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const HomePage: React.FC = () => {
    const [selectedSubject, setSelectedSubject] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Доступные тесты</h2>
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                    <FaFilter className="text-gray-500 dark:text-gray-400 mr-2" />
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="all">Все предметы</option>
                        <option value="ICT">Информатика</option>
                        <option value="Mathematics">Математика</option>
                        <option value="English">Английский язык</option>
                        <option value="History">История</option>
                        <option value="Программирование">Программирование</option>
                    </select>
                </div>
                
                <div className="flex items-center">
                    <FaFilter className="text-gray-500 dark:text-gray-400 mr-2" />
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                        <option value="all">Все уровни</option>
                        <option value="Easy">Легкий</option>
                        <option value="Medium">Средний</option>
                        <option value="Hard">Сложный</option>
                    </select>
                </div>
            </div>
            <QuizList selectedSubject={selectedSubject} selectedDifficulty={selectedDifficulty} />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/quiz/:quizId" element={<QuizAttempt />} />
                        <Route path="/progress" element={<MyLearning />} />
                        <Route path="/quiz-result/:attemptId" element={<QuizResultPage />} />
                        
                        {/* Маршруты для преподавателей */}
                        <Route
                            path="/teacher/quizzes"
                            element={
                                <TeacherRoute>
                                    <TeacherDashboard />
                                </TeacherRoute>
                            }
                        />
                        <Route
                            path="/teacher/upload"
                            element={
                                <TeacherOnlyRoute>
                                    <DocumentUpload />
                                </TeacherOnlyRoute>
                            }
                        />
                        
                        {/* Маршруты для администраторов */}
                        <Route
                            path="/admin/quizzes/new"
                            element={
                                <AdminRoute>
                                    <QuizManager />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/quizzes/edit/:quizId"
                            element={
                                <AdminRoute>
                                    <QuizManager />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin/quizzes"
                            element={
                                <AdminRoute>
                                    <QuizManager />
                                </AdminRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <AdminRoute>
                                    <AdminPanel />
                                </AdminRoute>
                            }
                        />
                        
                        {/* Дополнительные маршруты */}
                        <Route path="/quiz/:id" element={<Quiz />} />
                        <Route path="/learning-recommendations/:quizId" element={<LearningRecommendations />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
};

export default App; 