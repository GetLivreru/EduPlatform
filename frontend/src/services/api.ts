import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Добавляем токен в заголовки, если он есть
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Role types
export type UserRole = 'student' | 'teacher' | 'admin';

export interface Role {
    value: UserRole;
    label: string;
    description: string;
}

// Test connection
export const testConnection = async (): Promise<boolean> => {
    try {
        await api.get('/');
        return true;
    } catch (error) {
        console.error('Error testing connection:', error);
        return false;
    }
};

// Get welcome message
export const getWelcomeMessage = async (): Promise<string> => {
    try {
        const response = await api.get('/');
        return response.data.message;
    } catch (error) {
        console.error('Error getting welcome message:', error);
        throw error;
    }
};

// Quiz related interfaces
export interface Question {
    id?: string;
    text?: string;          // Для обычных квизов
    question?: string;      // Для ИИ-сгенерированных квизов
    options: string[];
    correct_answer: number;
    explanation?: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Quiz {
    _id?: string;
    id?: string;
    title: string;
    description: string;
    category: string;
    level?: string;
    questions: Question[];
    time_limit?: number;
    passing_score?: number;
    created_at?: string;
    updated_at?: string;
    difficulty?: string;
}

// Document and AI Quiz Generation interfaces
export interface DocumentInfo {
    id: string;
    filename: string;
    content_type: string;
    size: number;
    uploaded_by: string;
    uploaded_at: string;
    text_length: number;
    generated_quizzes: number;
}

export interface UploadDocumentRequest {
    file: File;
    quiz_title: string;
    difficulty: string;
    questions_count: number;
}

export interface UploadDocumentResponse {
    message: string;
    document_id: string;
    quiz_id: string;
    quiz: Quiz;
}

export interface TeacherQuiz {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    created_by: string;
    source_document_id?: string;
    attempts_count: number;
    created_at: string;
}

export interface QuizStats {
    quiz_title: string;
    total_attempts: number;
    completed_attempts: number;
    average_score: number;
    completion_rate: number;
    attempts: any[];
}

export interface User {
    id: string;
    name: string;
    login: string;
    role: UserRole;
    is_admin: boolean; // для обратной совместимости
    quiz_points: number;
    created_at: string;
}

export interface CreateUserRequest {
    name: string;
    login: string;
    password: string;
    role: UserRole;
}

export interface UpdateUserRequest {
    name?: string;
    login?: string;
    password?: string;
    role?: UserRole;
}

export interface QuizAttempt {
    _id: string;
    quiz_id: string;
    start_time: string;
    status: string;
    answers: Array<{
        question_id: string;
        selected_option: number;
        submitted_at: string;
    }>;
    score?: number;
}

export interface QuizResult {
    id: string;
    _id: string;  // MongoDB ID
    quiz_id: string;
    quiz_title: string;
    quiz_category: string;
    user_id: string;
    score: number;
    time_taken: number;
    completed_at: string;
    incorrect_questions: Array<{
        question_id: string;
        question_text: string;
        user_answer: string;
        correct_answer: string;
    }>;
}

// Quiz related functions
export const getQuizzes = async (): Promise<Quiz[]> => {
    try {
        const response = await api.get('/api/quizzes');
        return response.data;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
};

export const getQuiz = async (id: string): Promise<Quiz> => {
    try {
        console.log(`Fetching quiz with ID: ${id}`);
        if (!id || id === 'undefined') {
            console.error('Invalid quiz ID provided');
            throw new Error('Invalid quiz ID');
        }
        
        const response = await api.get(`/api/quizzes/${id}`);
        
        if (!response.data) {
            console.error('No quiz data returned from API');
            throw new Error('Quiz not found');
        }
        
        // Убедиться, что у квиза есть ID
        const quiz = response.data;
        if (!quiz.id && !quiz._id) {
            console.error('Quiz data does not have an ID:', quiz);
            throw new Error('Quiz data is invalid');
        }
        
        // Если нет _id, но есть id, копируем id в _id
        if (!quiz._id && quiz.id) {
            quiz._id = quiz.id;
        }
        
        // Если нет id, но есть _id, копируем _id в id
        if (!quiz.id && quiz._id) {
            quiz.id = quiz._id;
        }
        
        return quiz;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
};

// Quiz attempt functions
export const startQuiz = async (quizId: string) => {
    try {
        console.log(`Starting quiz with ID: ${quizId}`);
        
        // Проверка ID
        if (!quizId || quizId === 'undefined') {
            console.error('Invalid quiz ID provided to startQuiz:', quizId);
            throw new Error('Invalid quiz ID');
        }
        
        const response = await api.post(`/api/quiz-attempts`, { quiz_id: quizId });
        
        if (!response.data || !response.data._id) {
            console.error('Quiz attempt creation failed, invalid response:', response.data);
            throw new Error('Failed to create quiz attempt');
        }
        
        console.log(`Successfully created quiz attempt with ID: ${response.data._id}`);
        return response.data;
    } catch (error) {
        console.error('Error starting quiz:', error);
        throw error;
    }
};

export const submitAnswer = async (attemptId: string, questionIndex: number, answer: number) => {
    try {
        console.log(`Submitting answer for attempt ${attemptId}, question ${questionIndex}, answer ${answer}`);
        const response = await api.post(`/api/quiz-attempts/${attemptId}/answer`, {
            question_index: questionIndex,
            answer: answer
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting answer:', error);
        throw error;
    }
};

export const finishQuiz = async (attemptId: string) => {
    try {
        console.log(`Finishing quiz attempt ${attemptId}`);
        const response = await api.post(`/api/quiz-attempts/${attemptId}/finish`);
        return response.data;
    } catch (error) {
        console.error('Error finishing quiz:', error);
        throw error;
    }
};

export const getAttempt = async (attemptId: string): Promise<QuizAttempt> => {
    try {
        console.log(`Getting attempt ${attemptId}`);
        const response = await api.get(`/api/quiz-attempts/${attemptId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting attempt:', error);
        throw error;
    }
};

// Admin functions
export const getAdminQuizzes = async (): Promise<Quiz[]> => {
    try {
        const response = await api.get('/admin/quizzes');
        return response.data;
    } catch (error) {
        console.error('Error fetching quizzes as admin:', error);
        throw error;
    }
};

export const getAdminQuiz = async (id: string): Promise<Quiz> => {
    try {
        if (!id || id === 'undefined') {
            throw new Error('Invalid quiz ID');
        }
        const response = await api.get(`/admin/quizzes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz as admin:', error);
        throw error;
    }
};

export const createQuiz = async (quiz: Omit<Quiz, 'id' | '_id'>): Promise<Quiz> => {
    try {
        const response = await api.post('/admin/quizzes', quiz);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

export const updateQuiz = async (quizId: string, quiz: Partial<Omit<Quiz, 'id' | '_id'>>): Promise<Quiz> => {
    try {
        const response = await api.put(`/admin/quizzes/${quizId}`, quiz);
        return response.data;
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw error;
    }
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
    try {
        await api.delete(`/admin/quizzes/${quizId}`);
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw error;
    }
};

// User functions
export const getUsers = async (): Promise<User[]> => {
    try {
        const response = await api.get('/admin/users');
        return response.data;
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
};

export const getUser = async (userId: string): Promise<User> => {
    try {
        const response = await api.get(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

export const createUser = async (user: CreateUserRequest): Promise<User> => {
    try {
        const response = await api.post('/admin/users', user);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId: string, user: UpdateUserRequest): Promise<User> => {
    try {
        const response = await api.put(`/admin/users/${userId}`, user);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
};

export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await api.delete(`/admin/users/${userId}`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

// Authentication functions
export const login = async (login: string, password: string): Promise<{ token: string; user: User }> => {
    try {
        const response = await api.post('/api/login', { login, password });
        const { access_token, user } = response.data;
        localStorage.setItem('token', access_token);
        return { token: access_token, user };
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const register = async (name: string, login: string, password: string, role: UserRole = 'student'): Promise<User> => {
    try {
        const response = await api.post('/api/register', { name, login, password, role });
        return response.data;
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
};

// Функция для проверки прав администратора
export const checkIsAdmin = async (): Promise<boolean> => {
    try {
        const response = await api.get('/api/check-admin');
        return response.data.is_admin;
    } catch (error) {
        console.error('Error checking admin rights:', error);
        return false;
    }
};

// Quiz results functions
export const getUserQuizResults = async (): Promise<QuizResult[]> => {
    try {
        const response = await api.get('/api/quiz-attempts/results/user');
        return response.data;
    } catch (error) {
        console.error('Error fetching user quiz results:', error);
        throw error;
    }
};

export const getQuizResult = async (quizId: string): Promise<QuizResult> => {
    try {
        const response = await api.get(`/api/quiz-attempts/results/${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz result:', error);
        throw error;
    }
};

export const getLearningRecommendations = async (
  subject: string,
  level: string,
  quizResults: any,
  incorrectQuestions: any[]
): Promise<any> => {
  const formData = new FormData();
  formData.append('subject', subject);
  formData.append('level', level);
  formData.append('quiz_results', JSON.stringify(quizResults));
  formData.append('incorrect_questions', JSON.stringify(incorrectQuestions));

  const response = await fetch(`${API_BASE_URL}/api/quiz-attempts/learning-recommendations`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Не удалось получить рекомендации по обучению');
  }

  return response.json();
};

export async function getSavedLearningRecommendations(quizId: string): Promise<any> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/api/quiz-attempts/recommendations/${quizId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch learning recommendations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching learning recommendations:', error);
    throw error;
  }
}

// Role management functions
export const getRoles = async (): Promise<{ roles: Role[] }> => {
    try {
        const response = await api.get('/admin/roles');
        return response.data;
    } catch (error) {
        console.error('Error fetching roles:', error);
        throw error;
    }
};

export const getUsersByRole = async (role: UserRole): Promise<{ role: UserRole; count: number; users: User[] }> => {
    try {
        const response = await api.get(`/admin/users/by-role/${role}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching users by role:', error);
        throw error;
    }
};

export const getUserProfile = async (): Promise<User> => {
    try {
        const response = await api.get('/api/profile');
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

// Teachers functions - Document and AI Quiz Generation
export const uploadDocumentAndGenerateQuiz = async (
    file: File,
    quiz_title: string,
    difficulty: string,
    questions_count: number
): Promise<UploadDocumentResponse> => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('quiz_title', quiz_title);
        formData.append('difficulty', difficulty);
        formData.append('questions_count', questions_count.toString());

        const response = await api.post('/teachers/upload-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        
        return response.data;
    } catch (error) {
        console.error('Error uploading document:', error);
        throw error;
    }
};

export const getMyDocuments = async (): Promise<{ documents: DocumentInfo[] }> => {
    try {
        const response = await api.get('/teachers/my-documents');
        return response.data;
    } catch (error) {
        console.error('Error fetching my documents:', error);
        throw error;
    }
};

export const getMyGeneratedQuizzes = async (): Promise<{ quizzes: TeacherQuiz[] }> => {
    try {
        const response = await api.get('/teachers/my-generated-quizzes');
        return response.data;
    } catch (error) {
        console.error('Error fetching my generated quizzes:', error);
        throw error;
    }
};

export const deleteDocument = async (documentId: string): Promise<{ message: string }> => {
    try {
        const response = await api.delete(`/teachers/documents/${documentId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
};

export const getQuizStats = async (quizId: string): Promise<QuizStats> => {
    try {
        const response = await api.get(`/teachers/quiz-stats/${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz stats:', error);
        throw error;
    }
}; 