import logging
from dataclasses import dataclass
from threading import Lock

import numpy as np
from deepface import DeepFace

from app.config import Settings
from app.exceptions import APIException
from app.schemas import ErrorCode, Uncertainty
from app.services.calibration import CalibrationService

logger = logging.getLogger(__name__)


@dataclass
class AgePrediction:
    raw_age: float
    calibrated_age: float
    uncertainty: Uncertainty
    lower: int
    upper: int


class AgeModelService:
    """
    DeepFace supplies an apparent-age model. We use RetinaFace separately
    for single-face validation, then pass only the validated crop to the
    age model. The fixed +3 correction is intentionally absent.

    Calibration is an offline-fitted residual-bias mapping loaded from
    models/calibration.json.
    """

    def __init__(self, settings: Settings, calibration: CalibrationService):
        self.settings = settings
        self.calibration = calibration
        self.ready = False
        self._lock = Lock()

    def warmup(self) -> None:
        try:
            # Force model construction/download once at startup.
            dummy = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.analyze(
                dummy,
                actions=["age"],
                detector_backend="skip",
                enforce_detection=False,
                align=False,
                silent=True,
            )
            self.ready = True
            logger.info("Age model warm-up completed.")
        except Exception:
            self.ready = False
            logger.exception("Age model warm-up failed.")

    def predict(self, face_crop: np.ndarray) -> AgePrediction:
        if not self.ready:
            raise APIException(
                ErrorCode.MODEL_UNAVAILABLE.value,
                "Age model is not ready.",
                503,
            )

        try:
            # DeepFace's age model is loaded/cached by the library. The
            # validated crop is already a single face, so detector='skip'
            # avoids running face detection twice.
            with self._lock:
                result = DeepFace.analyze(
                    face_crop,
                    actions=["age"],
                    detector_backend="skip",
                    enforce_detection=False,
                    align=False,
                    silent=True,
                )

            result = result[0] if isinstance(result, list) else result
            raw_age = float(result["age"])

            calibrated = float(self.calibration.transform(raw_age))

            # This is deliberately a conservative uncertainty estimate.
            # It is not claimed as a statistical confidence interval.
            distance = abs(calibrated - raw_age)
            if distance <= 1.0:
                uncertainty = Uncertainty.LOW
                spread = 2
            elif distance <= 2.5:
                uncertainty = Uncertainty.MODERATE
                spread = 3
            else:
                uncertainty = Uncertainty.HIGH
                spread = 5

            estimated = int(round(calibrated))
            lower = max(0, estimated - spread)
            upper = min(120, estimated + spread)

            return AgePrediction(
                raw_age=raw_age,
                calibrated_age=calibrated,
                uncertainty=uncertainty,
                lower=lower,
                upper=upper,
            )

        except APIException:
            raise
        except Exception as exc:
            logger.exception("Age inference failed.")
            raise APIException(
                ErrorCode.INFERENCE_FAILED.value,
                "Age inference failed.",
                500,
            ) from exc
