import React, { useState, useEffect } from 'react';
import { createUser, updateUser, getRoles, UserRole, Role, CreateUserRequest, UpdateUserRequest } from '../../services/api';

interface UserFormProps {
    user?: {
        id: string;
        name: string;
        login: string;
        role: UserRole;
        is_admin?: boolean; // для обратной совместимости
    };
    onClose: () => void;
    onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        login: '',
        password: '',
        role: 'student' as UserRole
    });
    const [roles, setRoles] = useState<Role[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [rolesLoading, setRolesLoading] = useState(true);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const rolesData = await getRoles();
                setRoles(rolesData.roles);
            } catch (err) {
                console.error('Error fetching roles:', err);
                setError('Ошибка при загрузке ролей');
            } finally {
                setRolesLoading(false);
            }
        };

        fetchRoles();
    }, []);

    useEffect(() => {
        if (user) {
            // Определяем роль для обратной совместимости
            let userRole: UserRole = user.role || 'student';
            if (!user.role && user.is_admin) {
                userRole = 'admin';
            }

            setFormData({
                name: user.name,
                login: user.login,
                password: '', // Password is not loaded for security reasons
                role: userRole
            });
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (user) {
                // Update existing user
                const updateData: UpdateUserRequest = {
                    name: formData.name,
                    login: formData.login,
                    role: formData.role
                };
                if (formData.password) {
                    updateData.password = formData.password;
                }
                await updateUser(user.id, updateData);
            } else {
                // Create new user
                const createData: CreateUserRequest = {
                    name: formData.name,
                    login: formData.login,
                    password: formData.password,
                    role: formData.role
                };
                await createUser(createData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Произошла ошибка при сохранении пользователя');
        } finally {
            setLoading(false);
        }
    };

    const getRoleDisplayName = (role: UserRole) => {
        const roleObj = roles.find(r => r.value === role);
        return roleObj ? roleObj.label : role;
    };

    const getRoleDescription = (role: UserRole) => {
        const roleObj = roles.find(r => r.value === role);
        return roleObj ? roleObj.description : '';
    };

    if (rolesLoading) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                    <div className="flex justify-center items-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="ml-2">Загрузка ролей...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">
                    {user ? 'Редактировать пользователя' : 'Создать пользователя'}
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            ФИО
                        </label>
                        <input
                            type="text"
                            id="name"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="login">
                            Email
                        </label>
                        <input
                            type="email"
                            id="login"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.login}
                            onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            {user ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                            Роль пользователя
                        </label>
                        <select
                            id="role"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                            required
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {formData.role && (
                            <p className="text-sm text-gray-600 mt-1">
                                {getRoleDescription(formData.role)}
                            </p>
                        )}
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            disabled={loading}
                        >
                            {loading ? 'Сохранение...' : user ? 'Сохранить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm; 