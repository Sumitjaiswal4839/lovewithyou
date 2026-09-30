import json
from bisect import bisect_right
from pathlib import Path
from dataclasses import dataclass

from app.exceptions import APIException
from app.schemas import ErrorCode


@dataclass(frozen=True)
class Calibration:
    version: str
    raw_age_knots: list[float]
    calibrated_age_knots: list[float]
    max_abs_correction: float

    def transform(self, raw_age: float) -> float:
        xs = self.raw_age_knots
        ys = self.calibrated_age_knots

        if len(xs) < 2 or len(xs) != len(ys):
            raise ValueError("Invalid calibration knots.")

        if raw_age <= xs[0]:
            return ys[0]
        if raw_age >= xs[-1]:
            return ys[-1]

        i = bisect_right(xs, raw_age) - 1
        x0, x1 = xs[i], xs[i + 1]
        y0, y1 = ys[i], ys[i + 1]

        t = (raw_age - x0) / (x1 - x0)
        value = y0 + t * (y1 - y0)

        # Safety guard: calibration may correct residual bias, but must not
        # turn into an unconstrained arbitrary age transformation.
        correction = value - raw_age
        correction = max(
            -self.max_abs_correction,
            min(self.max_abs_correction, correction),
        )
        return raw_age + correction


class CalibrationService:
    def __init__(self, path: str):
        self.path = Path(path)
        self.calibration: Calibration | None = None
        self.load()

    @property
    def loaded(self) -> bool:
        return self.calibration is not None

    @property
    def version(self) -> str:
        return self.calibration.version if self.calibration else "unavailable"

    def load(self) -> None:
        if not self.path.exists():
            self.calibration = None
            return

        payload = json.loads(self.path.read_text(encoding="utf-8"))
        self.calibration = Calibration(
            version=str(payload["version"]),
            raw_age_knots=[float(x) for x in payload["raw_age_knots"]],
            calibrated_age_knots=[float(x) for x in payload["calibrated_age_knots"]],
            max_abs_correction=float(payload.get("max_abs_correction", 6.0)),
        )

    def transform(self, raw_age: float) -> float:
        if not self.calibration:
            raise APIException(
                ErrorCode.CALIBRATION_UNAVAILABLE.value,
                "A validated calibration artifact is not loaded.",
                503,
            )
        return self.calibration.transform(raw_age)
