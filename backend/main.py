from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import quizzes

app = FastAPI(title="Educational Quiz Platform")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Educational Quiz Platform API"}

@app.get("/api/test")
async def test_endpoint():
    return {"status": "success", "message": "Backend is working!"}

# Include routers
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["quizzes"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 