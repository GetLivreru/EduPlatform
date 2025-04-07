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

// Quiz related interfaces
export interface QuizQuestion {
    text: string;
    options: string[];
    correct_answer: number;
}

export interface Quiz {
    _id: string;
    title: string;
    description: string;
    category: string;
    questions: QuizQuestion[];
    difficulty: string;
    time_limit: number;
}

// Quiz related functions
export const getQuizzes = async (): Promise<Quiz[]> => {
    try {
        console.log('Fetching quizzes...');
        const response = await api.get('/api/quizzes');
        console.log('Quizzes response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
    }
};

export const getQuiz = async (quizId: string): Promise<Quiz> => {
    try {
        console.log('Fetching quiz:', quizId);
        const response = await api.get(`/api/quizzes/${quizId}`);
        console.log('Quiz response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
}; 