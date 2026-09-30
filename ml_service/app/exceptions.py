from typing import Any


class APIException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int,
        details: dict[str, Any] | None = None,
        quality_failure: bool = False,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        self.quality_failure = quality_failure
        super().__init__(message)


class QualityException(APIException):
    def __init__(self, code: str, message: str, details: dict[str, Any] | None = None):
        super().__init__(
            code=code,
            message=message,
            status_code=422,
            details=details,
            quality_failure=True,
        )
