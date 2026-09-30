from dataclasses import dataclass
from fastapi import Depends, Request

from app.config import Settings, get_settings
from app.exceptions import APIException
from app.schemas import ErrorCode
from app.services.calibration import CalibrationService
from app.services.face_detector import RetinaFaceService
from app.services.image_quality import ImageQualityService
from app.services.age_model import AgeModelService
from app.services.pipeline import AgeEstimationPipeline


@dataclass(frozen=True)
class CurrentUser:
    user_id: str
    permissions: frozenset[str]


def get_calibration(settings: Settings = Depends(get_settings)) -> CalibrationService:
    return CalibrationService(settings.calibration_path)


def get_detector(settings: Settings = Depends(get_settings)) -> RetinaFaceService:
    # In production, prefer app.state singleton injection.
    return RequestServices.get_detector(settings)


def get_age_model(settings: Settings = Depends(get_settings)) -> AgeModelService:
    return RequestServices.get_model(settings)


def get_quality(settings: Settings = Depends(get_settings)) -> ImageQualityService:
    return ImageQualityService(settings)


class RequestServices:
    _detector = None
    _model = None
    _calibration = None

    @classmethod
    def initialize(cls, settings: Settings):
        cls._calibration = CalibrationService(settings.calibration_path)
        cls._detector = RetinaFaceService(settings)
        cls._model = AgeModelService(settings, cls._calibration)
        cls._detector.warmup()
        cls._model.warmup()

    @classmethod
    def get_detector(cls, settings):
        if cls._detector is None:
            cls.initialize(settings)
        return cls._detector

    @classmethod
    def get_model(cls, settings):
        if cls._model is None:
            cls.initialize(settings)
        return cls._model

    @classmethod
    def get_pipeline(cls, settings):
        if cls._detector is None or cls._model is None:
            cls.initialize(settings)
        return AgeEstimationPipeline(
            settings,
            ImageQualityService(settings),
            cls._detector,
            cls._model,
        )


def get_pipeline(settings: Settings = Depends(get_settings)):
    return RequestServices.get_pipeline(settings)


def get_current_user(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if not settings.auth_required:
        return CurrentUser(
            user_id="development-user",
            permissions=frozenset({"age_estimation:run"}),
        )

    header = request.headers.get("Authorization", "")
    if not header.startswith("Bearer "):
        raise APIException(
            ErrorCode.AUTHENTICATION_REQUIRED.value,
            "Authentication is required.",
            401,
        )

    token = header[7:].strip()
    if not token:
        raise APIException(
            ErrorCode.AUTHENTICATION_REQUIRED.value,
            "Authentication is required.",
            401,
        )

    # Replace this section with your actual JWT/OIDC verifier.
    # Never accept arbitrary bearer tokens in production.
    raise APIException(
        ErrorCode.FORBIDDEN.value,
        "Authentication provider integration is not configured.",
        403,
    )


def require_permission(
    user: CurrentUser = Depends(get_current_user),
) -> CurrentUser:
    if "age_estimation:run" not in user.permissions:
        raise APIException(
            ErrorCode.FORBIDDEN.value,
            "You do not have permission to run age estimation.",
            403,
        )
    return user
