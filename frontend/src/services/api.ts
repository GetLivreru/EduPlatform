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
    _id: string;
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

// Quiz attempt functions
export const startQuiz = async (quizId: string): Promise<QuizAttempt> => {
    try {
        const response = await api.post(`/api/attempts/start/${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error starting quiz:', error);
        throw error;
    }
};

export const submitAnswer = async (attemptId: string, answer: { question_id: string; selected_option: number }) => {
    try {
        const response = await api.post(`/api/attempts/${attemptId}/answer`, answer);
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