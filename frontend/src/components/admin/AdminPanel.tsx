import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaEdit, FaTrash, FaPlus, FaEye, FaTimes } from 'react-icons/fa';
import { getAdminQuizzes, getUsers, deleteUser, deleteQuiz } from '../../services/api';
import { Quiz } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'quizzes'>('users');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [showQuizModal, setShowQuizModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                if (activeTab === 'quizzes') {
                    const quizzesData = await getAdminQuizzes();
                    setQuizzes(quizzesData);
                } else {
                    const usersData = await getUsers();
                    setUsers(usersData);
                }
            } catch (err) {
                setError('Ошибка при загрузке данных');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    const handleDeleteQuiz = async (quizId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этот тест?')) {
            try {
                await deleteQuiz(quizId);
                setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
            } catch (err) {
                setError('Ошибка при удалении теста');
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            try {
                await deleteUser(userId);
                setUsers(users.filter(user => user._id !== userId));
            } catch (err) {
                setError('Ошибка при удалении пользователя');
            }
        }
    };

    const handleEditQuiz = (quizId: string) => {
        navigate(`/admin/quizzes/edit/${quizId}`);
    };

    const handleEditUser = (userId: string) => {
        // TODO: Добавить редактирование пользователя
        console.log('Редактирование пользователя:', userId);
    };

    const handleViewQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
    };

    const closeQuizModal = () => {
        setSelectedQuiz(null);
        setShowQuizModal(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Панель администратора</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            activeTab === 'users'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FaUsers />
                        <span>Пользователи</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('quizzes')}
                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                            activeTab === 'quizzes'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <FaBook />
                        <span>Тесты</span>
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : activeTab === 'users' ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600">
                            <FaPlus />
                            <span>Добавить пользователя</span>
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ФИО
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Роль
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.login}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.is_admin ? 'Администратор' : 'Пользователь'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user._id)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                        <button 
                            onClick={() => navigate('/admin/quizzes/new')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
                        >
                            <FaPlus />
                            <span>Добавить тест</span>
                        </button>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Название
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Предмет
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Сложность
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Вопросов
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {quizzes.map((quiz) => (
                                <tr key={quiz._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{quiz.category}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            quiz.difficulty?.toLowerCase() === 'easy' ? 'bg-green-100 text-green-800' :
                                            quiz.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            quiz.difficulty?.toLowerCase() === 'hard' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {quiz.difficulty || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{quiz.questions.length}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleViewQuiz(quiz)}
                                            className="text-gray-600 hover:text-gray-900 mr-4"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleEditQuiz(quiz._id)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            
            {/* Модальное окно для просмотра подробностей квиза */}
            {showQuizModal && selectedQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
                            <h2 className="text-xl font-bold text-gray-900">Просмотр теста</h2>
                            <button
                                onClick={closeQuizModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Название</h3>
                                    <p className="text-lg font-medium text-gray-900">{selectedQuiz.title}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Категория</h3>
                                    <p className="text-lg font-medium text-gray-900">{selectedQuiz.category}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Сложность</h3>
                                    <p className="text-lg font-medium text-gray-900">{selectedQuiz.difficulty}</p>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Время (минуты)</h3>
                                    <p className="text-lg font-medium text-gray-900">{selectedQuiz.time_limit}</p>
                                </div>
                                
                                <div className="md:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500">Описание</h3>
                                    <p className="text-base text-gray-900">{selectedQuiz.description}</p>
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                                Вопросы ({selectedQuiz.questions.length})
                            </h3>
                            
                            <div className="space-y-6">
                                {selectedQuiz.questions.map((question, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                                        <h4 className="font-medium text-gray-900 mb-2">
                                            Вопрос {index + 1}: {question.text}
                                        </h4>
                                        
                                        <ul className="space-y-1 mt-2">
                                            {question.options.map((option, optIndex) => (
                                                <li
                                                    key={optIndex}
                                                    className={`py-1 px-2 rounded ${
                                                        optIndex === question.correct_answer
                                                            ? 'bg-green-100 text-green-800'
                                                            : ''
                                                    }`}
                                                >
                                                    {optIndex === question.correct_answer && '✓ '}
                                                    {option}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => {
                                    closeQuizModal();
                                    handleEditQuiz(selectedQuiz._id);
                                }}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                            >
                                Редактировать
                            </button>
                            <button
                                onClick={closeQuizModal}
                                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
                            >
                                Закрыть
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel; 