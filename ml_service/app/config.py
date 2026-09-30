from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Age Estimation API"
    app_version: str = "2.0.0"
    environment: str = "production"

    # API
    max_image_size_mb: int = 8
    max_image_width: int = 4096
    max_image_height: int = 4096
    max_image_pixels: int = 12_000_000
    allowed_content_types: str = "image/jpeg,image/png,image/webp"

    # Face quality
    min_face_fraction: float = 0.08
    max_face_fraction: float = 0.85
    min_sharpness: float = 80.0
    min_brightness: float = 45.0
    max_brightness: float = 215.0
    max_yaw_degrees: float = 25.0
    max_pitch_degrees: float = 25.0
    max_roll_degrees: float = 20.0
    min_detector_confidence: float = 0.90

    # Age uncertainty
    high_uncertainty_threshold: float = 0.75
    max_reported_range: int = 7

    # Calibration
    calibration_path: str = "models/calibration.json"

    # DeepFace
    detector_backend: str = "retinaface"
    age_model_name: str = "Age"

    # CORS
    cors_origins: str = "http://localhost:3000,http://localhost:5173"

    # Optional auth
    auth_required: bool = False
    auth_secret: str = ""

    # Operational
    request_timeout_seconds: float = 30.0
    log_level: str = "INFO"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [x.strip() for x in self.cors_origins.split(",") if x.strip()]

    @property
    def content_type_set(self) -> set[str]:
        return {x.strip().lower() for x in self.allowed_content_types.split(",") if x.strip()}


@lru_cache
def get_settings() -> Settings:
    return Settings()
