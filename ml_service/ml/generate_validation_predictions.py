from __future__ import annotations

import csv
from pathlib import Path

from deepface import DeepFace


VALIDATION_DIR = Path("ml/validation")
IMAGE_DIR = VALIDATION_DIR / "images"
LABELS_FILE = VALIDATION_DIR / "labels.csv"
OUTPUT_FILE = VALIDATION_DIR / "predictions.csv"


def predict_age(image_path: Path) -> float:
    """
    Generate the RAW age prediction from the exact model
    used by the production API.

    No +3 correction.
    No calibration.
    """

    result = DeepFace.analyze(
        img_path=str(image_path),
        actions=["age"],
        detector_backend="retinaface",
        enforce_detection=True,
        align=True,
        silent=True,
    )

    if isinstance(result, list):
        if len(result) != 1:
            raise ValueError(
                f"Expected exactly one face, found {len(result)}: {image_path}"
            )
        result = result[0]

    return float(result["age"])


def main() -> None:
    rows = []

    with LABELS_FILE.open("r", newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        required = {"image", "actual_age"}
        if not required.issubset(reader.fieldnames or set()):
            raise ValueError(
                f"labels.csv must contain columns: {required}"
            )

        for index, row in enumerate(reader, start=1):
            image_name = row["image"].strip()
            actual_age = float(row["actual_age"])

            image_path = IMAGE_DIR / image_name

            if not image_path.exists():
                print(f"[SKIP] Missing image: {image_path}")
                continue

            try:
                raw_age = predict_age(image_path)

                rows.append(
                    {
                        "image": image_name,
                        "actual_age": actual_age,
                        "raw_age": raw_age,
                    }
                )

                print(
                    f"[{index}] {image_name}: "
                    f"actual={actual_age:.1f}, "
                    f"raw={raw_age:.2f}"
                )

            except Exception as exc:
                print(
                    f"[ERROR] {image_name}: {type(exc).__name__}: {exc}"
                )

    if not rows:
        raise RuntimeError("No validation predictions were generated.")

    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["image", "actual_age", "raw_age"],
        )
        writer.writeheader()
        writer.writerows(rows)

    print()
    print(f"Saved {len(rows)} predictions to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
