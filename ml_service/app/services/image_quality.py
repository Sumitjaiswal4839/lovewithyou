from dataclasses import dataclass
import math
import cv2
import numpy as np

from app.config import Settings
from app.exceptions import QualityException
from app.schemas import ErrorCode, QualityLevel


@dataclass
class FaceCandidate:
    crop: np.ndarray
    x: int
    y: int
    w: int
    h: int
    confidence: float
    landmarks: dict


@dataclass
class QualityMetrics:
    level: QualityLevel
    face_fraction: float
    sharpness: float
    brightness: float
    detector_confidence: float
    yaw_degrees: float | None
    pitch_degrees: float | None
    roll_degrees: float | None


def _clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))


def _angle_from_points(a, b, c):
    # angle ABC
    ba = np.array(a, dtype=np.float64) - np.array(b, dtype=np.float64)
    bc = np.array(c, dtype=np.float64) - np.array(b, dtype=np.float64)
    denom = np.linalg.norm(ba) * np.linalg.norm(bc)
    if denom == 0:
        return None
    cosang = np.clip(np.dot(ba, bc) / denom, -1.0, 1.0)
    return math.degrees(math.acos(cosang))


def estimate_pose(landmarks: dict) -> tuple[float | None, float | None, float | None]:
    """
    Lightweight landmark geometry. This is a screening signal, not a
    replacement for a dedicated 3D head-pose estimator.
    """
    left_eye = landmarks.get("left_eye")
    right_eye = landmarks.get("right_eye")
    nose = landmarks.get("nose")
    mouth_left = landmarks.get("mouth_left")
    mouth_right = landmarks.get("mouth_right")

    if not all([left_eye, right_eye, nose, mouth_left, mouth_right]):
        return None, None, None

    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    roll = math.degrees(math.atan2(dy, dx))

    eye_mid_x = (left_eye[0] + right_eye[0]) / 2
    eye_dist = abs(dx)
    yaw_proxy = ((nose[0] - eye_mid_x) / max(eye_dist, 1.0)) * 45.0

    mouth_mid_y = (mouth_left[1] + mouth_right[1]) / 2
    eye_mid_y = (left_eye[1] + right_eye[1]) / 2
    face_height = max(abs(mouth_mid_y - eye_mid_y), 1.0)
    pitch_proxy = ((nose[1] - eye_mid_y) / face_height - 0.5) * 35.0

    return float(yaw_proxy), float(pitch_proxy), float(roll)


class ImageQualityService:
    def __init__(self, settings: Settings):
        self.settings = settings

    def decode(self, data: bytes) -> np.ndarray:
        arr = np.frombuffer(data, dtype=np.uint8)
        image = cv2.imdecode(arr, cv2.IMREAD_COLOR)
        if image is None:
            raise QualityException(
                ErrorCode.INVALID_IMAGE.value,
                "The uploaded image could not be decoded.",
            )

        h, w = image.shape[:2]
        if w < 160 or h < 160:
            raise QualityException(
                ErrorCode.IMAGE_TOO_SMALL.value,
                "Image dimensions are too small for reliable face analysis.",
                {"width": w, "height": h},
            )

        if w > self.settings.max_image_width or h > self.settings.max_image_height:
            raise QualityException(
                ErrorCode.INVALID_IMAGE.value,
                "Image dimensions exceed the configured limits.",
                {
                    "width": w,
                    "height": h,
                    "max_width": self.settings.max_image_width,
                    "max_height": self.settings.max_image_height,
                },
            )

        if w * h > self.settings.max_image_pixels:
            raise QualityException(
                ErrorCode.INVALID_IMAGE.value,
                "Image contains too many pixels.",
                {"pixels": w * h, "max_pixels": self.settings.max_image_pixels},
            )

        return image

    def validate_single_face(
        self,
        image: np.ndarray,
        detected_faces: list[dict],
    ) -> tuple[FaceCandidate, QualityMetrics]:
        h, w = image.shape[:2]

        if len(detected_faces) == 0:
            raise QualityException(
                ErrorCode.NO_FACE.value,
                "No suitable face was detected.",
                {"face_count": 0},
            )

        if len(detected_faces) > 1:
            raise QualityException(
                ErrorCode.MULTIPLE_FACES.value,
                "Exactly one face must be visible.",
                {"face_count": len(detected_faces)},
            )

        item = detected_faces[0]
        area = item.get("facial_area") or item.get("region") or {}
        x = int(area.get("x", 0))
        y = int(area.get("y", 0))
        fw = int(area.get("w", 0))
        fh = int(area.get("h", 0))
        confidence = float(item.get("confidence", item.get("face_confidence", 1.0)) or 0.0)

        if confidence < self.settings.min_detector_confidence:
            raise QualityException(
                ErrorCode.LOW_DETECTOR_CONFIDENCE.value,
                "Face detection confidence is too low.",
                {"detector_confidence": confidence},
            )

        if fw <= 0 or fh <= 0:
            raise QualityException(
                ErrorCode.FACE_OUT_OF_FRAME.value,
                "The detected face region is invalid.",
            )

        face_fraction = (fw * fh) / float(w * h)

        if face_fraction < self.settings.min_face_fraction:
            raise QualityException(
                ErrorCode.FACE_TOO_SMALL.value,
                "Move closer so the face occupies more of the frame.",
                {"face_fraction": face_fraction},
            )

        if face_fraction > self.settings.max_face_fraction:
            raise QualityException(
                ErrorCode.FACE_TOO_LARGE.value,
                "Move slightly farther away so the complete face is visible.",
                {"face_fraction": face_fraction},
            )

        margin = max(4, int(min(fw, fh) * 0.03))
        if x < -margin or y < -margin or x + fw > w + margin or y + fh > h + margin:
            raise QualityException(
                ErrorCode.FACE_OUT_OF_FRAME.value,
                "The face must be fully inside the frame.",
            )

        cx = x + fw / 2.0
        cy = y + fh / 2.0
        if abs(cx - w / 2) > w * 0.25 or abs(cy - h / 2) > h * 0.25:
            raise QualityException(
                ErrorCode.FACE_NOT_CENTERED.value,
                "Center your face in the camera frame.",
            )

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        brightness = float(np.mean(gray))

        if sharpness < self.settings.min_sharpness:
            raise QualityException(
                ErrorCode.IMAGE_BLURRY.value,
                "The image is too blurry. Hold the camera steady.",
                {"sharpness": sharpness},
            )

        if brightness < self.settings.min_brightness:
            raise QualityException(
                ErrorCode.LOW_LIGHT.value,
                "Lighting is too dark for reliable estimation.",
                {"brightness": brightness},
            )

        if brightness > self.settings.max_brightness:
            raise QualityException(
                ErrorCode.OVEREXPOSED.value,
                "The image is overexposed. Reduce direct light.",
                {"brightness": brightness},
            )

        landmarks = item.get("landmarks") or {}
        yaw, pitch, roll = estimate_pose(landmarks)

        if yaw is not None and (
            abs(yaw) > self.settings.max_yaw_degrees
            or abs(pitch or 0) > self.settings.max_pitch_degrees
            or abs(roll or 0) > self.settings.max_roll_degrees
        ):
            raise QualityException(
                ErrorCode.EXCESSIVE_POSE.value,
                "Face the camera more directly.",
                {
                    "yaw_degrees": yaw,
                    "pitch_degrees": pitch,
                    "roll_degrees": roll,
                },
            )

        crop = image[
            max(0, y): min(h, y + fh),
            max(0, x): min(w, x + fw),
        ].copy()

        if crop.size == 0:
            raise QualityException(
                ErrorCode.FACE_OUT_OF_FRAME.value,
                "Could not extract the detected face.",
            )

        if sharpness >= 200 and 70 <= brightness <= 190:
            level = QualityLevel.EXCELLENT
        elif sharpness >= 120 and 55 <= brightness <= 205:
            level = QualityLevel.GOOD
        else:
            level = QualityLevel.ACCEPTABLE

        return (
            FaceCandidate(
                crop=crop,
                x=x,
                y=y,
                w=fw,
                h=fh,
                confidence=confidence,
                landmarks=landmarks,
            ),
            QualityMetrics(
                level=level,
                face_fraction=face_fraction,
                sharpness=sharpness,
                brightness=brightness,
                detector_confidence=confidence,
                yaw_degrees=yaw,
                pitch_degrees=pitch,
                roll_degrees=roll,
            ),
        )
