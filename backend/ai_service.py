import os
from openai import OpenAI
from typing import List, Dict
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def generate_learning_path(subject: str, level: str, previous_quiz_results: Dict = None) -> Dict:
    prompt = f"""
    Generate a personalized learning path for {subject} at {level} level.
    Previous quiz results: {json.dumps(previous_quiz_results) if previous_quiz_results else 'No previous results'}
    
    The learning path should include:
    1. Key concepts to learn
    2. Learning resources
    3. Practice exercises
    4. Duration for each section
    5. Expected outcomes
    
    Format the response as a structured learning path with daily activities.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educational content generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "subject": subject,
            "level": level,
            "content": response.choices[0].message.content,
            "duration_days": 7  # Default one week duration
        }
    except Exception as e:
        print(f"Error generating learning path: {str(e)}")
        return None

async def generate_quiz(subject: str, level: str, previous_results: Dict = None) -> Dict:
    prompt = f"""
    Generate a quiz for {subject} at {level} level.
    Previous results: {json.dumps(previous_results) if previous_results else 'No previous results'}
    
    The quiz should include:
    1. Multiple choice questions
    2. Difficulty appropriate for the level
    3. Clear correct answers
    4. Explanations for each answer
    
    Format the response as a structured quiz with questions and answers.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert quiz generator."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "subject": subject,
            "questions": json.loads(response.choices[0].message.content),
            "difficulty_level": level
        }
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return None 