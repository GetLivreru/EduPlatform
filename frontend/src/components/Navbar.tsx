import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog, FaMoon, FaSun, FaChalkboardTeacher, FaGraduationCap, FaRobot, FaBrain, FaChartLine } from 'react-icons/fa';
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

  // Функция для проверки роли
  const hasRole = (role: string) => {
    if (!user) return false;
    // Проверяем новое поле role, если его нет - используем старое is_admin
    if (user.role) {
      return user.role === role;
    }
    // Обратная совместимость
    if (role === 'admin') {
      return user.is_admin;
    }
    return false;
  };

  // Функция для проверки административных прав
  const isAdmin = () => hasRole('admin');
  
  // Функция для проверки прав преподавателя
  const isTeacher = () => hasRole('teacher');
  
  // Функция для проверки прав преподавателя или админа
  const isTeacherOrAdmin = () => hasRole('teacher') || hasRole('admin');

  // Функция для получения отображаемого имени роли
  const getRoleDisplayName = () => {
    if (!user) return '';
    
    switch (user.role) {
      case 'admin':
        return 'Администратор';
      case 'teacher':
        return 'Преподаватель';
      case 'student':
        return 'Студент';
      default:
        // Обратная совместимость
        return user.is_admin ? 'Администратор' : 'Студент';
    }
  };

  // Функция для получения иконки роли
  const getRoleIcon = () => {
    if (!user) return <FaUser />;
    
    switch (user.role) {
      case 'admin':
        return <FaCog className="text-red-500" />;
      case 'teacher':
        return <FaChalkboardTeacher className="text-blue-500" />;
      case 'student':
        return <FaGraduationCap className="text-green-500" />;
      default:
        // Обратная совместимость
        return user.is_admin ? <FaCog className="text-red-500" /> : <FaGraduationCap className="text-green-500" />;
    }
  };

  return (
    <nav className="bg-white shadow-lg dark:bg-gray-900 dark:text-white transition-colors">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            🎓 LearnApp AI
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
              Тесты
            </Link>
            
            {user && (
              <Link to="/progress" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white flex items-center">
                <FaBrain className="mr-1 text-purple-500" />
                Мой прогресс
              </Link>
            )}
            
            {/* Меню для преподавателей и админов */}
            {isTeacherOrAdmin() && (
              <Link to="/teacher/quizzes" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white flex items-center">
                <FaChalkboardTeacher className="mr-1" />
                Мои тесты
              </Link>
            )}
            
            {/* ИИ функции только для преподавателей */}
            {isTeacher() && (
              <>
                <Link to="/teacher/upload" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white flex items-center bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  <FaRobot className="mr-1 text-blue-500" />
                  ИИ Генератор
                </Link>
              </>
            )}
            
            {/* Админ панель только для администраторов */}
            {isAdmin() && (
              <Link to="/admin" className="text-gray-600 hover:text-gray-800 dark:text-gray-200 dark:hover:text-white flex items-center">
                <FaCog className="mr-1" />
                Админ панель
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getRoleIcon()}
                  <div className="flex flex-col">
                    <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{user.name}</span>
                    <span className="text-gray-500 dark:text-gray-400 text-xs">{getRoleDisplayName()}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Выход
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link 
                  to="/login" 
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                >
                  Вход
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
                >
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