import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaCog } from 'react-icons/fa';
import { logout as apiLogout } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Learning Path
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-800">
              Квизы
            </Link>
            {user && (
              <Link to="/progress" className="text-gray-600 hover:text-gray-800">
                Прогресс
              </Link>
            )}
            {user?.is_admin && (
              <Link to="/admin/quizzes" className="text-gray-600 hover:text-gray-800 flex items-center">
                <FaCog className="mr-1" />
                Админ панель
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaUser className="text-gray-600" />
                  <span className="text-gray-600">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Выход
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-800">
                  Вход
                </Link>
                <Link to="/register" className="text-gray-600 hover:text-gray-800">
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