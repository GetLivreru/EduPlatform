import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadDocumentAndGenerateQuiz } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FaUpload, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaRobot, FaBrain } from 'react-icons/fa';

const DocumentUpload: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [quizTitle, setQuizTitle] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionsCount, setQuestionsCount] = useState(5);
  const [uploadResult, setUploadResult] = useState<any>(null);

  // Check if user is teacher
  if (!user || user.role !== 'teacher') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center text-red-600 dark:text-red-400">
          <FaExclamationTriangle className="mx-auto text-4xl mb-4" />
          <h2 className="text-xl font-bold mb-2">Доступ запрещен</h2>
          <p>Только преподаватели могут загружать документы и создавать квизы с помощью ИИ.</p>
        </div>
      </div>
    );
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Поддерживаются только файлы PDF, DOCX и TXT');
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB');
      return;
    }

    setFile(selectedFile);
    if (!quizTitle) {
      // Auto-generate quiz title from filename
      const nameWithoutExt = selectedFile.name.split('.').slice(0, -1).join('.');
      setQuizTitle(`Тест по "${nameWithoutExt}"`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !quizTitle.trim()) {
      alert('Пожалуйста, выберите файл и введите название теста');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Загрузка документа...');
    setUploadResult(null);

    try {
      // Simulate progress steps
      setTimeout(() => setUploadProgress('Анализ содержимого...'), 1000);
      setTimeout(() => setUploadProgress('Генерация вопросов с помощью ИИ...'), 2000);
      setTimeout(() => setUploadProgress('Создание теста...'), 3000);

      const result = await uploadDocumentAndGenerateQuiz(
        file,
        quizTitle,
        difficulty,
        questionsCount
      );

      setUploadResult(result);
      setUploadProgress('Готово!');
      
      // Reset form
      setFile(null);
      setQuizTitle('');
      setDifficulty('Medium');
      setQuestionsCount(5);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      alert(error.response?.data?.detail || 'Ошибка при загрузке документа');
      setUploadProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📋';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-6">
          <FaRobot className="text-3xl text-blue-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ИИ Генератор Тестов
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Загрузите документ и автоматически создайте тест с помощью искусственного интеллекта
            </p>
          </div>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center text-green-800 dark:text-green-200 mb-2">
              <FaCheckCircle className="mr-2" />
              <h3 className="font-semibold">Тест успешно создан!</h3>
            </div>
            <p className="text-green-700 dark:text-green-300 mb-3">
              {uploadResult.message}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/quiz/${uploadResult.quiz_id}`)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
              >
                Просмотреть тест
              </button>
              <button
                onClick={() => navigate('/teacher/quizzes')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
              >
                Мои тесты
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Документ
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-4xl">{getFileIcon(file.type)}</span>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div>
                  <FaUpload className="mx-auto text-gray-400 text-4xl mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Перетащите файл сюда или
                  </p>
                  <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors inline-block">
                    Выбрать файл
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileInputChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Поддерживаются: PDF, DOCX, TXT (до 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Название теста
              </label>
              <input
                type="text"
                value={quizTitle}
                onChange={(e) => setQuizTitle(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         dark:bg-gray-700 dark:text-white"
                placeholder="Введите название теста..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Сложность
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         dark:bg-gray-700 dark:text-white"
              >
                <option value="Easy">Легкий</option>
                <option value="Medium">Средний</option>
                <option value="Hard">Сложный</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Количество вопросов
              </label>
              <input
                type="number"
                min="3"
                max="20"
                value={questionsCount}
                onChange={(e) => setQuestionsCount(parseInt(e.target.value))}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* AI Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center text-blue-800 dark:text-blue-200 mb-2">
              <FaBrain className="mr-2" />
              <h3 className="font-semibold">Как работает ИИ генератор</h3>
            </div>
            <ul className="text-blue-700 dark:text-blue-300 text-sm space-y-1">
              <li>• ИИ анализирует содержимое вашего документа</li>
              <li>• Автоматически создает вопросы на основе ключевых концепций</li>
              <li>• Генерирует 4 варианта ответа для каждого вопроса</li>
              <li>• Подстраивает сложность под выбранный уровень</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || !quizTitle.trim() || isUploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 
                       rounded-lg font-medium flex items-center transition-colors"
            >
              {isUploading ? (
                <>
                  <FaSpinner className="mr-2 animate-spin" />
                  Обработка...
                </>
              ) : (
                <>
                  <FaRobot className="mr-2" />
                  Создать тест с ИИ
                </>
              )}
            </button>
          </div>
        </form>

        {/* Progress */}
        {isUploading && uploadProgress && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FaSpinner className="mr-2 animate-spin" />
              <span>{uploadProgress}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUpload; 