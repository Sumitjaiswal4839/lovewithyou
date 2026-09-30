import logging
import numpy as np
from deepface import DeepFace

from app.config import Settings
from app.exceptions import APIException
from app.schemas import ErrorCode

logger = logging.getLogger(__name__)


class RetinaFaceService:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.ready = False

    def warmup(self) -> None:
        try:
            dummy = np.zeros((224, 224, 3), dtype=np.uint8)
            DeepFace.extract_faces(
                dummy,
                detector_backend="retinaface",
                enforce_detection=False,
                align=True,
                anti_spoofing=False,
            )
            self.ready = True
            logger.info("RetinaFace warm-up completed.")
        except Exception:
            # RetinaFace may not detect the dummy image; the important
            # condition is that the detector backend can initialize.
            try:
                DeepFace.extract_faces(
                    np.zeros((224, 224, 3), dtype=np.uint8),
                    detector_backend="retinaface",
                    enforce_detection=False,
                    align=False,
                )
                self.ready = True
            except Exception:
                self.ready = False
                logger.exception("RetinaFace warm-up failed.")

    def detect(self, image: np.ndarray) -> list[dict]:
        if not self.ready:
            raise APIException(
                ErrorCode.MODEL_UNAVAILABLE.value,
                "Face detector is not ready.",
                503,
            )

        try:
            return DeepFace.extract_faces(
                image,
                detector_backend="retinaface",
                enforce_detection=False,
                align=True,
                anti_spoofing=False,
                max_faces=2,
            )
        except Exception as exc:
            logger.exception("RetinaFace detection failed.")
            raise APIException(
                ErrorCode.INFERENCE_FAILED.value,
                "Face detection failed.",
                500,
            ) from exc
