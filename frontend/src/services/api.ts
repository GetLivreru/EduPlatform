import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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
export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Quiz {
    id: string;
    _id: string; // MongoDB ID
    title: string;
    description: string;
    category: string;
    questions: Array<{
        text: string;
        options: string[];
        correct_answer: number;
    }>;
    difficulty: string;
    time_limit: number;
}

export interface User {
    id: string;
    name: string;
    login: string;
    is_admin: boolean;
    created_at: string;
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

// Quiz related functions
export const getQuizzes = async (): Promise<Quiz[]> => {
    try {
        const response = await api.get('/admin/quizzes');
        return response.data;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
};

export const getQuiz = async (id: string): Promise<Quiz> => {
    try {
        const response = await api.get(`/api/quizzes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
};

// Quiz attempt functions
export const startQuiz = async (quizId: string) => {
    try {
        const response = await api.post(`/api/quiz-attempts`, { quiz_id: quizId });
        return response.data;
    } catch (error) {
        console.error('Error starting quiz:', error);
        throw error;
    }
};

export const submitAnswer = async (attemptId: string, questionIndex: number, answer: number) => {
    try {
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
        const response = await api.post(`/api/attempts/${attemptId}/finish`);
        return response.data;
    } catch (error) {
        console.error('Error finishing quiz:', error);
        throw error;
    }
};

export const getAttempt = async (attemptId: string): Promise<QuizAttempt> => {
    try {
        const response = await api.get(`/api/attempts/${attemptId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting attempt:', error);
        throw error;
    }
};

// Admin functions
export const createQuiz = async (quiz: Omit<Quiz, 'id'>): Promise<Quiz> => {
    try {
        const response = await api.post('/api/quizzes', quiz);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

export const updateQuiz = async (quizId: string, quiz: Partial<Quiz>): Promise<Quiz> => {
    try {
        const response = await api.put(`/api/quizzes/${quizId}`, quiz);
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

export const createUser = async (user: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    try {
        const response = await api.post('/admin/users', user);
        return response.data;
    } catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};

export const updateUser = async (userId: string, user: Partial<User>): Promise<User> => {
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

export const register = async (name: string, login: string, password: string): Promise<User> => {
    try {
        const response = await api.post('/api/register', { name, login, password });
        return response.data;
    } catch (error) {
        console.error('Error registering:', error);
        throw error;
    }
};

export const logout = (): void => {
    localStorage.removeItem('token');
}; 