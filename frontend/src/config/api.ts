// Конфигурация API для разных окружений
export const getApiBaseUrl = (): string => {
    // Проверяем если мы в продакшене (Vercel)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return window.location.origin;
    }
    
    // В разработке используем локальный сервер
    return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl(); 