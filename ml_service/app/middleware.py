from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import get_settings
from app.request_context import new_request_id


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        rid = request.headers.get("X-Request-ID") or new_request_id()
        request.state.request_id = rid
        response = await call_next(request)
        response.headers["X-Request-ID"] = rid
        return response


class RequestBodyLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        settings = get_settings()
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
            except ValueError:
                length = 0
            limit = settings.max_image_size_mb * 1024 * 1024 + 1024 * 1024
            if length > limit:
                return JSONResponse(
                    status_code=413,
                    content={
                        "status": "error",
                        "error": {
                            "code": "IMAGE_TOO_LARGE",
                            "message": "Request body exceeds the configured limit.",
                            "details": {"max_bytes": limit},
                        },
                        "request_id": request.state.request_id,
                    },
                )
        return await call_next(request)
