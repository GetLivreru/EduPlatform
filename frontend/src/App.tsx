import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { testConnection, getWelcomeMessage, checkIsAdmin } from './services/api';
import QuizList from './components/QuizList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizAttempt from './components/QuizAttempt';
import QuizManager from './components/admin/QuizManager';
import AdminPanel from './components/admin/AdminPanel';
import QuizResults from './components/QuizResults';
import QuizResultPage from './components/QuizResultPage';
import MyLearning from './components/MyLearning';
import { FaFilter } from 'react-icons/fa';
import Quiz from './components/Quiz';
import { AuthProvider, useAuth } from './context/AuthContext';
import LearningRecommendations from './pages/LearningRecommendations';

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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [backendStatus, setBackendStatus] = useState<string>('checking');
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const { user, logout } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                await testConnection();
                setBackendStatus('success');
                const message = await getWelcomeMessage();
                setWelcomeMessage(message);
            } catch (error) {
                setBackendStatus('error');
                setWelcomeMessage('Failed to connect to backend');
            }
        };

        checkConnection();
    }, []);

    useEffect(() => {
        const verifyAdminRights = async () => {
            if (user) {
                try {
                    const hasAdminRights = await checkIsAdmin();
                    setIsAdmin(hasAdminRights);
                } catch (error) {
                    console.error('Error verifying admin rights:', error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        };

        verifyAdminRights();
    }, [user]);

    const handleLogout = () => {
        logout();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
                                {welcomeMessage}
                            </Link>
                            <p className="text-sm text-gray-500">
                                Статус сервера: <span className={`font-semibold ${backendStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {backendStatus === 'success' ? 'Подключен' : 'Ошибка подключения'}
                                </span>
                            </p>
                        </div>
                        <div className="flex items-center space-x-4">
                            {user ? (
                                <>
                                    <span className="text-gray-700">Привет, {user.name}</span>
                                    {user.quiz_points > 0 && (
                                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                                            {user.quiz_points} {user.quiz_points === 1 ? 'балл' : 
                                                user.quiz_points < 5 ? 'балла' : 'баллов'}
                                        </span>
                                    )}
                                    <Link 
                                        to="/my-learning" 
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        <div className='flex items-center'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="mr-2" viewBox="0 0 16 16">
                                                <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                                            </svg>
                                            Моё обучение
                                        </div>
                                    </Link>
                                    {isAdmin && (
                                        <Link 
                                            to="/admin" 
                                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        >
                                            Панель администратора
                                        </Link>
                                    )}
                                    <button 
                                        onClick={handleLogout}
                                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                    >
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login" 
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                    >
                                        Войти
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            <footer className="bg-white border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <p className="text-center text-gray-500 text-sm">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Доступные тесты</h2>
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center">
                    <FaFilter className="text-gray-500 mr-2" />
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="all">Все предметы</option>
                        <option value="C++">C++</option>
                        <option value="ICT">ICT</option>
                    </select>
                </div>
                
                <div className="flex items-center">
                    <FaFilter className="text-gray-500 mr-2" />
                    <select
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        <Route path="/quiz-results" element={<QuizResults />} />
                        <Route path="/my-learning" element={<MyLearning />} />
                        <Route path="/quiz-result/:attemptId" element={<QuizResultPage />} />
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