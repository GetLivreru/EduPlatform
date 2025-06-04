export interface Question {
  text?: string;          // Для обычных квизов
  question?: string;      // Для ИИ-сгенерированных квизов
  options: string[];
  correct_answer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  difficulty: string;
  time_limit: number;
} 