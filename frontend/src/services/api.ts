import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Test connection
export const testConnection = async () => {
    try {
        const response = await api.get('/api/test');
        return response.data;
    } catch (error) {
        console.error('Error testing connection:', error);
        throw error;
    }
};

// Get welcome message
export const getWelcomeMessage = async () => {
    try {
        const response = await api.get('/');
        return response.data;
    } catch (error) {
        console.error('Error fetching welcome message:', error);
        throw error;
    }
};

// Quiz related functions
export interface Quiz {
    id: number;
    title: string;
    subject: string;
    difficulty: string;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correct_answer: number;
}

export const getQuizzes = async (): Promise<Quiz[]> => {
    try {
        const response = await api.get('/api/quizzes');
        return response.data;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
};

export const getQuiz = async (quizId: number): Promise<Quiz> => {
    try {
        const response = await api.get(`/api/quizzes/${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
}; 