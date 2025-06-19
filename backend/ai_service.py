import os
from openai import OpenAI
from typing import List, Dict
import json
import logging

# Настройка логгирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализация клиента OpenAI
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

async def generate_learning_recommendations(subject: str, level: str, quiz_results: Dict, incorrect_questions: List[Dict]) -> Dict:
    """
    Генерирует персонализированные рекомендации по обучению на основе результатов квиза.
    
    Args:
        subject: Предмет обучения (категория)
        level: Уровень сложности
        quiz_results: Результаты квиза (общая оценка)
        incorrect_questions: Список неправильно отвеченных вопросов
        
    Returns:
        Dict: Структурированные рекомендации по обучению
    """
    # Проверка наличия API ключа
    if not client:
        logger.error("OpenAI API key not found")
        return generate_fallback_recommendations(subject, level)
    
    # Проверка входных данных
    score = quiz_results.get('score', 0)
    
    prompt = f"""
    Generate personalized learning recommendations for {subject} at {level} level.
    
    Quiz Results:
    - Overall Score: {score}%
    - Incorrect Questions: {json.dumps(incorrect_questions, ensure_ascii=False)}
    
    Please provide recommendations in valid JSON format with the following structure:
    {{
        "weak_areas": ["area1", "area2"],
        "learning_resources": [
            {{"title": "Resource 1", "url": "http://coursera.com"}},
            {{"title": "Resource 2", "url": "http://udemy.com"}}
        ],
        "practice_exercises": ["exercise1", "exercise2"],
        "study_schedule": [
            {{"day": "Day 1", "tasks": ["task1", "task2"]}},
            {{"day": "Day 2", "tasks": ["task3", "task4"]}}
        ],
        "expected_outcomes": ["outcome1", "outcome2"]
    }}
    
    THE RESPONSE MUST BE PURE JSON WITHOUT ANY MARKDOWN FORMATTING OR CODE BLOCKS.
    DO NOT INCLUDE ```json, ```, OR ANY OTHER MARKDOWN SYNTAX.
    """
    
    try:
        logger.info(f"Sending request to OpenAI for subject: {subject}, level: {level}")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are expert educational content generator. Always respond with pure JSON, never using markdown formatting or code blocks."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"}  # Важно! Заставляет API возвращать чистый JSON
        )
        
        content = response.choices[0].message.content
        logger.info(f"Response received from OpenAI: {content[:50]}...")
        
        # Удаляем возможные маркеры Markdown, если они все-таки появляются
        if content.startswith("```"):
            # Находим конец блока кода
            content = content.split("```", 2)[1]
            if content.startswith("json"):
                content = content[4:].strip()  # Удаляем 'json' и начальные пробелы
            if content.endswith("```"):
                content = content[:-3].strip()  # Удаляем закрывающие маркеры и конечные пробелы
        
        try:
            parsed_content = json.loads(content)
            return {
                "subject": subject,
                "level": level,
                "weak_areas": parsed_content.get("weak_areas", []),
                "learning_resources": parsed_content.get("learning_resources", []),
                "practice_exercises": parsed_content.get("practice_exercises", []),
                "study_schedule": parsed_content.get("study_schedule", []),
                "expected_outcomes": parsed_content.get("expected_outcomes", [])
            }
        except json.JSONDecodeError as json_err:
            logger.error(f"Failed to parse OpenAI response as JSON: {str(json_err)}")
            logger.debug(f"Raw response: {content}")
            
            # Пытаемся извлечь JSON даже с ошибками форматирования
            # Чистим ответ от маркдаун форматирования если он всё ещё есть
            import re
            json_match = re.search(r'({.*})', content, re.DOTALL)
            if json_match:
                try:
                    cleaned_json = json_match.group(1)
                    parsed_content = json.loads(cleaned_json)
                    return {
                        "subject": subject,
                        "level": level,
                        "weak_areas": parsed_content.get("weak_areas", []),
                        "learning_resources": parsed_content.get("learning_resources", []),
                        "practice_exercises": parsed_content.get("practice_exercises", []),
                        "study_schedule": parsed_content.get("study_schedule", []),
                        "expected_outcomes": parsed_content.get("expected_outcomes", [])
                    }
                except Exception as e:
                    logger.error(f"Failed to extract JSON with regex: {str(e)}")
                    
            # Если всё равно не получилось, возвращаем базовый шаблон
            return generate_fallback_recommendations(subject, level)
    except Exception as e:
        logger.error(f"Error generating learning recommendations: {str(e)}")
        return generate_fallback_recommendations(subject, level)

def generate_fallback_recommendations(subject: str, level: str) -> Dict:
    """
    Генерирует базовые рекомендации, когда API недоступен или произошла ошибка.
    
    Args:
        subject: Предмет обучения
        level: Уровень сложности
        
    Returns:
        Dict: Базовые рекомендации по обучению
    """
    return {
        "subject": subject,
        "level": level,
        "weak_areas": ["Общие темы в " + subject],
        "learning_resources": [
            {"title": f"Основы {subject}", "url": "https://www.coursera.org/"},
            {"title": f"Учебник по {subject}", "url": "https://www.edx.org/"}
        ],
        "practice_exercises": [
            f"Изучить базовые концепции {subject}",
            f"Выполнить упражнения начального уровня",
            f"Ознакомиться с ключевыми темами"
        ],
        "study_schedule": [
            {"day": "День 1", "tasks": [f"Ознакомление с предметом {subject}"]},
            {"day": "День 2", "tasks": [f"Изучение основных понятий {subject}"]},
            {"day": "День 3", "tasks": ["Решение простых задач"]},
            {"day": "День 4", "tasks": ["Закрепление материала"]},
            {"day": "День 5", "tasks": ["Практические упражнения", "Повторение изученного"]}
        ],
        "expected_outcomes": [
            f"Базовое понимание {subject}",
            "Способность решать простые задачи",
            "Подготовка к более сложным темам"
        ]
    }

__all__ = ['generate_learning_recommendations'] 