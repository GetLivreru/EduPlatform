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
    
    Please provide your recommendations in valid JSON format with the following structure:
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
    
    IMPORTANT: The response must be a valid JSON object.
    """
    
    try:
        print(f"Sending request to OpenAI for subject: {subject}, level: {level}")
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert educational content generator. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        content = response.choices[0].message.content
        print(f"Response received from OpenAI. Attempting to parse JSON")
        try:
            # Попытка парсинга JSON
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
            # Создаем базовый формат рекомендаций, если не удалось распарсить ответ
            return {
                "subject": subject,
                "level": level,
                "weak_areas": ["Parsing error - check raw response"],
                "learning_resources": [{"title": "Default resource", "url": "https://www.coursera.org/"}],
                "practice_exercises": ["Default exercise"],
                "study_schedule": [{"day": "Day 1", "tasks": ["Default task"]}],
                "expected_outcomes": ["Default outcome"],
                "raw_response": content  # Добавляем необработанный ответ для отладки
            }
    except Exception as e:
        print(f"Error generating learning recommendations: {str(e)}")
        return None

__all__ = ['generate_learning_recommendations'] 