import React, { useState, useEffect } from 'react';
import { createUser, updateUser } from '../../services/api';

interface UserFormProps {
    user?: {
        id: string;
        name: string;
        login: string;
        is_admin: boolean;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        login: '',
        password: '',
        is_admin: false
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                login: user.login,
                password: '', // Password is not loaded for security reasons
                is_admin: user.is_admin
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
                const updateData = {
                    name: formData.name,
                    login: formData.login,
                    is_admin: formData.is_admin
                };
                if (formData.password) {
                    (updateData as any).password = formData.password;
                }
                await updateUser(user.id, updateData);
            } else {
                // Create new user
                await createUser(formData);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Произошла ошибка при сохранении пользователя');
        } finally {
            setLoading(false);
        }
    };

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
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-blue-600"
                                checked={formData.is_admin}
                                onChange={(e) => setFormData({ ...formData, is_admin: e.target.checked })}
                            />
                            <span className="ml-2 text-gray-700">Администратор</span>
                        </label>
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