import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import router
from app.config import get_settings
from app.dependencies import RequestServices
from app.exceptions import APIException
from app.middleware import RequestBodyLimitMiddleware, RequestIDMiddleware
from app.request_context import request_id


settings = get_settings()

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s %(message)s",
)

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Production-oriented age estimation API using RetinaFace single-face "
        "validation and offline calibration. The API does not use a fixed "
        "age correction such as +3."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(RequestIDMiddleware)
app.add_middleware(RequestBodyLimitMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "Idempotency-Key",
    ],
)


@app.on_event("startup")
def startup():
    RequestServices.initialize(settings)


@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    rid = request_id(request)
    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "status": "quality_failed" if exc.quality_failure else "error",
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "request_id": rid,
        },
    )

    if exc.status_code == 429:
        retry = exc.details.get("retry_after_seconds")
        if retry is not None:
            response.headers["Retry-After"] = str(retry)

    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": {
                "code": "REQUEST_VALIDATION_FAILED",
                "message": "Request validation failed.",
                "details": {"errors": exc.errors()},
            },
            "request_id": request_id(request),
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request,
    exc: Exception,
):
    logging.getLogger(__name__).exception(
        "Unhandled exception request_id=%s",
        request_id(request),
    )

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred.",
                "details": {},
            },
            "request_id": request_id(request),
        },
    )


app.include_router(router)
