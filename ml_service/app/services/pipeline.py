import time
from dataclasses import dataclass

from app.config import Settings
from app.services.age_model import AgeModelService
from app.services.face_detector import RetinaFaceService
from app.services.image_quality import ImageQualityService, QualityMetrics


@dataclass
class PipelineResult:
    age: int
    lower: int
    upper: int
    uncertainty: str
    quality: QualityMetrics
    processing_ms: int
    raw_age: float
    calibrated_age: float


class AgeEstimationPipeline:
    def __init__(
        self,
        settings: Settings,
        quality: ImageQualityService,
        detector: RetinaFaceService,
        model: AgeModelService,
    ):
        self.settings = settings
        self.quality = quality
        self.detector = detector
        self.model = model

    def run(self, image_bytes: bytes) -> PipelineResult:
        start = time.monotonic()

        image = self.quality.decode(image_bytes)
        faces = self.detector.detect(image)
        face, quality = self.quality.validate_single_face(image, faces)

        prediction = self.model.predict(face.crop)

        elapsed = int((time.monotonic() - start) * 1000)

        return PipelineResult(
            age=int(round(prediction.calibrated_age)),
            lower=prediction.lower,
            upper=prediction.upper,
            uncertainty=prediction.uncertainty.value,
            quality=quality,
            processing_ms=elapsed,
            raw_age=prediction.raw_age,
            calibrated_age=prediction.calibrated_age,
        )
