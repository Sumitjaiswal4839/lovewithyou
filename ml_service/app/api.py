from fastapi import APIRouter, Depends, File, Request, UploadFile
from fastapi.responses import JSONResponse

from app.config import Settings, get_settings
from app.dependencies import get_pipeline, require_permission
from app.exceptions import APIException
from app.rate_limit import InMemoryRateLimiter
from app.schemas import (
    AgeRange,
    AgeResult,
    ErrorCode,
    HealthResponse,
    ModelInfoResponse,
    ModelMetadata,
    QualityMetadata,
    SuccessResponse,
    Uncertainty,
    UncertainResponse,
)
from app.request_context import request_id
from app.dependencies import RequestServices


router = APIRouter(prefix="/api/v1", tags=["Age Estimation"])
limiter = InMemoryRateLimiter(limit=20, window_seconds=60)


def _quality_payload(q):
    return QualityMetadata(
        overall=q.level,
        face_count=1,
        face_fraction=q.face_fraction,
        sharpness=q.sharpness,
        brightness=q.brightness,
        detector_confidence=q.detector_confidence,
        yaw_degrees=q.yaw_degrees,
        pitch_degrees=q.pitch_degrees,
        roll_degrees=q.roll_degrees,
    )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health",
)
def health(settings: Settings = Depends(get_settings)):
    detector = RequestServices._detector
    model = RequestServices._model
    calibration = RequestServices._calibration

    ready = bool(
        detector
        and detector.ready
        and model
        and model.ready
        and calibration
        and calibration.loaded
    )

    return HealthResponse(
        status="ok" if ready else "degraded",
        model_loaded=bool(model and model.ready),
        calibration_loaded=bool(calibration and calibration.loaded),
        service=settings.app_name,
        version=settings.app_version,
    )


@router.get(
    "/model/info",
    response_model=ModelInfoResponse,
    summary="Model and calibration metadata",
)
def model_info(settings: Settings = Depends(get_settings)):
    calibration = RequestServices._calibration
    model = RequestServices._model

    return ModelInfoResponse(
        model_name=settings.age_model_name,
        model_version=settings.app_version,
        detector_backend=settings.detector_backend,
        calibration_version=calibration.version if calibration else "unavailable",
        calibration_source=settings.calibration_path,
        status="ready" if model and model.ready and calibration and calibration.loaded else "degraded",
    )


@router.post(
    "/age-estimation",
    response_model=SuccessResponse | UncertainResponse,
    summary="Estimate approximate chronological age",
    description=(
        "Accepts one image containing exactly one face. The backend validates "
        "image quality with RetinaFace, runs age inference, and applies an "
        "offline-fitted calibration mapping. No fixed +3 correction is used."
    ),
    responses={
        200: {
            "description": "Successful or uncertain age estimate",
            "content": {
                "application/json": {
                    "examples": {
                        "success": {
                            "summary": "Calibrated estimate",
                            "value": {
                                "status": "success",
                                "result": {
                                    "estimated_age": 35,
                                    "estimated_range": {"min": 32, "max": 38},
                                    "uncertainty": "moderate",
                                },
                                "quality": {
                                    "overall": "good",
                                    "face_count": 1,
                                    "face_fraction": 0.23,
                                    "sharpness": 184.2,
                                    "brightness": 121.4,
                                    "detector_confidence": 0.99,
                                    "yaw_degrees": 3.2,
                                    "pitch_degrees": -2.1,
                                    "roll_degrees": 1.1,
                                },
                                "model": {
                                    "name": "Age",
                                    "version": "2.0.0",
                                    "detector": "retinaface",
                                    "calibration_version": "calibration-1",
                                },
                                "processing_ms": 412,
                                "request_id": "req_example",
                            },
                        }
                    }
                }
            },
        },
        401: {"description": "Authentication required"},
        403: {"description": "Forbidden"},
        413: {"description": "Image too large"},
        415: {"description": "Unsupported image type"},
        422: {"description": "Image/face quality validation failed"},
        429: {"description": "Rate limited"},
        503: {"description": "Model or calibration unavailable"},
    },
)
async def age_estimation(
    request: Request,
    image: UploadFile = File(
        ...,
        description="JPEG, PNG, or WEBP image with exactly one visible face.",
    ),
    _user=Depends(require_permission),
    pipeline=Depends(get_pipeline),
    settings: Settings = Depends(get_settings),
):
    rid = request_id(request)

    if image.content_type not in settings.content_type_set:
        raise APIException(
            ErrorCode.UNSUPPORTED_IMAGE_TYPE.value,
            "Only JPEG, PNG, and WEBP images are accepted.",
            415,
            {"allowed_types": sorted(settings.content_type_set)},
        )

    data = await image.read()

    max_bytes = settings.max_image_size_mb * 1024 * 1024
    if len(data) > max_bytes:
        raise APIException(
            ErrorCode.IMAGE_TOO_LARGE.value,
            "Image exceeds the maximum allowed size.",
            413,
            {"max_size_mb": settings.max_image_size_mb},
        )

    # The in-memory limiter is only a safe local fallback.
    # Replace with Redis before multi-worker deployment.
    limiter.check(f"age:{_user.user_id}")

    result = pipeline.run(data)

    quality = _quality_payload(result.quality)
    calibration = RequestServices._calibration

    model = ModelMetadata(
        name=settings.age_model_name,
        version=settings.app_version,
        detector=settings.detector_backend,
        calibration_version=calibration.version if calibration else "unavailable",
    )

    age_result = AgeResult(
        estimated_age=result.age,
        estimated_range=AgeRange(min=result.lower, max=result.upper),
        uncertainty=Uncertainty(result.uncertainty),
    )

    if result.uncertainty == "high":
        return UncertainResponse(
            status="uncertain",
            result=age_result,
            quality=quality,
            model=model,
            message=(
                "The image was usable, but the calibrated model could not "
                "produce a sufficiently reliable estimate. Please retake "
                "the image with clear lighting and a frontal pose."
            ),
            processing_ms=result.processing_ms,
            request_id=rid,
        )

    return SuccessResponse(
        status="success",
        result=age_result,
        quality=quality,
        model=model,
        processing_ms=result.processing_ms,
        request_id=rid,
    )
