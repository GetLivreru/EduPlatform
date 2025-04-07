# Learning Path API

This is the backend service for the Learning Path application, which provides personalized learning paths and quizzes for students.

## Features

- Personalized learning paths generation using AI
- Quiz generation and management
- Progress tracking
- MongoDB database integration
- FastAPI backend

## Setup

1. Install Python 3.8 or higher
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up MongoDB:
   - Install MongoDB locally or use a cloud service
   - Update the MONGODB_URL in .env file

4. Configure environment variables:
   - Copy .env.example to .env
   - Update the values in .env with your configuration

5. Set up OpenAI API:
   - Get an API key from OpenAI
   - Add it to the .env file

## Running the Application

1. Start MongoDB if running locally
2. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
3. Access the API documentation at http://localhost:8000/docs

## API Endpoints

- GET / - Welcome message
- POST /quizzes/ - Create a new quiz
- GET /quizzes/{subject} - Get quizzes for a subject
- POST /learning-paths/ - Create a learning path
- GET /learning-paths/{subject}/{level} - Get learning path for subject and level
- POST /progress/ - Update user progress
- GET /progress/{user_id}/{subject} - Get user progress

## Development

The project structure:
- main.py - Main FastAPI application
- ai_service.py - AI integration for content generation
- .env - Environment configuration
- requirements.txt - Python dependencies 