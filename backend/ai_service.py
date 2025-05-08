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
    
    Please provide:
    1. Weak areas that need improvement
    2. Specific learning resources for each weak area
    3. Practice exercises recommendations
    4. Study schedule for the next week
    5. Expected learning outcomes
    
    Format the response as a structured learning plan.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert educational content generator specializing in personalized learning paths."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )
        
        return {
            "subject": subject,
            "level": level,
            "weak_areas": json.loads(response.choices[0].message.content).get("weak_areas", []),
            "learning_resources": json.loads(response.choices[0].message.content).get("learning_resources", []),
            "practice_exercises": json.loads(response.choices[0].message.content).get("practice_exercises", []),
            "study_schedule": json.loads(response.choices[0].message.content).get("study_schedule", []),
            "expected_outcomes": json.loads(response.choices[0].message.content).get("expected_outcomes", [])
        }
    except Exception as e:
        print(f"Error generating learning recommendations: {str(e)}")
        return None

__all__ = ['generate_learning_recommendations'] 