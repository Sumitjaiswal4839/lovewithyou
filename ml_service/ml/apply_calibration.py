from pathlib import Path
import csv

from app.services.calibration import AgeCalibrator

def main():
    INPUT = Path("ml/validation/predictions.csv")
    OUTPUT = Path("ml/validation/calibrated_predictions.csv")

    if not INPUT.exists():
        print(f"File not found: {INPUT}")
        return

    calibrator = AgeCalibrator(
        Path("models/calibration.json")
    )

    with INPUT.open("r", encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    for row in rows:
        raw_age = float(row["raw_age"])
        row["calibrated_age"] = calibrator.calibrate(raw_age)

    with OUTPUT.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "image",
                "actual_age",
                "raw_age",
                "calibrated_age",
            ],
        )

        writer.writeheader()
        writer.writerows(rows)

    print(f"Saved calibrated predictions: {OUTPUT}")

if __name__ == "__main__":
    main()
