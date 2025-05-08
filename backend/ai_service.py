import os
from openai import OpenAI
from typing import List, Dict
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_learning_recommendations(subject: str, level: str, quiz_results: Dict, incorrect_questions: List[Dict]) -> Dict:
    prompt = f"""
    Generate personalized learning recommendations for {subject} at {level} level.
    
    Quiz Results:
    - Overall Score: {quiz_results.get('score', 0)}%
    - Incorrect Questions: {json.dumps(incorrect_questions)}
    
    Please provide recommendations in valid JSON format with the following structure:
    {{
        "weak_areas": ["area1", "area2"],
        "learning_resources": [
            {{"title": "Resource 1", "url": "http://example.com"}},
            {{"title": "Resource 2", "url": "http://example2.com"}}
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
        print(f"Sending request to OpenAI for subject: {subject}, level: {level}")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert educational content generator. Always respond with pure JSON, never using markdown formatting or code blocks."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
            response_format={"type": "json_object"}  # Важно! Заставляет API возвращать чистый JSON
        )
        
        content = response.choices[0].message.content
        print(f"Response received from OpenAI: {content[:50]}...")
        
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
            print(f"Failed to parse OpenAI response as JSON: {str(json_err)}")
            print(f"Raw response: {content}")
            
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
                except:
                    pass
                    
            # Если всё равно не получилось, возвращаем базовый шаблон
            return {
                "subject": subject,
                "level": level,
                "weak_areas": ["Parsing error - Unable to extract JSON from response"],
                "learning_resources": [{"title": "Default resource", "url": "https://www.coursera.org/"}],
                "practice_exercises": ["Default exercise"],
                "study_schedule": [{"day": "Day 1", "tasks": ["Default task"]}],
                "expected_outcomes": ["Default outcome"]
            }
    except Exception as e:
        print(f"Error generating learning recommendations: {str(e)}")
        return None

__all__ = ['generate_learning_recommendations'] 