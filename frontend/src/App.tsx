import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { testConnection, getWelcomeMessage } from './services/api';
import QuizList from './components/QuizList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import QuizAttempt from './components/QuizAttempt';
import QuizManager from './components/admin/QuizManager';
import AdminPanel from './components/admin/AdminPanel';
import { FaUser, FaCog, FaFilter } from 'react-icons/fa';
import Quiz from './components/Quiz';

// Компонент для проверки прав администратора
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setIsAdmin(false);
                    return;
                }

                // TODO: Добавить проверку прав администратора через API
                // Временно используем заглушку
                setIsAdmin(true);
            } catch (error) {
                setIsAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    if (isAdmin === null) {
        return <div>Загрузка...</div>;
    }

    if (!isAdmin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [backendStatus, setBackendStatus] = useState<string>('checking');
    const [welcomeMessage, setWelcomeMessage] = useState<string>('');
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
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

        const checkAuth = () => {
            const token = localStorage.getItem('token');
            setIsAuthenticated(!!token);
            // TODO: Добавить проверку прав администратора
            setIsAdmin(true); // Временно
        };

        checkConnection();
        checkAuth();
    }, []);

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
                        <div className="flex space-x-4">
                            {isAuthenticated ? (
                                <>
                                    {isAdmin && (
                                        <Link 
                                            to="/admin" 
                                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                        >
                                            Панель администратора
                                        </Link>
                                    )}
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            window.location.reload();
                                        }}
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
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/quiz/:quizId" element={<QuizAttempt />} />
                    <Route path="/admin/quizzes" element={<QuizManager />} />
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <AdminPanel />
                            </AdminRoute>
                        }
                    />
                    <Route path="/quiz/:id" element={<Quiz />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App; 