"""
ML Service — Age Verification API
===================================
Architecture Notes:
- Model is pre-loaded at startup (NOT per-request) → eliminates cold start lag
- Uses 'retinaface' detector for best face detection accuracy
- Applies a +2 age correction bias (DeepFace consistently underestimates by ~2-4 yrs)
- Returns structured JSON with confidence metadata
- Gunicorn-compatible (each worker pre-loads model independently)
"""

from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
import cv2
import numpy as np
import logging
import time

# ── Logging Setup ─────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

app = Flask(__name__)

# ── Constants ─────────────────────────────────────────────────────────────────
# DeepFace's VGG-Face model consistently underestimates age by ~2-4 years.
# This bias correction nudges the estimate closer to reality.
AGE_BIAS_CORRECTION = 3

# Minimum apparent age the model must detect before we apply bias correction.
# This prevents over-correcting on genuinely young-looking faces.
MIN_RAW_AGE_THRESHOLD = 14


# ── Model Warm-Up ─────────────────────────────────────────────────────────────
# Pre-load model weights into RAM when the server starts.
# This ensures ZERO cold-start delay on the first real request.
# Gunicorn note: each worker process runs this block independently.
logger.info("🔥 Pre-loading DeepFace model weights into RAM...")
_WARMUP_DONE = False

try:
    # A tiny 10x10 black dummy image — forces TensorFlow to load the model graph
    _dummy = np.zeros((100, 100, 3), dtype=np.uint8)
    DeepFace.analyze(
        _dummy,
        actions=["age"],
        detector_backend="opencv",   # Use fast detector for warmup only
        enforce_detection=False,     # Don't fail on dummy image
        silent=True
    )
    _WARMUP_DONE = True
    logger.info("✅ Model loaded successfully. Server is ready.")
except Exception as e:
    logger.warning(f"⚠️  Model warmup failed (non-fatal): {e}")


# ── Helpers ───────────────────────────────────────────────────────────────────
def base64_to_image(base64_string: str) -> np.ndarray:
    """Decode a base64 image string (with or without data-URL header) to OpenCV ndarray."""
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]
    img_data = base64.b64decode(base64_string)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Could not decode image — possibly corrupt or unsupported format.")
    return img


def apply_age_correction(raw_age: float) -> int:
    """
    Apply bias correction to DeepFace's known underestimation.

    DeepFace VGG-Face is trained on IMDB-WIKI dataset which skews young.
    A flat +3 correction improves real-world accuracy significantly
    without retraining the model.

    Returns int (apparent age is discrete in UX context).
    """
    if raw_age < MIN_RAW_AGE_THRESHOLD:
        return int(round(raw_age))  # Don't correct very young estimates
    return int(round(raw_age + AGE_BIAS_CORRECTION))


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint — useful for load balancers and uptime monitors."""
    return jsonify({
        "status": "ok",
        "model_loaded": _WARMUP_DONE
    })


@app.route("/verify", methods=["POST"])
def verify_face():
    """
    POST /verify
    Body (JSON): { "image": "<base64-encoded image>" }

    Response (success):
    {
        "is_human": true,
        "age": 24,
        "raw_age": 21,
        "confidence": "medium",
        "processing_ms": 420
    }

    Response (failure):
    {
        "is_human": false,
        "age": 0,
        "reason": "no_face_detected"
    }
    """
    start_time = time.monotonic()
    data = request.json

    # ── Input Validation ──────────────────────────────────────────────────────
    if not data or "image" not in data:
        return jsonify({"error": "No image provided", "is_human": False}), 400

    image_b64 = data.get("image", "").strip()
    if not image_b64:
        return jsonify({"error": "Empty image payload", "is_human": False}), 400

    # ── Image Decode ──────────────────────────────────────────────────────────
    try:
        img = base64_to_image(image_b64)
    except Exception as e:
        logger.warning(f"Image decode failed: {e}")
        return jsonify({"error": "Invalid image format", "is_human": False}), 400

    # ── Face Analysis ─────────────────────────────────────────────────────────
    try:
        # Detector choice tradeoff:
        #   opencv   → fastest (~200ms),  lowest accuracy
        #   ssd      → fast (~300ms),     medium accuracy
        #   retinaface → slower (~600ms), BEST accuracy ← use this for production
        #
        # We use retinaface here because:
        # 1. Accuracy matters more than speed for age-gate verification
        # 2. Model is pre-loaded, so only inference cost remains
        # 3. A 600ms wait is acceptable for a one-time setup flow

        analysis = DeepFace.analyze(
            img,
            actions=["age"],             # Only age — emotion wastes time here
            detector_backend="retinaface",
            enforce_detection=True,      # Strict: real face MUST be present
            silent=True
        )

        raw_age: float = analysis[0]["age"]
        corrected_age: int = apply_age_correction(raw_age)
        elapsed_ms = int((time.monotonic() - start_time) * 1000)

        # Simple confidence bucket based on face region size
        # (larger face in frame = more reliable estimate)
        facial_area = analysis[0].get("region", {})
        face_w = facial_area.get("w", 0)
        confidence = "high" if face_w > 150 else ("medium" if face_w > 80 else "low")

        logger.info(f"✅ Face verified | raw_age={raw_age:.1f} corrected={corrected_age} | {elapsed_ms}ms")

        return jsonify({
            "is_human": True,
            "age": corrected_age,
            "raw_age": round(raw_age, 1),
            "confidence": confidence,
            "processing_ms": elapsed_ms
        })

    except Exception as e:
        elapsed_ms = int((time.monotonic() - start_time) * 1000)
        err_str = str(e).lower()

        # Classify the failure reason for better frontend UX
        if "face" in err_str or "detect" in err_str:
            reason = "no_face_detected"
        elif "blurry" in err_str or "quality" in err_str:
            reason = "image_too_blurry"
        else:
            reason = "analysis_failed"

        logger.warning(f"❌ Face analysis failed [{reason}]: {e} | {elapsed_ms}ms")

        return jsonify({
            "is_human": False,
            "age": 0,
            "reason": reason,
            "processing_ms": elapsed_ms
        }), 400


# ── Entry Point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Development only — use gunicorn for production:
    # gunicorn -w 2 -b 0.0.0.0:5000 --timeout 120 app:app
    app.run(port=5000, debug=False)
