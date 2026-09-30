"""
Evaluate raw and calibrated age predictions.

CSV:
    actual_age,raw_age

Reports MAE, RMSE, and accuracy within ±1/±2/±3 years.
"""

import argparse
import csv
import math
import numpy as np


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True)
    args = parser.parse_args()

    actual, raw = [], []
    with open(args.csv, "r", encoding="utf-8", newline="") as f:
        for row in csv.DictReader(f):
            actual.append(float(row["actual_age"]))
            raw.append(float(row["raw_age"]))

    actual = np.asarray(actual)
    raw = np.asarray(raw)

    errors = raw - actual

    print(f"samples: {len(actual)}")
    print(f"MAE: {np.mean(np.abs(errors)):.3f}")
    print(f"RMSE: {math.sqrt(np.mean(errors ** 2)):.3f}")

    for n in (1, 2, 3, 5):
        pct = np.mean(np.abs(errors) <= n) * 100
        print(f"within +/-{n}: {pct:.2f}%")

    print("\nAge-group MAE")
    for lo, hi in [(18, 20), (21, 25), (26, 30), (31, 35), (36, 40), (41, 50), (51, 60), (61, 100)]:
        mask = (actual >= lo) & (actual <= hi)
        if np.any(mask):
            print(f"{lo:02d}-{hi:03d}: {np.mean(np.abs(errors[mask])):.3f}")


if __name__ == "__main__":
    main()
