# Production-oriented Age Estimation FastAPI Backend

This backend replaces the previous fixed `+3` correction with an offline-fitted
monotonic calibration artifact.

## Important accuracy statement

No face-only age estimator can guarantee exact chronological age for every person.
The correct engineering target is measured error: MAE, RMSE, and percentage within
±1/±2/±3 years on an independent test set.

Do NOT deploy the placeholder calibration file as if it had been trained.

## Flow

1. Validate upload type and size.
2. Decode image and enforce pixel/dimension limits.
3. RetinaFace detects faces.
4. Require exactly one face.
5. Validate face size, framing, lighting, sharpness, detector confidence and pose.
6. Run DeepFace age model on the validated face crop.
7. Apply an offline calibration mapping learned from labeled validation data.
8. Return estimated age, range and uncertainty.
9. Never apply a fixed `+3` correction.

## Run

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env

uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Docs:
- `/docs`
- `/redoc`
- `/openapi.json`

## Fit calibration

Create a validation CSV:

```csv
raw_age,actual_age
24.8,27
31.2,32
...
```

The raw ages must come from the same deployed age model and the actual ages must
come from an independent labeled validation set.

Then:

```bash
python ml/fit_calibration.py --csv validation_predictions.csv --output models/calibration.json
```

Before deploying, evaluate the untouched test set and compare raw vs calibrated MAE.

## Production requirements

The included in-memory limiter is only a local fallback. For multiple workers or
multiple instances, replace it with Redis-backed rate limiting.

Replace the development authentication dependency with your real JWT/OIDC verifier.

Put the service behind HTTPS and a reverse proxy/WAF. Do not log raw images,
face crops, bearer tokens, or API keys.

## DeepFace / RetinaFace

DeepFace supports RetinaFace as a detector backend and exposes `extract_faces`;
its age model is a separate age-analysis model. The API intentionally uses RetinaFace
for single-face validation and the age model on the validated crop.
