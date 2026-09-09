export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || `${API_BASE_URL}/ws`;

export const ENDPOINTS = {
    QUIZZES: `${API_BASE_URL}/api/quizzes`,
    CATEGORIES: `${API_BASE_URL}/api/quiz-categories`,
    ROOMS: `${API_BASE_URL}/api/rooms`,
};