from enum import Enum
from typing import Any, Literal
from pydantic import BaseModel, Field


class Uncertainty(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class QualityLevel(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    ACCEPTABLE = "acceptable"


class ErrorCode(str, Enum):
    IMAGE_REQUIRED = "IMAGE_REQUIRED"
    UNSUPPORTED_IMAGE_TYPE = "UNSUPPORTED_IMAGE_TYPE"
    IMAGE_TOO_LARGE = "IMAGE_TOO_LARGE"
    INVALID_IMAGE = "INVALID_IMAGE"
    IMAGE_TOO_SMALL = "IMAGE_TOO_SMALL"

    NO_FACE = "NO_FACE"
    MULTIPLE_FACES = "MULTIPLE_FACES"
    FACE_TOO_SMALL = "FACE_TOO_SMALL"
    FACE_TOO_LARGE = "FACE_TOO_LARGE"
    FACE_OUT_OF_FRAME = "FACE_OUT_OF_FRAME"
    FACE_NOT_CENTERED = "FACE_NOT_CENTERED"
    LOW_LIGHT = "LOW_LIGHT"
    OVEREXPOSED = "OVEREXPOSED"
    IMAGE_BLURRY = "IMAGE_BLURRY"
    EXCESSIVE_POSE = "EXCESSIVE_POSE"
    FACE_OCCLUDED = "FACE_OCCLUDED"
    LOW_DETECTOR_CONFIDENCE = "LOW_DETECTOR_CONFIDENCE"
    QUALITY_TOO_LOW = "QUALITY_TOO_LOW"

    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    FORBIDDEN = "FORBIDDEN"
    RATE_LIMITED = "RATE_LIMITED"

    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"
    CALIBRATION_UNAVAILABLE = "CALIBRATION_UNAVAILABLE"
    INFERENCE_FAILED = "INFERENCE_FAILED"
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


class APIError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    status: Literal["error", "quality_failed"]
    error: APIError
    request_id: str


class AgeRange(BaseModel):
    min: int = Field(ge=0, le=120)
    max: int = Field(ge=0, le=120)


class AgeResult(BaseModel):
    estimated_age: int | None = Field(default=None, ge=0, le=120)
    estimated_range: AgeRange | None = None
    uncertainty: Uncertainty


class ModelMetadata(BaseModel):
    name: str
    version: str
    detector: str
    calibration_version: str


class QualityMetadata(BaseModel):
    overall: QualityLevel
    face_count: int = Field(ge=0)
    face_fraction: float = Field(ge=0, le=1)
    sharpness: float = Field(ge=0)
    brightness: float = Field(ge=0, le=255)
    detector_confidence: float = Field(ge=0, le=1)
    yaw_degrees: float | None = None
    pitch_degrees: float | None = None
    roll_degrees: float | None = None


class SuccessResponse(BaseModel):
    status: Literal["success"]
    result: AgeResult
    quality: QualityMetadata
    model: ModelMetadata
    processing_ms: int
    request_id: str


class UncertainResponse(BaseModel):
    status: Literal["uncertain"]
    result: AgeResult
    quality: QualityMetadata
    model: ModelMetadata
    message: str
    processing_ms: int
    request_id: str


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    model_loaded: bool
    calibration_loaded: bool
    service: str
    version: str


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    detector_backend: str
    calibration_version: str
    calibration_source: str
    status: Literal["ready", "degraded"]
