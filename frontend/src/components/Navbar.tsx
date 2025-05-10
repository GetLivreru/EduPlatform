import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaMoon, FaSun } from 'react-icons/fa';
import { logout as apiLogout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    console.log('Navbar: user state changed to:', user);
  }, [user]);

  const handleLogout = () => {
    console.log('Navbar: logout clicked');
    apiLogout();
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-900 dark:text-white transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Learning Path
          </Link>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title={theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
            >
              {theme === 'light' ? <FaMoon className="mr-2" /> : <FaSun className="mr-2" />}
              {theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
            </button>
            <Link to="/" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white">
              Квизы
            </Link>
            {user && (
              <Link to="/progress" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white">
                Прогресс
              </Link>
            )}
            {user?.is_admin && (
              <Link to="/admin/quizzes" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white flex items-center">
                <FaCog className="mr-1" />
                Админ панель
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600 dark:text-gray-200" />
                  <span className="text-gray-600 dark:text-gray-200">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white"
                >
                  Выход
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white">
                  Вход
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 