import React, { useState, useEffect } from 'react';
import { FaUsers, FaBook, FaEdit, FaTrash, FaPlus, FaEye, FaTimes, FaFilter } from 'react-icons/fa';
import { getAdminQuizzes, getUsers, deleteUser, deleteQuiz, getRoles, getUsersByRole, UserRole, Role, User } from '../../services/api';
import { Quiz } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import UserForm from './UserForm';

const AdminPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'quizzes'>('users');
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [showUserForm, setShowUserForm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await getRoles();
                setRoles(rolesData.roles);
            } catch (err) {
                console.error('Error fetching roles:', err);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null); // Очищаем предыдущие ошибки
                
                if (activeTab === 'quizzes') {
                    console.log('🔍 Загружаем квизы для админ панели...');
                    const quizzesData = await getAdminQuizzes();
                    setQuizzes(quizzesData);
                    console.log(`✅ Загружено ${quizzesData.length} квизов`);
                } else {
                    console.log('🔍 Загружаем пользователей для админ панели...');
                    if (selectedRole === 'all') {
                        const usersData = await getUsers();
                        setUsers(usersData);
                        console.log(`✅ Загружено ${usersData.length} пользователей`);
                    } else {
                        const roleUsersData = await getUsersByRole(selectedRole);
                        setUsers(roleUsersData.users);
                        console.log(`✅ Загружено ${roleUsersData.users.length} пользователей с ролью ${selectedRole}`);
                    }
                }
            } catch (err: any) {
                console.error('❌ Ошибка загрузки данных в админ панели:', err);
                const errorMessage = err.response?.data?.detail || err.message || 'Неизвестная ошибка';
                setError(`Ошибка при загрузке ${activeTab === 'quizzes' ? 'квизов' : 'пользователей'}: ${errorMessage}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab, selectedRole]);

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
                setUsers(users.filter(user => user.id !== userId));
            } catch (err) {
                setError('Ошибка при удалении пользователя');
            }
        }
    };

    const handleEditQuiz = (quizId: string) => {
        navigate(`/admin/quizzes/edit/${quizId}`);
    };

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setShowUserForm(true);
    };

    const handleAddUser = () => {
        setSelectedUser(undefined);
        setShowUserForm(true);
    };

    const handleUserFormSuccess = () => {
        // Refresh the users list
        if (activeTab === 'users') {
            const fetchUsers = async () => {
                try {
                    if (selectedRole === 'all') {
                        const usersData = await getUsers();
                        setUsers(usersData);
                    } else {
                        const roleUsersData = await getUsersByRole(selectedRole);
                        setUsers(roleUsersData.users);
                    }
                } catch (err) {
                    setError('Ошибка при обновлении списка пользователей');
                }
            };
            fetchUsers();
        }
    };

    const handleViewQuiz = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setShowQuizModal(true);
    };

    const closeQuizModal = () => {
        setSelectedQuiz(null);
        setShowQuizModal(false);
    };

    const getRoleDisplayName = (role: UserRole) => {
        const roleObj = roles.find(r => r.value === role);
        return roleObj ? roleObj.label : role;
    };

    const getRoleBadgeColor = (role: UserRole) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800';
            case 'teacher':
                return 'bg-blue-100 text-blue-800';
            case 'student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <button 
                                onClick={handleAddUser}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
                            >
                                <FaPlus />
                                <span>Добавить пользователя</span>
                            </button>
                            
                            <div className="flex items-center space-x-2">
                                <FaFilter className="text-gray-500" />
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value as UserRole | 'all')}
                                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                                >
                                    <option value="all">Все роли</option>
                                    {roles.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                            Всего пользователей: {users.length}
                        </div>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Баллы
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{user.login}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                                            {getRoleDisplayName(user.role)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.quiz_points || 0}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-600 hover:text-blue-900 mr-4"
                                            title="Редактировать пользователя"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Удалить пользователя"
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
                            onClick={() => navigate('/admin/quizzes/create')}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600"
                        >
                            <FaPlus />
                            <span>Создать тест</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {quizzes.map((quiz) => (
                            <div key={quiz._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                                    <span>Категория: {quiz.category}</span>
                                    <span>Вопросов: {quiz.questions?.length || 0}</span>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => handleViewQuiz(quiz)}
                                        className="text-green-600 hover:text-green-900"
                                        title="Просмотреть тест"
                                    >
                                        <FaEye />
                                    </button>
                                    <button
                                        onClick={() => handleEditQuiz(quiz._id!)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="Редактировать тест"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz._id!)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Удалить тест"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showUserForm && (
                <UserForm 
                    user={selectedUser}
                    onClose={() => setShowUserForm(false)}
                    onSuccess={handleUserFormSuccess}
                />
            )}

            {showQuizModal && selectedQuiz && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">{selectedQuiz.title}</h2>
                            <button
                                onClick={closeQuizModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="mb-4">
                            <p className="text-gray-600">{selectedQuiz.description}</p>
                            <div className="mt-2 text-sm text-gray-500">
                                <span>Категория: {selectedQuiz.category}</span>
                                <span className="ml-4">Сложность: {selectedQuiz.difficulty}</span>
                                <span className="ml-4">Время: {selectedQuiz.time_limit} мин</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Вопросы ({selectedQuiz.questions?.length || 0})</h3>
                            {selectedQuiz.questions?.map((question, index) => (
                                <div key={index} className="mb-4 p-3 border rounded">
                                    <p className="font-medium mb-2">{index + 1}. {question.text || question.question}</p>
                                    <ul className="list-disc list-inside ml-4">
                                        {question.options.map((option, optionIndex) => (
                                            <li key={optionIndex} className={optionIndex === question.correct_answer ? 'text-green-600 font-medium' : ''}>
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel; 