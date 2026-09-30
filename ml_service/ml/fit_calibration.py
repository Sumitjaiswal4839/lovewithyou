"""
Fit an age calibration mapping from an independent validation CSV.

Input CSV:
    raw_age,actual_age

Recommended:
    - validation subjects must not overlap training subjects
    - use a large, representative validation set
    - keep the test set untouched until final evaluation

This script uses isotonic regression to learn a monotonic residual mapping.
It does NOT manufacture a fixed +3 correction.
"""

import argparse
import csv
import json
from pathlib import Path

import numpy as np
from sklearn.isotonic import IsotonicRegression


def load_csv(path: Path):
    raw, actual = [], []
    with path.open("r", encoding="utf-8", newline="") as f:
        reader = csv.DictReader(f)
        required = {"raw_age", "actual_age"}
        if not required.issubset(reader.fieldnames or set()):
            raise ValueError("CSV must contain raw_age and actual_age columns.")

        for row in reader:
            raw.append(float(row["raw_age"]))
            actual.append(float(row["actual_age"]))

    if len(raw) < 100:
        raise ValueError("Use at least 100 validation samples; more is strongly recommended.")

    return np.asarray(raw), np.asarray(actual)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True)
    parser.add_argument("--output", default="models/calibration.json")
    parser.add_argument("--max-correction", type=float, default=6.0)
    args = parser.parse_args()

    raw, actual = load_csv(Path(args.csv))

    order = np.argsort(raw)
    raw_sorted = raw[order]
    actual_sorted = actual[order]

    model = IsotonicRegression(
        y_min=0.0,
        y_max=100.0,
        increasing=True,
        out_of_bounds="clip",
    )
    model.fit(raw_sorted, actual_sorted)

    # Reduce the learned mapping to a compact set of knots.
    xs = np.linspace(0, 100, 101)
    ys = model.predict(xs)

    corrections = ys - xs
    corrections = np.clip(
        corrections,
        -args.max_correction,
        args.max_correction,
    )
    ys = xs + corrections

    payload = {
        "version": "isotonic-v1",
        "raw_age_knots": xs.tolist(),
        "calibrated_age_knots": ys.tolist(),
        "max_abs_correction": args.max_correction,
        "training_samples": int(len(raw)),
        "description": (
            "Monotonic calibration fitted on an independent labeled "
            "validation set. This is not a fixed age bias."
        ),
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")

    print(f"Wrote {output} using {len(raw)} samples.")


if __name__ == "__main__":
    main()
