export interface Question {
  text: string;
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