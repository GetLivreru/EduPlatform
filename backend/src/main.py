from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.api import api_router
from src.core.config import settings

app = FastAPI(
    title="Educational Quiz Platform",
    description="REST API для платформы образовательных тестов и квизов",
    version="1.0.0",
    docs_url=None,  # Отключаем стандартный /docs endpoint
    redoc_url=None  # Отключаем стандартный /redoc endpoint
)


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CORS_ORIGINS],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(api_router)

# Кастомные эндпоинты для документации
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(
        openapi_url="/openapi.json",
        title="Quiz Platform API Documentation",
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css",
        swagger_favicon_url="/favicon.ico"
    )

@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    from fastapi.openapi.docs import get_redoc_html
    return get_redoc_html(
        openapi_url="/openapi.json",
        title="Quiz Platform API Documentation - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"
    )

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    from fastapi.openapi.utils import get_openapi
    openapi_schema = get_openapi(
        title="Educational Quiz Platform API",
        version="1.0.0",
        description="REST API для платформы образовательных тестов и квизов.",
        routes=app.routes,
    )
    return openapi_schema

@app.get("/",
        summary="Проверка работоспособности API",
        description="Возвращает приветственное сообщение для проверки доступности API",
        tags=["статус"])
async def root():
    return {"message": "Welcome to Educational Quiz Platform API"} 