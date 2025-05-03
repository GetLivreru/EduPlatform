# Educational AI Platform 🎓

A modern web service for personalized student learning through interactive quizzes and AI-generated content.

## 📋 Overview

This platform provides an engaging learning experience by combining adaptive quizzes with AI-powered content generation. It helps students learn at their own pace while providing educators with valuable insights into student progress.

## 🏗️ Project Structure

```
.
├── backend/           # FastAPI backend
│   ├── api/          # API endpoints
│   ├── models/       # Database models
│   ├── services/     # Business logic
│   └── utils/        # Utility functions
├── frontend/         # React + TypeScript frontend
│   ├── src/          # Source code
│   ├── public/       # Static assets
│   └── components/   # React components
├── docs/            # Project documentation
└── README.md        # This file
```

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.9+
- **Database**: MongoDB
- **Authentication**: JWT
- **Testing**: Pytest

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Testing**: Jest + React Testing Library

## ✨ Features

- 📚 **Adaptive Learning**: Personalized quiz recommendations based on student performance
- 🤖 **AI-Generated Content**: Dynamic content creation for enhanced learning
- 📊 **Progress Tracking**: Detailed analytics and progress monitoring
- 🎮 **Gamification**: Points, badges, and leaderboards to increase engagement
- 🛣️ **Personalized Paths**: Custom learning journeys for each student
- 📱 **Responsive Design**: Works seamlessly on all devices

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB
- Git

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```
2. Create and activate virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 API Documentation

Once the backend server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 
