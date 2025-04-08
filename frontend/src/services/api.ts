import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
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
    _id: string;
    title: string;
    subject: string;
    difficulty: string;
    questions: QuizQuestion[];
    timeLimit: number;
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
        const response = await api.get('/api/quizzes');
        return response.data;
    } catch (error) {
        console.error('Error getting quizzes:', error);
        throw error;
    }
};

export const getQuiz = async (quizId: string): Promise<Quiz> => {
    try {
        const response = await api.get(`/api/quizzes/${quizId}`);
        return response.data;
    } catch (error) {
        console.error('Error getting quiz:', error);
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

// Admin functions
interface CreateQuizData {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    time_limit: number;
    questions: Array<{
        text: string;
        options: string[];
        correct_answer: number;
    }>;
}

export const createQuiz = async (data: CreateQuizData): Promise<Quiz> => {
    try {
        const response = await api.post('/api/admin/quizzes', data);
        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
}; 