import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTimes, FaPlus, FaSave, FaArrowLeft } from 'react-icons/fa';
import { createQuiz, updateQuiz, getAdminQuiz } from '../../services/api';

interface Question {
    text?: string;          // Для обычных квизов
    question?: string;      // Для ИИ-сгенерированных квизов
    options: string[];
    correct_answer: number;
}

const QuizManager: React.FC = () => {
    const { quizId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        difficulty: 'Easy',
        time_limit: 30,
        questions: [] as Question[],
    });

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId) return; // This is a new quiz if there's no ID

            try {
                setLoading(true);
                const quizData = await getAdminQuiz(quizId);
                
                setFormData({
                    title: quizData.title ?? '',
                    description: quizData.description ?? '',
                    category: quizData.category ?? '',
                    difficulty: quizData.difficulty ?? 'Easy',
                    time_limit: quizData.time_limit ?? 30,
                    questions: (quizData.questions ?? []).map((q: any) => ({
                        text: q.text,
                        options: q.options,
                        correct_answer: q.correct_answer
                    })),
                });
            } catch (err) {
                setError('Ошибка при загрузке теста');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'time_limit' ? parseInt(value) : value,
        });
    };

    const handleQuestionChange = (index: number, field: string, value: string | string[] | number) => {
        const updatedQuestions = [...formData.questions];
        updatedQuestions[index] = {
            ...updatedQuestions[index],
            [field]: value,
        };
        
        setFormData({
            ...formData,
            questions: updatedQuestions,
        });
    };

    const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
        const updatedQuestions = [...formData.questions];
        const options = [...updatedQuestions[questionIndex].options];
        options[optionIndex] = value;
        
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            options,
        };
        
        setFormData({
            ...formData,
            questions: updatedQuestions,
        });
    };

    const addQuestion = () => {
        setFormData({
            ...formData,
            questions: [
                ...formData.questions,
                {
                    text: '',
                    options: ['', '', '', ''],
                    correct_answer: 0,
                },
            ],
        });
    };

    const removeQuestion = (index: number) => {
        const updatedQuestions = formData.questions.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            questions: updatedQuestions,
        });
    };

    const handleCorrectAnswerChange = (questionIndex: number, value: string) => {
        const correctAnswerIndex = parseInt(value);
        
        const updatedQuestions = [...formData.questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            correct_answer: correctAnswerIndex,
        };
        
        setFormData({
            ...formData,
            questions: updatedQuestions,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Валидация формы
        if (!formData.title.trim()) {
            setError('Введите название теста');
            return;
        }
        
        if (!formData.category.trim()) {
            setError('Введите категорию теста');
            return;
        }
        
        if (formData.questions.length === 0) {
            setError('Добавьте хотя бы один вопрос');
            return;
        }
        
        const invalidQuestions = formData.questions.some(
            (q) => !q.text?.trim() || q.options.some((o) => !o.trim())
        );
        
        if (invalidQuestions) {
            setError('Заполните все поля вопросов и вариантов ответов');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            if (quizId) {
                // Обновление существующего теста
                await updateQuiz(quizId, formData);
            } else {
                // Создание нового теста
                await createQuiz(formData);
            }
            
            navigate('/admin');
        } catch (err) {
            setError('Ошибка при сохранении теста');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && quizId) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="mr-4 flex items-center text-blue-600 hover:text-blue-800"
                >
                    <FaArrowLeft className="mr-1" /> Назад
                </button>
                <h1 className="text-3xl font-bold text-gray-900">
                    {quizId ? 'Редактирование теста' : 'Новый тест'}
                </h1>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Название теста</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Введите название теста"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Категория</label>
                        <input
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Например: Математика, Программирование"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Сложность</label>
                        <select
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Easy">Легкий</option>
                            <option value="Medium">Средний</option>
                            <option value="Hard">Сложный</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Ограничение времени (минуты)</label>
                        <input
                            type="number"
                            name="time_limit"
                            value={formData.time_limit}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-semibold mb-2">Описание</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Описание теста"
                        ></textarea>
                    </div>
                </div>
                
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Вопросы</h2>
                        <button
                            type="button"
                            onClick={addQuestion}
                            className="bg-green-500 text-white px-4 py-2 rounded flex items-center hover:bg-green-600"
                        >
                            <FaPlus className="mr-2" /> Добавить вопрос
                        </button>
                    </div>
                    
                    {formData.questions.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded">
                            <p className="text-gray-500">Нет вопросов. Нажмите "Добавить вопрос" для создания нового вопроса.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {formData.questions.map((question, questionIndex) => (
                                <div key={questionIndex} className="border border-gray-200 rounded p-4 bg-gray-50 relative">
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(questionIndex)}
                                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                    >
                                        <FaTimes />
                                    </button>
                                    
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-semibold mb-2">Вопрос #{questionIndex + 1}</label>
                                        <input
                                            type="text"
                                            value={question.text || question.question || ''}
                                            onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                                            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Текст вопроса"
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-semibold mb-2">Варианты ответов</label>
                                        <div className="space-y-2">
                                            {question.options.map((option, optionIndex) => (
                                                <div key={optionIndex} className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name={`correct_answer_${questionIndex}`}
                                                        checked={question.correct_answer === optionIndex}
                                                        onChange={() => handleCorrectAnswerChange(questionIndex, optionIndex.toString())}
                                                        className="mr-2"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={option}
                                                        onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder={`Вариант ответа ${optionIndex + 1}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Выберите правильный ответ, установив переключатель.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
                    >
                        Отмена
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-500 text-white px-4 py-2 rounded flex items-center hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? (
                            <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        ) : (
                            <FaSave className="mr-2" />
                        )}
                        Сохранить
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizManager; 