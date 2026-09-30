Haan bhai, ab tumhari requirement clear hai. Tum face recognition/identity system nahi bana rahe; tumhara goal camera se face detect karke approximate age estimate karna hai, aur scan se pehle quality checks karne hain.

Ek important correction: face image se exact age ±1–2 years reliably guarantee karna realistic nahi hai. 35-year-old ko repeatedly 24–25 predict karna classic dataset/model bias + regression-to-the-mean problem ho sakta hai. Isliye model ko "har haal mein 19/20" force karne ke bajay training/evaluation ko age-distribution ke across calibrate karna better hoga.

Tumhare system ka desired flow roughly ye hona chahiye:

CAMERA
   ↓
Pre-scan instructions
   ├── Good lighting
   ├── Face uncovered
   ├── Face centered
   ├── Correct distance
   ├── Single face
   └── Face clearly visible
   ↓
FACE QUALITY CHECK
   ↓
Capture only if quality passes
   ↓
Face detection + alignment
   ↓
Age estimation model
   ↓
Confidence / quality validation
   ↓
Approximate age result

Aur 35 → 24/25 wali problem ke liye main tumhare liye ek proper ML model-training + dataset + evaluation + frontend camera-flow audit prompt bana sakta hoon jisme specifically check hoga:

dataset mein age distribution
18–20, 21–25, 26–30, 31–35, 36–40 etc. samples
underrepresented age groups
train/validation/test split
data leakage
augmentation
face detection/alignment
model architecture
loss function
MAE/RMSE
per-age-group error
bias toward mean age
35-year-old ko 24–25 predict karne ka root cause
calibration
confidence threshold
poor lighting rejection
face-covered rejection
multiple-face rejection
blur detection
face-size/distance check
camera framing
liveness-related considerations
frontend preview/instruction screen
backend inference pipeline
model versioning
testing with unseen people

Especially important: sirf overall accuracy/MAE dekhna enough nahi hoga. Tumhe report chahiye:

Actual age group	Predicted average	MAE	Error pattern
18–20	—	—	—
21–25	—	—	—
26–30	—	—	—
31–35	—	—	—
36–40	—	—	—
41–50	—	—	—

Isse immediately pata chalega ki model middle-age ki taraf collapse kar raha hai ya nahi.

Camera side bhi aise design karna chahiye

User ko scan se pehle:

Before you start
✓ Make sure your face is well lit
✓ Keep your face inside the frame
✓ Look directly at the camera
✓ Keep your face uncovered
✓ Make sure only one face is visible
✓ Hold the camera steady

Your face will be captured only when the image quality is sufficient.

Phir live camera mein indicators:

        ┌─────────────────────┐
        │                     │
        │      FACE AREA      │
        │       ◯             │
        │                     │
        └─────────────────────┘

        ✓ Good lighting
        ✓ Face detected
        ✓ Face centered
        ✓ Face uncovered
        ✓ Distance OK

        [ Capture ]

Agar condition fail ho:

⚠ Move to a brighter area
⚠ Move your face into the frame
⚠ Remove anything covering your face
⚠ Move slightly closer
⚠ Only one face should be visible

Aur capture button ko manually enable karne ke bajay, quality checks pass hone par automatically enable karna better UX hoga.

Agar tum chaho to main next message mein tumhare liye ek extremely detailed "AI/ML Face Age Estimation System Audit + Training Prompt" bana deta hoon jo tum apne existing Python/project folder par AI coding agent ko de sakte ho. Usmein woh poore project ko scan karke dataset → preprocessing → model → training → evaluation → camera → frontend → inference → result tak trace karega aur specifically tumhari 35-year-old → 24/25 prediction problem ka root cause identify karega.

Build the age-estimation audit prompt

Create the full audit prompt
Design the end-to-end system architecture

2222..=----------------------------------------------------------------------------------------------------------------------------------------------------------

Bilkul. Is system ko main identity/face-recognition system ke bina, sirf face detection + approximate age estimation ke architecture ke roop mein design karunga. Sabse important design principle ye rahega ki bad-quality frame ko model tak bhejna hi nahi hai—warna model lighting, blur, pose, occlusion etc. ko age signal samajh sakta hai.

1. Complete system architecture
┌──────────────────────────────────────────────────────────────┐
│                        USER / BROWSER                         │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  PRE-SCAN INSTRUCTION SCREEN                 │
│                                                              │
│  ✓ Good lighting                                             │
│  ✓ Face clearly visible                                      │
│  ✓ Face uncovered                                            │
│  ✓ Look toward camera                                        │
│  ✓ Keep one face in frame                                    │
│  ✓ Keep face inside guide                                    │
└──────────────────────────────┬───────────────────────────────┘
                               │ Start Scan
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    LIVE CAMERA PREVIEW                       │
│                                                              │
│              ┌──────────────────────┐                        │
│              │      FACE GUIDE      │                        │
│              │        ◯             │                        │
│              └──────────────────────┘                        │
│                                                              │
│  Lighting        ████████  GOOD                              │
│  Face            ✓ Detected                                  │
│  Position        ✓ Centered                                  │
│  Size            ✓ Suitable                                  │
│  Blur            ✓ Sharp                                     │
│  Occlusion      ✓ Acceptable                                 │
│  Faces           1                                            │
└──────────────────────────────┬───────────────────────────────┘
                               │
                         Quality Gate
                               │
                  ┌────────────┴────────────┐
                  │                         │
                 FAIL                      PASS
                  │                         │
                  ▼                         ▼
          Show correction              Stable-frame
          instruction                  confirmation
                                            │
                                            ▼
                                      Capture frame
                                            │
                                            ▼
┌──────────────────────────────────────────────────────────────┐
│                  IMAGE PREPROCESSING                          │
│                                                              │
│  Crop → Align → Resize → Normalize                           │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                     AGE MODEL                                │
│                                                              │
│              Face Image                                     │
│                  ↓                                           │
│          Feature Extraction                                  │
│                  ↓                                           │
│          Age Estimation Head                                 │
│                  ↓                                           │
│      Age distribution / estimate                             │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                 INFERENCE VALIDATION                         │
│                                                              │
│  Model confidence / uncertainty                              │
│  Input quality                                               │
│  Plausibility checks                                         │
│  Out-of-distribution checks                                  │
│  Prediction stability                                        │
└──────────────────────────────┬───────────────────────────────┘
                               │
                     ┌─────────┴─────────┐
                     │                   │
                  ACCEPT               REJECT
                     │                   │
                     ▼                   ▼
               Age estimate        "Unable to estimate"
                     │
                     ▼
┌──────────────────────────────────────────────────────────────┐
│                     RESULT UI                                │
│                                                              │
│              Estimated age: ~XX years                       │
│                                                              │
│        This is an approximate AI estimate.                   │
│                                                              │
│                 [Scan Again]                                 │
└──────────────────────────────────────────────────────────────┘
2. Recommended project structure

For a Python-based ML backend:

age-estimation/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   │
│   │   ├── api/
│   │   │   ├── health.py
│   │   │   └── age_estimation.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── request.py
│   │   │   └── response.py
│   │   │
│   │   ├── services/
│   │   │   ├── face_detection.py
│   │   │   ├── quality_check.py
│   │   │   ├── preprocessing.py
│   │   │   ├── inference.py
│   │   │   └── result_validation.py
│   │   │
│   │   ├── models/
│   │   │   ├── age_model.py
│   │   │   └── model_loader.py
│   │   │
│   │   ├── config/
│   │   │   └── settings.py
│   │   │
│   │   └── utils/
│   │       ├── image_utils.py
│   │       └── logging.py
│   │
│   ├── weights/
│   │   └── age_model.pt
│   │
│   └── requirements.txt
│
├── ml/
│   ├── datasets/
│   ├── preprocessing/
│   ├── training/
│   │   ├── train.py
│   │   ├── validate.py
│   │   └── losses.py
│   │
│   ├── evaluation/
│   │   ├── evaluate.py
│   │   ├── age_group_metrics.py
│   │   └── calibration.py
│   │
│   └── experiments/
│
├── frontend/
│   ├── components/
│   │   ├── Camera/
│   │   ├── FaceGuide/
│   │   ├── QualityIndicators/
│   │   ├── ScanButton/
│   │   └── AgeResult/
│   │
│   ├── pages/
│   │   ├── instructions
│   │   ├── scan
│   │   └── result
│   │
│   └── services/
│       └── ageApi.ts
│
├── tests/
│   ├── api/
│   ├── quality/
│   ├── inference/
│   └── integration/
│
└── README.md
3. Camera instruction screen

Don't immediately open the camera.

First show:

Before you start
Prepare for your scan

✓ Use a well-lit environment
✓ Face the camera directly
✓ Keep your entire face inside the guide
✓ Keep your face clearly visible
✓ Do not cover your face
✓ Make sure only one face is visible
✓ Hold the camera steady

[ Continue to Camera ]

Then explain that the system may reject frames that don't meet the quality requirements.

This prevents the user from wondering why the capture button is disabled.

4. Live camera quality pipeline

The camera should continuously evaluate frames.

Camera Frame
     │
     ▼
Face Detection
     │
     ├── No face ───────────────► FAIL
     │
     ├── Multiple faces ────────► FAIL
     │
     ▼
Face Bounding Box
     │
     ▼
Quality Checks
     │
     ├── Lighting
     ├── Blur
     ├── Size
     ├── Position
     ├── Pose
     └── Occlusion
Quality checks
A. Face detection

Require:

faces_detected == 1

If zero:

No face detected — position your face inside the guide.

If multiple:

Only one face should be visible.

B. Face positioning

Calculate the face bounding box relative to the camera frame.

Check:

face_center_x
face_center_y
face_width
face_height

Require the face to be reasonably centered.

User message:

Center your face inside the frame.

C. Face size

Reject extremely small faces.

face_area / frame_area

must exceed a configurable minimum.

Message:

Move slightly closer.

Don't hard-code this threshold permanently; expose it through configuration so you can tune it with real camera testing.

D. Lighting

Evaluate the face region rather than the entire image.

Conceptually:

face_brightness
+
shadow distribution
+
highlight clipping

Possible states:

TOO_DARK
GOOD
TOO_BRIGHT
UNEVENT

Messages:

Lighting is too low. Move to a brighter area.

or

Avoid strong light directly behind you.

E. Blur

Use an image-sharpness metric such as variance of Laplacian or a learned blur detector.

blur_score
      ↓
threshold

If bad:

Image is blurry — hold the camera steady.

F. Pose

Estimate approximate head orientation.

For example:

yaw
pitch
roll

Reject excessive rotation.

✓ Looking forward
⚠ Turn your face toward the camera
G. Occlusion

You specifically want this.

Don't simply assume "face detected = face uncovered."

The system should detect whether important facial regions are sufficiently visible.

Possible state:

FACE_VISIBLE
PARTIALLY_OCCLUDED
HEAVILY_OCCLUDED

If insufficient:

Make sure your face is clearly visible before continuing.

5. Capture gating

This is extremely important.

Never allow capture just because a face was detected.

Instead:

capture_allowed =
    one_face
    AND good_lighting
    AND sufficient_face_size
    AND centered
    AND sharp
    AND acceptable_pose
    AND sufficient_visibility
    AND stable

Then add temporal stability.

For example, don't accept a single good frame.

Frame 1   PASS
Frame 2   PASS
Frame 3   PASS
Frame 4   PASS
Frame 5   PASS
       ↓
Stable
       ↓
Capture

This prevents one lucky frame from triggering the capture.

6. Don't send every camera frame to Python

This is an important architecture decision.

You don't want:

Camera
 ↓
HTTP
 ↓
Python
 ↓
Model

30 times per second.

Instead:

Browser
 │
 ├── lightweight quality checks
 │
 └── preview
        │
        │ only when quality passes
        ▼
     Capture
        │
        ▼
     Python API
        │
        ▼
      Model

This dramatically reduces unnecessary inference/API traffic.

7. API design

Use something like:

POST /api/v1/age-estimation

Request:

{
  "image": "<captured-image>"
}

The backend should not trust the frontend's quality result.

It must independently perform the important validation.

Frontend quality check
        ↓
UX optimization

Backend quality check
        ↓
Security + correctness
8. Backend pipeline

Your Python API:

POST /age-estimation
       │
       ▼
Validate request
       │
       ▼
Decode image
       │
       ▼
Detect face
       │
       ├── 0 → reject
       ├── >1 → reject
       │
       ▼
Quality validation
       │
       ├── bad → reject
       │
       ▼
Face crop/alignment
       │
       ▼
Preprocessing
       │
       ▼
Age model
       │
       ▼
Prediction distribution
       │
       ▼
Uncertainty / confidence validation
       │
       ▼
Response
9. Model architecture

For training, don't start with a giant custom CNN from scratch.

A better experimental setup is:

Face Image
    ↓
Pretrained CNN / Vision Backbone
    ↓
Feature Embedding
    ↓
Age Estimation Head
    ↓
Age distribution / regression

Possible frameworks:

PyTorch
torchvision
OpenCV
NumPy
Pandas
scikit-learn
FastAPI

The exact backbone should be chosen after benchmarking your dataset rather than assuming one architecture will solve the age-bias problem.

10. Very important: don't train only for overall MAE

Your specific problem:

35-year-old → 24/25

can happen when the training distribution causes the model to regress toward common ages.

Suppose your dataset looks like:

18–25    ████████████████████
26–35    ██████████
36–50    ███

The model may learn a biased prediction distribution.

Therefore your evaluation must include:

18–20
21–25
26–30
31–35
36–40
41–50
51+

and calculate metrics independently.

11. Model output

Instead of treating the model as:

35 → 35.0

think in terms of an age distribution:

Age 32 → 0.08
Age 33 → 0.14
Age 34 → 0.22
Age 35 → 0.27
Age 36 → 0.18
Age 37 → 0.07
...

Then calculate an estimate from the distribution.

This can give you useful uncertainty information.

For example:

Estimated age: 35
Prediction uncertainty: relatively high

In that situation, the UI should not pretend that 35 is an exact measurement.

12. Confidence handling

Don't create fake confidence such as:

confidence = model_probability * 100

unless that probability has actually been calibrated.

Instead distinguish:

MODEL OUTPUT
INPUT QUALITY
UNCERTAINTY

Example response:

{
  "status": "success",
  "estimated_age": 35,
  "age_range": {
    "min": 32,
    "max": 38
  },
  "quality": "good",
  "uncertainty": "moderate"
}

If uncertainty is too high:

{
  "status": "uncertain",
  "message": "The image does not provide a reliable age estimate."
}
13. Result states

You should have more than simply:

Age = 35
State 1 — Preparing
Preparing camera...
State 2 — Bad lighting
⚠ Improve lighting
Move somewhere with more even light.
State 3 — No face
⚠ No face detected
Place your face inside the guide.
State 4 — Multiple faces
⚠ Multiple faces detected
Only one face should be visible.
State 5 — Face too small
⚠ Move closer
Your face is too far from the camera.
State 6 — Face partially covered
⚠ Face not clearly visible
Make sure your face is sufficiently uncovered.
State 7 — Bad pose
⚠ Face the camera
Look directly toward the camera.
State 8 — Blurry
⚠ Image is blurry
Hold still for a moment.
State 9 — Ready
✓ Ready

Hold still...
Capturing in 3...2...1...
State 10 — Processing
Analyzing...
State 11 — Successful
Estimated age

35 years

Approximate AI estimate
State 12 — Uncertain
We couldn't produce a sufficiently reliable estimate.

Try again with:
• Better lighting
• A clearer view of your face
• Less movement
• Your face centered in the frame

[Scan Again]
14. Frontend state machine

Instead of scattering booleans everywhere:

isLoading
isFaceDetected
isGoodLight
isCentered
isBlurry
isCapturing
isProcessing

use a clear state machine:

INSTRUCTIONS
     ↓
CAMERA_INITIALIZING
     ↓
CHECKING
     │
     ├── INVALID ──► CHECKING
     │
     ▼
READY
     ↓
CAPTURING
     ↓
PROCESSING
     │
     ├── SUCCESS ──► RESULT
     │
     ├── UNCERTAIN ► RETRY
     │
     └── ERROR ────► ERROR

This will make the UI much easier to maintain.

15. Backend response contract

I'd standardize responses around a status field.

{
  "status": "success",
  "estimated_age": 35,
  "age_range": [32, 38],
  "quality": {
    "lighting": "good",
    "sharpness": "good",
    "pose": "acceptable",
    "face_visibility": "good"
  },
  "uncertainty": "moderate"
}

For a failed capture:

{
  "status": "quality_failed",
  "reason": "FACE_OCCLUDED",
  "message": "Make sure your face is clearly visible."
}

For multiple faces:

{
  "status": "quality_failed",
  "reason": "MULTIPLE_FACES",
  "message": "Only one face should be visible."
}
16. Training pipeline

Your ML side should look like:

Dataset
   ↓
Dataset Audit
   ↓
Age Distribution Analysis
   ↓
Duplicate Detection
   ↓
Train / Validation / Test Split
   ↓
Face Detection / Alignment
   ↓
Preprocessing
   ↓
Augmentation
   ↓
Model Training
   ↓
Validation
   ↓
Age-group Evaluation
   ↓
Calibration
   ↓
Unseen-person Testing
   ↓
Model Selection
   ↓
Export
   ↓
Inference API
Critical rule

Never split images randomly if the same person appears multiple times.

If one person's images appear in both training and test sets, your evaluation can look artificially good.

Split by person identity, where your dataset permits that.

17. Evaluation dashboard

Your training script should generate something like:

MODEL EVALUATION
──────────────────────────────

Overall MAE:              X.XX
Overall RMSE:             X.XX

18–20 MAE:                X.XX
21–25 MAE:                X.XX
26–30 MAE:                X.XX
31–35 MAE:                X.XX
36–40 MAE:                X.XX
41–50 MAE:                X.XX
51+ MAE:                  X.XX

More importantly, generate:

Actual Age vs Predicted Age

and inspect systematic bias.

For example:

Actual:      35
Predictions: 24, 25, 26, 24, 25...

would immediately expose the exact failure you're worried about.

18. Preventing the "everything becomes 24–25" problem

Don't simply add:

if prediction < 30:
    prediction = 30

That would hide the problem rather than fix the model.

Instead investigate:

Dataset imbalance
       ↓
Sampling strategy
       ↓
Loss function
       ↓
Age representation
       ↓
Training distribution
       ↓
Validation distribution
       ↓
Calibration

The goal is to make the model learn the age relationship rather than hard-code a correction.

19. Privacy architecture

Because you're processing a person's face image, design the system so that the captured image is not retained unnecessarily.

Prefer:

Camera
 ↓
Capture
 ↓
HTTPS
 ↓
Inference
 ↓
Result
 ↓
Discard image

rather than:

Camera
 ↓
Upload permanent storage
 ↓
Database

unless persistent storage is genuinely required.

If you don't need the image after inference, don't store it.

Also don't build identity tracking into this system merely because face detection is already present.

20. Final end-to-end architecture

The complete production flow becomes:

                    ┌───────────────┐
                    │     USER      │
                    └───────┬───────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Instruction Screen  │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │   Camera Preview    │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Face Detection      │
                 └──────────┬──────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │ Quality Engine      │
                 │                     │
                 │ • Lighting          │
                 │ • Blur              │
                 │ • Position          │
                 │ • Size              │
                 │ • Pose              │
                 │ • Visibility        │
                 │ • Face count        │
                 └──────────┬──────────┘
                            │
                    ┌───────┴────────┐
                    │                │
                   FAIL             PASS
                    │                │
                    ▼                ▼
              User Guidance    Stable Frames
                                     │
                                     ▼
                                  Capture
                                     │
                                     ▼
                              HTTPS API Request
                                     │
                                     ▼
                            ┌──────────────────┐
                            │ Python / FastAPI │
                            └────────┬─────────┘
                                     │
                                     ▼
                              Backend Quality
                                     │
                                     ▼
                              Face Alignment
                                     │
                                     ▼
                               Preprocessing
                                     │
                                     ▼
                              Age ML Model
                                     │
                                     ▼
                           Distribution / Output
                                     │
                                     ▼
                         Uncertainty + Validation
                                     │
                         ┌───────────┴───────────┐
                         │                       │
                     ACCEPT                  UNCERTAIN
                         │                       │
                         ▼                       ▼
                  Approx. age             Retry / Explain
                         │
                         ▼
                    Result UI
The key design decision

Your model should never be responsible for deciding whether the camera frame is usable.

Separate the system into:

Camera Quality Engine → Capture Gate → ML Model → Uncertainty Handler → Result UI

That separation is what will make the system much more reliable and will also make debugging your current 35 → 24/25 failure dramatically easier: you can determine whether the error originates in image quality, preprocessing, dataset, model training, or calibration, instead of treating the whole pipeline as one black box.

You could continue with

Create the FastAPI endpoint contract
Design the training and evaluation pipeline



33333..----------------------------------------------------------------------------------------------------------------------------

Bilkul. Is system ke liye API contract ko strict, versioned aur predictable rakhna better hoga. Main FastAPI + Pydantic assume kar raha hoon.

Ek important design choice: frontend ke quality checks sirf UX ke liye hain; backend same critical checks dobara karega. Client ko trust karke age inference nahi karni chahiye.

1. API structure
/api/v1
│
├── GET  /health
├── GET  /model/info
│
└── POST /age-estimation

Primary endpoint:

POST /api/v1/age-estimation
Content-Type: multipart/form-data

Image ko JSON/base64 mein bhejne ke bajay multipart/form-data use karna simpler aur efficient rahega.

2. Endpoint: Health
Request
GET /api/v1/health
Response
{
  "status": "ok",
  "service": "age-estimation-api",
  "version": "1.0.0"
}
3. Endpoint: Model information

Useful for debugging/deployment.

GET /api/v1/model/info
Response
{
  "model_name": "age-estimator",
  "model_version": "1.0.0",
  "framework": "pytorch",
  "status": "ready"
}

Don't expose internal filesystem paths or sensitive configuration.

4. Main endpoint
POST /api/v1/age-estimation
Request
Content-Type: multipart/form-data

image: <binary image>

Optional metadata can be included if needed:

client_request_id: "abc123"

I would not send things such as predicted_age, confidence, face_detected, etc. from the frontend. Those values must be generated by the backend.

5. Pydantic request model

For metadata:

from pydantic import BaseModel, Field


class AgeEstimationMetadata(BaseModel):
    client_request_id: str | None = Field(
        default=None,
        max_length=100
    )

But the actual image should remain an UploadFile:

from fastapi import UploadFile, File


async def estimate_age(
    image: UploadFile = File(...)
):
    ...
6. Image validation

Before ML inference:

Upload
  ↓
File type validation
  ↓
File size validation
  ↓
Decode image
  ↓
Image dimensions
  ↓
Face detection
  ↓
Quality validation
  ↓
Inference

Recommended initial constraints:

Allowed:
JPEG
PNG
WEBP

Maximum file size:
e.g. 8 MB

Minimum dimensions:
e.g. 320 × 320

Keep these as configuration values rather than hard-coding them.

7. Validation error format

Every API error should have a consistent structure.

{
  "status": "error",
  "error": {
    "code": "INVALID_IMAGE",
    "message": "The uploaded file could not be processed.",
    "details": {}
  },
  "request_id": "req_123456"
}

This allows your frontend to do:

error.code
      ↓
UI message

instead of parsing human-readable text.

8. Error categories

Use separate categories:

REQUEST_ERROR
IMAGE_ERROR
QUALITY_ERROR
INFERENCE_ERROR
SERVER_ERROR
9. Request errors
Missing image
HTTP
400 Bad Request
Response
{
  "status": "error",
  "error": {
    "code": "IMAGE_REQUIRED",
    "message": "An image is required.",
    "details": {}
  },
  "request_id": "req_001"
}
10. Unsupported file type
415 Unsupported Media Type
{
  "status": "error",
  "error": {
    "code": "UNSUPPORTED_IMAGE_TYPE",
    "message": "Unsupported image format.",
    "details": {
      "allowed_types": [
        "image/jpeg",
        "image/png",
        "image/webp"
      ]
    }
  },
  "request_id": "req_002"
}
11. Image too large
413 Content Too Large
{
  "status": "error",
  "error": {
    "code": "IMAGE_TOO_LARGE",
    "message": "The image exceeds the maximum allowed size.",
    "details": {
      "max_size_mb": 8
    }
  },
  "request_id": "req_003"
}
12. Corrupted image
422 Unprocessable Entity
{
  "status": "error",
  "error": {
    "code": "INVALID_IMAGE",
    "message": "The uploaded image could not be decoded.",
    "details": {}
  },
  "request_id": "req_004"
}
13. Quality-failure architecture

This is the most important part for your application.

Don't return generic:

"Bad image"

Instead return a machine-readable reason.

QUALITY_ERROR
       │
       ├── NO_FACE
       ├── MULTIPLE_FACES
       ├── FACE_TOO_SMALL
       ├── FACE_TOO_LARGE
       ├── FACE_OUT_OF_FRAME
       ├── FACE_NOT_CENTERED
       ├── POOR_LIGHTING
       ├── TOO_DARK
       ├── OVEREXPOSED
       ├── IMAGE_BLURRY
       ├── EXCESSIVE_POSE
       ├── FACE_OCCLUDED
       ├── INSUFFICIENT_FACE_VISIBILITY
       ├── UNSTABLE_FRAME
       └── QUALITY_TOO_LOW
14. No face
422 Unprocessable Entity
{
  "status": "quality_failed",
  "error": {
    "code": "NO_FACE",
    "message": "No suitable face was detected.",
    "details": {
      "faces_detected": 0
    }
  },
  "request_id": "req_101"
}

Frontend:

No face detected. Place your face inside the guide.

15. Multiple faces
{
  "status": "quality_failed",
  "error": {
    "code": "MULTIPLE_FACES",
    "message": "Only one face should be visible.",
    "details": {
      "faces_detected": 2
    }
  },
  "request_id": "req_102"
}

Frontend:

Only one face should be visible.

16. Face too small
{
  "status": "quality_failed",
  "error": {
    "code": "FACE_TOO_SMALL",
    "message": "The detected face is too small for reliable estimation.",
    "details": {
      "face_ratio": 0.08,
      "minimum_ratio": 0.15
    }
  },
  "request_id": "req_103"
}

Frontend:

Move slightly closer to the camera.

17. Face too large
{
  "status": "quality_failed",
  "error": {
    "code": "FACE_TOO_LARGE",
    "message": "The face is too close to the camera.",
    "details": {}
  },
  "request_id": "req_104"
}

Frontend:

Move slightly farther away.

18. Face outside frame
{
  "status": "quality_failed",
  "error": {
    "code": "FACE_OUT_OF_FRAME",
    "message": "The face is not completely inside the camera frame.",
    "details": {}
  },
  "request_id": "req_105"
}

Frontend:

Keep your entire face inside the guide.

19. Poor lighting
{
  "status": "quality_failed",
  "error": {
    "code": "POOR_LIGHTING",
    "message": "Lighting conditions are insufficient for reliable estimation.",
    "details": {
      "lighting_status": "poor"
    }
  },
  "request_id": "req_106"
}

Frontend:

Move to a brighter, evenly lit area.

20. Too dark

If your quality engine distinguishes it:

{
  "status": "quality_failed",
  "error": {
    "code": "TOO_DARK",
    "message": "The face is too dark to analyze reliably.",
    "details": {}
  },
  "request_id": "req_107"
}
21. Overexposed
{
  "status": "quality_failed",
  "error": {
    "code": "OVEREXPOSED",
    "message": "The face is overexposed.",
    "details": {}
  },
  "request_id": "req_108"
}

Frontend:

Avoid very strong light directly on or behind your face.

22. Blurry image
{
  "status": "quality_failed",
  "error": {
    "code": "IMAGE_BLURRY",
    "message": "The image is too blurry for reliable estimation.",
    "details": {}
  },
  "request_id": "req_109"
}

Frontend:

Hold the camera steady.

23. Excessive head pose
{
  "status": "quality_failed",
  "error": {
    "code": "EXCESSIVE_POSE",
    "message": "Please face the camera more directly.",
    "details": {
      "yaw": 27.4,
      "pitch": 5.2
    }
  },
  "request_id": "req_110"
}

For production, you may choose not to expose raw pose values to the user.

24. Face occluded

This directly addresses your requirement.

{
  "status": "quality_failed",
  "error": {
    "code": "FACE_OCCLUDED",
    "message": "The face is not sufficiently visible.",
    "details": {}
  },
  "request_id": "req_111"
}

Frontend:

Make sure your face is clearly visible before continuing.

25. Insufficient face visibility

Keep this separate from general occlusion if your quality engine can distinguish them.

{
  "status": "quality_failed",
  "error": {
    "code": "INSUFFICIENT_FACE_VISIBILITY",
    "message": "Important facial regions are not sufficiently visible.",
    "details": {}
  },
  "request_id": "req_112"
}
26. Unstable frame

If you implement temporal stability:

{
  "status": "quality_failed",
  "error": {
    "code": "UNSTABLE_FRAME",
    "message": "Please hold still while capturing.",
    "details": {}
  },
  "request_id": "req_113"
}
27. Generic quality failure

Fallback:

{
  "status": "quality_failed",
  "error": {
    "code": "QUALITY_TOO_LOW",
    "message": "The image quality is insufficient for a reliable estimate.",
    "details": {}
  },
  "request_id": "req_114"
}
28. Successful inference response

Don't return just:

{
  "age": 35
}

Use a structured response.

{
  "status": "success",
  "result": {
    "estimated_age": 35,
    "estimated_range": {
      "min": 32,
      "max": 38
    },
    "uncertainty": "moderate"
  },
  "quality": {
    "overall": "good"
  },
  "model": {
    "name": "age-estimator",
    "version": "1.0.0"
  },
  "request_id": "req_200"
}

Notice that this says estimated, not actual age.

29. Don't expose raw model internals unnecessarily

I would avoid returning something like:

{
  "age_18_probability": 0.00231,
  "age_19_probability": 0.0042,
  ...
}

to the frontend.

The backend should transform model output into a stable API contract.

30. Uncertain result

This is essential.

If the model isn't sufficiently reliable:

{
  "status": "uncertain",
  "result": {
    "estimated_age": null,
    "estimated_range": null,
    "uncertainty": "high"
  },
  "message": "A sufficiently reliable age estimate could not be produced.",
  "request_id": "req_201"
}

Frontend:

We couldn't produce a sufficiently reliable estimate. Please try again with better lighting and a clearer view of your face.

Do not force a numerical age when the model is uncertain.

31. Model/inference error
500 Internal Server Error
{
  "status": "error",
  "error": {
    "code": "INFERENCE_FAILED",
    "message": "Age estimation could not be completed.",
    "details": {}
  },
  "request_id": "req_300"
}

Don't return:

PyTorch traceback

or filesystem paths to the browser.

Log those server-side using the request_id.

32. Model unavailable

For example, model failed to load.

503 Service Unavailable
{
  "status": "error",
  "error": {
    "code": "MODEL_UNAVAILABLE",
    "message": "The age estimation service is temporarily unavailable.",
    "details": {}
  },
  "request_id": "req_301"
}
33. Timeout
504 Gateway Timeout
{
  "status": "error",
  "error": {
    "code": "INFERENCE_TIMEOUT",
    "message": "The estimation request timed out.",
    "details": {}
  },
  "request_id": "req_302"
}

Frontend:

The scan took too long. Please try again.

34. Pydantic response models

A clean implementation could look like:

from typing import Any, Literal
from pydantic import BaseModel


class ErrorDetails(BaseModel):
    data: dict[str, Any] = {}


class APIError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}


class ErrorResponse(BaseModel):
    status: Literal[
        "error",
        "quality_failed",
        "uncertain"
    ]
    error: APIError | None = None
    message: str | None = None
    request_id: str

Result models:

class AgeRange(BaseModel):
    min: int
    max: int


class AgeResult(BaseModel):
    estimated_age: int | None
    estimated_range: AgeRange | None
    uncertainty: Literal[
        "low",
        "moderate",
        "high"
    ]


class QualityResult(BaseModel):
    overall: Literal[
        "good",
        "acceptable"
    ]


class ModelInfo(BaseModel):
    name: str
    version: str

Success:

class AgeEstimationResponse(BaseModel):
    status: Literal["success"]
    result: AgeResult
    quality: QualityResult
    model: ModelInfo
    request_id: str
35. HTTP status mapping

Keep this consistent:

Situation	HTTP
Successful inference	200
Missing image	400
Invalid image	422
Unsupported format	415
File too large	413
Quality failure	422
Uncertain estimate	200
Model unavailable	503
Inference failure	500
Inference timeout	504

I would return HTTP 200 for uncertain because the API successfully processed the request; the model simply determined that the estimate isn't sufficiently reliable.

36. Complete quality reason enum

Keep these in one Python enum so frontend/backend don't invent different strings:

from enum import Enum


class QualityFailureReason(str, Enum):
    NO_FACE = "NO_FACE"
    MULTIPLE_FACES = "MULTIPLE_FACES"

    FACE_TOO_SMALL = "FACE_TOO_SMALL"
    FACE_TOO_LARGE = "FACE_TOO_LARGE"
    FACE_OUT_OF_FRAME = "FACE_OUT_OF_FRAME"
    FACE_NOT_CENTERED = "FACE_NOT_CENTERED"

    POOR_LIGHTING = "POOR_LIGHTING"
    TOO_DARK = "TOO_DARK"
    OVEREXPOSED = "OVEREXPOSED"

    IMAGE_BLURRY = "IMAGE_BLURRY"

    EXCESSIVE_POSE = "EXCESSIVE_POSE"

    FACE_OCCLUDED = "FACE_OCCLUDED"
    INSUFFICIENT_FACE_VISIBILITY = (
        "INSUFFICIENT_FACE_VISIBILITY"
    )

    UNSTABLE_FRAME = "UNSTABLE_FRAME"

    QUALITY_TOO_LOW = "QUALITY_TOO_LOW"
37. Frontend mapping

The frontend shouldn't have to understand ML internals.

Create:

API error
    ↓
reason code
    ↓
UI message
    ↓
visual indicator

Example:

const qualityMessages = {
  NO_FACE:
    "Place your face inside the guide.",

  MULTIPLE_FACES:
    "Only one face should be visible.",

  FACE_TOO_SMALL:
    "Move slightly closer.",

  FACE_TOO_LARGE:
    "Move slightly farther away.",

  FACE_OUT_OF_FRAME:
    "Keep your entire face inside the guide.",

  POOR_LIGHTING:
    "Move to a brighter area.",

  IMAGE_BLURRY:
    "Hold the camera steady.",

  EXCESSIVE_POSE:
    "Face the camera directly.",

  FACE_OCCLUDED:
    "Make sure your face is clearly visible."
};
38. Recommended final API flow
Browser
   │
   │ POST image
   ▼
/api/v1/age-estimation
   │
   ▼
Validate upload
   │
   ├── invalid ───────► 4xx
   │
   ▼
Decode image
   │
   ▼
Detect exactly one face
   │
   ├── fail ──────────► QUALITY_ERROR
   │
   ▼
Quality engine
   │
   ├── fail ──────────► QUALITY_ERROR
   │
   ▼
Crop / align
   │
   ▼
Preprocess
   │
   ▼
Age model
   │
   ▼
Uncertainty analysis
   │
   ├── too uncertain ─► UNCERTAIN
   │
   ▼
Age result
   │
   ▼
200 SUCCESS
39. One important architectural rule

Tumhare case mein frontend aur backend dono quality checking karenge, lekin unka purpose different hoga:

FRONTEND
│
└── Fast checks
    └── User ko real-time guidance

BACKEND
│
└── Authoritative checks
    ├── Validate image
    ├── Detect face
    ├── Validate quality
    ├── Run model
    └── Validate inference

Isse koi frontend bug quality gate ko bypass karke directly poor-quality image backend par bhej bhi de, to backend phir bhi usko reject kar sakta hai.

Aur tumhari 35-year-old → 24/25 problem ko API level par "correction" nahi karna chahiye. API ko model ka actual calibrated estimate/uncertainty return karna chahiye; systematic bias ko dataset + training + evaluation + calibration stage par fix karna chahiye. यही difference ek genuine ML system aur if age < 30: age = 30 type fake correction ke beech hai.

Useful follow-ups for the API

44444==========----------------------------------------------------------------------------------------------------------------------------------

Bilkul. Is API ko production-ready banana hai to security layer ko age-estimation endpoint se pehle rakhna chahiye:

Client
  ↓
HTTPS
  ↓
CORS
  ↓
Request-size / Content-Type validation
  ↓
Rate limiting
  ↓
Authentication
  ↓
Abuse / quota checks
  ↓
Image validation
  ↓
Face quality checks
  ↓
ML inference
  ↓
Response

Neeche existing /api/v1/age-estimation contract ka security extension hai.

1. Security architecture
                         ┌─────────────────┐
                         │     Browser     │
                         └────────┬────────┘
                                  │ HTTPS
                                  ▼
                         ┌─────────────────┐
                         │      CORS       │
                         └────────┬────────┘
                                  │
                                  ▼
                    ┌──────────────────────────┐
                    │ Request Size / Headers   │
                    │ Content-Type Validation  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     Rate Limiter         │
                    │ IP + User + Endpoint     │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Authentication        │
                    │ API Key / Access Token   │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │     Abuse Controls       │
                    │ quota / burst / anomaly  │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │      Image Validation    │
                    └────────────┬─────────────┘
                                 │
                                 ▼
                         ML Processing
2. Authentication

For a browser-based application, I'd recommend:

Option A — Existing user session

If your application already has authentication:

Authorization: Bearer <access-token>

The backend validates:

token
 ↓
signature
 ↓
expiration
 ↓
issuer/audience
 ↓
user identity
 ↓
permissions

Then the request becomes:

POST /api/v1/age-estimation
Authorization: Bearer eyJ...
Content-Type: multipart/form-data
3. Don't authenticate using the image

Never do something like:

face → identify user → authorize request

The age estimator should remain separate from identity authentication.

Use the application's normal authentication mechanism.

4. API-key option

If this is initially a private internal service, you can alternatively use:

X-API-Key: <API_KEY>

But don't hard-code it in frontend JavaScript.

A browser-visible API key is not a secret.

For a public browser application, use an authenticated backend/session or a server-side proxy rather than embedding a privileged secret in the frontend.

5. Authentication failure responses
Missing credentials
401 Unauthorized
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_REQUIRED",
    "message": "Authentication is required.",
    "details": {}
  },
  "request_id": "req_400"
}
Invalid token
{
  "status": "error",
  "error": {
    "code": "INVALID_AUTHENTICATION",
    "message": "Authentication credentials are invalid.",
    "details": {}
  },
  "request_id": "req_401"
}
Expired token
{
  "status": "error",
  "error": {
    "code": "AUTHENTICATION_EXPIRED",
    "message": "Authentication has expired.",
    "details": {}
  },
  "request_id": "req_402"
}

Don't tell an attacker unnecessary details such as:

"The JWT signature was valid but the audience was wrong."

Keep authentication errors deliberately generic.

6. Authorization

Authentication answers:

Who is this?

Authorization answers:

Is this user allowed to call this endpoint?

For example:

authenticated user
       ↓
age_estimation permission
       ↓
allowed

You can define:

REQUIRED_PERMISSION = "age_estimation:run"

If unauthorized:

403 Forbidden
{
  "status": "error",
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to use this service.",
    "details": {}
  },
  "request_id": "req_403"
}
7. Request size limits

This is particularly important because you're accepting images.

Recommended architecture:

HTTP request
     ↓
MAX BODY SIZE
     ↓
MAX multipart size
     ↓
MAX image file size
     ↓
decode image

For example, start with:

Maximum request: 10 MB
Maximum image:    8 MB

Keep these configurable:

MAX_REQUEST_SIZE_MB=10
MAX_IMAGE_SIZE_MB=8

Don't blindly trust:

Content-Length

The server should enforce the actual received body size as well.

8. Image dimension limits

File size alone isn't enough.

An attacker could send an enormous decompression-heavy image.

Validate:

width
height
total_pixels

For example:

MAX_IMAGE_WIDTH=4096
MAX_IMAGE_HEIGHT=4096
MAX_IMAGE_PIXELS=12000000

Reject anything exceeding those limits.

9. Prevent decompression bombs

Don't fully decode arbitrary image data before checking safety constraints.

Your image processing layer should:

File
 ↓
format validation
 ↓
safe metadata inspection
 ↓
dimension check
 ↓
pixel limit
 ↓
decode

Also use a well-maintained image-processing library.

10. Content-Type validation

Accept only formats you actually need:

image/jpeg
image/png
image/webp

Reject:

application/octet-stream
application/pdf
text/html
video/*

But don't trust the MIME header alone.

For example:

Content-Type: image/jpeg

doesn't guarantee that the file is actually JPEG.

Validate the file's actual format/magic bytes using the image decoder.

11. Rate limiting

You need multiple dimensions of rate limiting.

Not just:

IP → 100 requests/minute

Use:

IP
+
authenticated user
+
endpoint
+
global service

Architecture:

Request
   │
   ├── IP limit
   │
   ├── User limit
   │
   ├── Endpoint limit
   │
   └── Global protection
12. Suggested initial limits

These are starting values, not universal requirements:

Per authenticated user
20 requests / minute
Burst
5 requests / 10 seconds
Per IP
30 requests / minute
Daily quota

For example:

100–500 scans/day/user

depending on your application's purpose and infrastructure.

Don't use these numbers blindly; measure legitimate traffic and adjust them.

13. Rate-limit response
429 Too Many Requests
{
  "status": "error",
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after_seconds": 30
    }
  },
  "request_id": "req_500"
}

Also send:

Retry-After: 30

The frontend can then display:

Too many scans. Please wait 30 seconds.

14. Use Redis for distributed rate limiting

For a single local Python process, in-memory rate limiting can work for development.

For production:

FastAPI instance 1 ─┐
FastAPI instance 2 ─┼──► Redis
FastAPI instance 3 ─┘

Otherwise:

Instance A
  rate limit = 20

Instance B
  rate limit = 20

can accidentally allow significantly more requests than intended.

Redis gives you centralized counters.

15. Rate-limit keys

Use something like:

rl:user:{user_id}:age-estimation
rl:ip:{ip}:age-estimation

For stronger protection:

rl:user:{user_id}:minute
rl:user:{user_id}:day

rl:ip:{ip}:minute
rl:ip:{ip}:burst
16. Don't rely solely on IP

IP-based limits have problems.

Multiple legitimate users may share:

college Wi-Fi
office network
mobile carrier NAT

So don't block an entire IP because one user exceeded a limit.

Authenticated-user limits should be primary; IP limits should be an additional abuse-control layer.

17. Abuse-prevention layer

Add a separate service:

AbuseProtectionService

Responsibilities:

request frequency
daily quota
repeated failures
suspicious request patterns
concurrent requests
temporary blocks

Flow:

Authenticated user
        ↓
Abuse check
        │
        ├── normal ───────► continue
        │
        ├── rate exceeded ► 429
        │
        ├── quota exceeded► 429/403
        │
        └── blocked ──────► 403
18. Concurrent request limit

This is particularly useful because ML inference can be expensive.

Don't allow one account to launch:

100 simultaneous inference requests

Set something like:

Maximum concurrent inference jobs/user = 2

If exceeded:

{
  "status": "error",
  "error": {
    "code": "TOO_MANY_CONCURRENT_REQUESTS",
    "message": "Too many scans are currently being processed.",
    "details": {}
  },
  "request_id": "req_501"
}
19. Duplicate-request protection

A user shouldn't accidentally trigger five identical scans by double-clicking.

Generate a client request ID:

X-Request-ID: scan_8f2d...

or:

Idempotency-Key: 9d1...

For a scan endpoint, you can use a short-lived idempotency window.

Example:

same user
+
same idempotency key
+
5 minutes
       ↓
don't process twice
20. Request IDs

Every request should receive a server-generated ID:

X-Request-ID: req_7c82e91

Response:

{
  "status": "success",
  "request_id": "req_7c82e91"
}

Then your logs can say:

req_7c82e91
 ├── authenticated user
 ├── image validation
 ├── quality check
 ├── model version
 ├── inference duration
 └── final status

Never log the face image itself.

21. CORS

Don't use:

allow_origins=["*"]

in production if your application uses authenticated browser requests.

Instead:

CORS_ORIGINS=https://your-frontend.example

Development:

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

FastAPI:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "Idempotency-Key"
    ],
)

Only allow the methods and headers you actually need.

22. Credentials and CORS

If you're using cookie-based authentication:

allow_credentials=True

and your origin must be explicit.

Do not combine:

allow_origins=["*"]

with credentialed requests.

23. HTTPS

Production should be:

Browser
   ↓ HTTPS
Reverse proxy / CDN
   ↓ HTTPS/internal network
FastAPI

Never send:

Authorization
face images
session cookies

over plain HTTP in production.

24. Security headers

At the reverse proxy/application layer consider:

Strict-Transport-Security
X-Content-Type-Options: nosniff
Content-Security-Policy
Referrer-Policy

For this API, also ensure you don't accidentally return sensitive server information in error responses.

25. Authentication + rate limit order

There is a subtle point here.

For authenticated users:

CORS
 ↓
basic request validation
 ↓
authentication
 ↓
user rate limit
 ↓
inference

But you should also have a cheap IP-level limiter before expensive authentication/inference work, particularly if the endpoint is internet-facing.

Conceptually:

Request
 ↓
IP abuse guard
 ↓
Authentication
 ↓
User quota
 ↓
Inference

This prevents unauthenticated attackers from hammering your authentication layer.

26. Don't let quality failures become an attack vector

A malicious client could repeatedly send:

NO_FACE
NO_FACE
NO_FACE
NO_FACE
...

Even though the ML model isn't running, the server still spends CPU decoding/checking images.

Therefore:

rate limit
 ↓
image size validation
 ↓
cheap validation
 ↓
quality detection

And count all requests toward abuse controls, not just successful predictions.

27. Quota accounting

I'd track:

total_requests
successful_estimates
quality_rejections
inference_errors
rate_limited_requests

For example:

User A
────────────────────
Requests:             50
Successful:           32
Quality rejected:     16
Errors:                2

This is useful for both abuse detection and debugging.

28. Don't store biometric images unnecessarily

This is especially important for your application.

If permanent image storage isn't needed:

Upload
 ↓
Memory
 ↓
Inference
 ↓
Response
 ↓
Discard

Avoid:

Upload
 ↓
/uploads/user123/face.jpg
 ↓
database

unless there is a genuine product requirement.

Also don't log:

base64 image
multipart body
face crop
29. Logging policy

Safe:

request_id
user_id
timestamp
endpoint
HTTP status
latency
model version
quality failure code

Avoid:

raw image
face crop
access token
API key
full Authorization header

For debugging, log hashes/identifiers rather than the actual image where possible.

30. Global infrastructure limits

FastAPI shouldn't be your only protection.

Ideally:

Internet
   ↓
CDN / Reverse Proxy / WAF
   ↓
Global request limits
   ↓
FastAPI
   ↓
Redis
   ↓
ML worker

This protects your Python process from large request floods before they reach it.

31. Don't let inference block the API unnecessarily

For lightweight models:

FastAPI
 ↓
Inference
 ↓
Response

can be fine.

If inference becomes expensive:

FastAPI
 ↓
Job / inference worker
 ↓
GPU/CPU worker

But don't introduce a queue merely for architecture aesthetics. Start synchronous if latency is acceptable and move to workers when actual performance/load requires it.

32. Complete protected endpoint

Your endpoint effectively becomes:

POST /api/v1/age-estimation
                 REQUEST
                    │
                    ▼
              HTTPS / WAF
                    │
                    ▼
               CORS check
                    │
                    ▼
             IP rate limit
                    │
                    ▼
          Request size limit
                    │
                    ▼
           Content validation
                    │
                    ▼
            Authentication
                    │
              ┌─────┴─────┐
              │           │
           Invalid       Valid
              │           │
             401          ▼
                     User rate limit
                           │
                           ▼
                     Daily quota
                           │
                           ▼
                  Concurrent limit
                           │
                           ▼
                     Decode image
                           │
                           ▼
                    Face quality
                           │
                           ▼
                     ML inference
                           │
                           ▼
                    Uncertainty
                           │
                           ▼
                      Response
33. Final API security contract
Layer	Rule	Failure
HTTPS	Required in production	400/403 at infrastructure
CORS	Allow only known origins	Browser blocks request
Request size	e.g. ≤ 10 MB	413
Image size	e.g. ≤ 8 MB	413
Dimensions	Configurable pixel limits	422
MIME	JPEG/PNG/WEBP	415
Authentication	Valid session/token	401
Authorization	Required permission	403
IP rate limit	Burst protection	429
User rate limit	Per-user protection	429
Daily quota	Configurable	429
Concurrency	e.g. 2/user	429
Quality checks	Backend authoritative	422
Model uncertainty	Don't force result	200 uncertain
Model failure	Hide internals	500
Model unavailable	Service unavailable	503
Request tracking	Unique request ID	—
Image logging	Never log raw images	—
Image retention	Prefer ephemeral processing	—
Recommended environment configuration
# Application
APP_ENV=production
API_VERSION=v1

# CORS
CORS_ORIGINS=https://your-frontend.example

# Upload limits
MAX_REQUEST_SIZE_MB=10
MAX_IMAGE_SIZE_MB=8
MAX_IMAGE_WIDTH=4096
MAX_IMAGE_HEIGHT=4096
MAX_IMAGE_PIXELS=12000000

# Rate limiting
RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_BURST=5
IP_RATE_LIMIT_PER_MINUTE=30

# Abuse protection
MAX_CONCURRENT_INFERENCES=2
DAILY_SCAN_LIMIT=200

# Authentication
AUTH_ISSUER=...
AUTH_AUDIENCE=...

# Redis
REDIS_URL=...

# Model
MODEL_NAME=age-estimator
MODEL_VERSION=1.0.0

One final architectural point: rate limiting, authentication and CORS protect the API, but they don't make the age model itself accurate. Your earlier 35 → 24/25 problem still has to be solved independently through dataset distribution, person-level train/test splitting, preprocessing, age-group metrics, loss/model design, and calibration. The API should report an uncertain result rather than artificially shifting the prediction to make it look accurate.

Tighten the production contract



=---------------------------------------------------------------------------------------------------------------------------------------
Haan. Neeche ek complete FastAPI API layer hai jo tumhare current contract ko implement karta hai. Isme:

/api/v1/health
/api/v1/model/info
/api/v1/age-estimation
Pydantic schemas
image validation
request-size validation
authentication dependency
rate-limit hook
quality-failure reasons
structured errors
global exception handlers
request IDs
CORS
OpenAPI examples
model/inference service interfaces

included hain.

Note: actual ML model ko maine deliberately AgeEstimationService ke peeche isolate kiya hai. Isse tum baad mein PyTorch model plug-in kar sakte ho bina API contract change kiye.

Project structure
age-estimation-api/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── exceptions.py
│   ├── schemas.py
│   ├── middleware.py
│   ├── api/
│   │   └── v1.py
│   └── services/
│       ├── image_validation.py
│       └── age_estimation.py
├── requirements.txt
└── .env.example




# FastAPI Age Estimation API

## 1. requirements.txt

```txt
fastapi>=0.115,<1
uvicorn[standard]>=0.30,<1
pydantic>=2.7,<3
pydantic-settings>=2.2,<3
python-multipart>=0.0.9,<1
Pillow>=10,<12
```

For production Redis-backed rate limiting/authentication, add your chosen Redis/auth libraries separately.

---

# 2. .env.example

```env
APP_NAME=Age Estimation API
APP_VERSION=1.0.0
APP_ENV=development

CORS_ORIGINS=http://localhost:3000,http://localhost:5173

MAX_REQUEST_SIZE_MB=10
MAX_IMAGE_SIZE_MB=8
MAX_IMAGE_WIDTH=4096
MAX_IMAGE_HEIGHT=4096
MAX_IMAGE_PIXELS=12000000

RATE_LIMIT_PER_MINUTE=20
RATE_LIMIT_BURST=5
IP_RATE_LIMIT_PER_MINUTE=30
DAILY_SCAN_LIMIT=200
MAX_CONCURRENT_INFERENCES=2

MODEL_NAME=age-estimator
MODEL_VERSION=1.0.0

# Development only.
# Replace with your real authentication configuration.
AUTH_REQUIRED=false
AUTH_ISSUER=
AUTH_AUDIENCE=

REDIS_URL=redis://localhost:6379/0
```

---

# 3. app/config.py

```python
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Age Estimation API"
    app_version: str = "1.0.0"
    app_env: str = "development"

    cors_origins: list[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
    )

    max_request_size_mb: int = 10
    max_image_size_mb: int = 8
    max_image_width: int = 4096
    max_image_height: int = 4096
    max_image_pixels: int = 12_000_000

    rate_limit_per_minute: int = 20
    rate_limit_burst: int = 5
    ip_rate_limit_per_minute: int = 30
    daily_scan_limit: int = 200
    max_concurrent_inferences: int = 2

    model_name: str = "age-estimator"
    model_version: str = "1.0.0"

    auth_required: bool = False
    auth_issuer: str | None = None
    auth_audience: str | None = None

    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

---

# 4. app/schemas.py

```python
from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field


class QualityFailureReason(str, Enum):
    NO_FACE = "NO_FACE"
    MULTIPLE_FACES = "MULTIPLE_FACES"

    FACE_TOO_SMALL = "FACE_TOO_SMALL"
    FACE_TOO_LARGE = "FACE_TOO_LARGE"
    FACE_OUT_OF_FRAME = "FACE_OUT_OF_FRAME"
    FACE_NOT_CENTERED = "FACE_NOT_CENTERED"

    POOR_LIGHTING = "POOR_LIGHTING"
    TOO_DARK = "TOO_DARK"
    OVEREXPOSED = "OVEREXPOSED"

    IMAGE_BLURRY = "IMAGE_BLURRY"
    EXCESSIVE_POSE = "EXCESSIVE_POSE"

    FACE_OCCLUDED = "FACE_OCCLUDED"
    INSUFFICIENT_FACE_VISIBILITY = (
        "INSUFFICIENT_FACE_VISIBILITY"
    )

    UNSTABLE_FRAME = "UNSTABLE_FRAME"

    QUALITY_TOO_LOW = "QUALITY_TOO_LOW"


class Uncertainty(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class ErrorCode(str, Enum):
    IMAGE_REQUIRED = "IMAGE_REQUIRED"
    UNSUPPORTED_IMAGE_TYPE = "UNSUPPORTED_IMAGE_TYPE"
    IMAGE_TOO_LARGE = "IMAGE_TOO_LARGE"
    INVALID_IMAGE = "INVALID_IMAGE"

    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    INVALID_AUTHENTICATION = "INVALID_AUTHENTICATION"
    AUTHENTICATION_EXPIRED = "AUTHENTICATION_EXPIRED"
    FORBIDDEN = "FORBIDDEN"

    RATE_LIMITED = "RATE_LIMITED"
    TOO_MANY_CONCURRENT_REQUESTS = (
        "TOO_MANY_CONCURRENT_REQUESTS"
    )
    DAILY_QUOTA_EXCEEDED = "DAILY_QUOTA_EXCEEDED"

    INFERENCE_FAILED = "INFERENCE_FAILED"
    INFERENCE_TIMEOUT = "INFERENCE_TIMEOUT"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"

    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR"


class APIError(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    status: Literal["error", "quality_failed", "uncertain"]
    error: APIError | None = None
    message: str | None = None
    request_id: str


class AgeRange(BaseModel):
    min: int = Field(ge=0, le=120)
    max: int = Field(ge=0, le=120)


class AgeResult(BaseModel):
    estimated_age: int | None = Field(
        default=None,
        ge=0,
        le=120,
    )

    estimated_range: AgeRange | None = None

    uncertainty: Uncertainty


class QualityResult(BaseModel):
    overall: Literal["good", "acceptable"]


class ModelInfo(BaseModel):
    name: str
    version: str


class AgeEstimationResponse(BaseModel):
    status: Literal["success"]
    result: AgeResult
    quality: QualityResult
    model: ModelInfo
    request_id: str


class UncertainResponse(BaseModel):
    status: Literal["uncertain"]

    result: AgeResult

    message: str

    request_id: str


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str


class ModelInfoResponse(BaseModel):
    model_name: str
    model_version: str
    framework: str
    status: Literal["ready", "unavailable"]
```

---

# 5. app/exceptions.py

Create application-specific exceptions instead of raising random `HTTPException` objects throughout the code.

```python
from typing import Any

from app.schemas import QualityFailureReason


class AppException(Exception):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int,
        details: dict[str, Any] | None = None,
    ):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}

        super().__init__(message)


class QualityFailureException(AppException):
    def __init__(
        self,
        reason: QualityFailureReason,
        message: str,
        details: dict[str, Any] | None = None,
    ):
        super().__init__(
            code=reason.value,
            message=message,
            status_code=422,
            details=details,
        )


class AuthenticationException(AppException):
    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 401,
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
        )


class RateLimitException(AppException):
    def __init__(
        self,
        retry_after_seconds: int,
    ):
        super().__init__(
            code="RATE_LIMITED",
            message="Too many requests. Please try again later.",
            status_code=429,
            details={
                "retry_after_seconds": retry_after_seconds
            },
        )


class InferenceException(AppException):
    def __init__(
        self,
        code: str = "INFERENCE_FAILED",
        message: str = (
            "Age estimation could not be completed."
        ),
        status_code: int = 500,
    ):
        super().__init__(
            code=code,
            message=message,
            status_code=status_code,
        )
```

---

# 6. app/middleware.py

Request IDs and request-size protection belong at middleware/infrastructure level.

```python
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.config import get_settings


class RequestIdMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        request_id = request.headers.get(
            "X-Request-ID"
        ) or f"req_{uuid.uuid4().hex}"

        request.state.request_id = request_id

        response = await call_next(request)

        response.headers["X-Request-ID"] = request_id

        return response


class RequestSizeMiddleware(BaseHTTPMiddleware):

    async def dispatch(self, request: Request, call_next):

        settings = get_settings()

        content_length = request.headers.get(
            "content-length"
        )

        if content_length:

            max_bytes = (
                settings.max_request_size_mb
                * 1024
                * 1024
            )

            try:
                content_length_int = int(content_length)
            except ValueError:
                content_length_int = 0

            if content_length_int > max_bytes:

                request_id = getattr(
                    request.state,
                    "request_id",
                    "unknown",
                )

                return JSONResponse(
                    status_code=413,
                    content={
                        "status": "error",
                        "error": {
                            "code": "REQUEST_TOO_LARGE",
                            "message": (
                                "The request exceeds "
                                "the maximum allowed size."
                            ),
                            "details": {
                                "max_size_mb":
                                    settings.max_request_size_mb
                            },
                        },
                        "request_id": request_id,
                    },
                )

        return await call_next(request)
```

For production, enforce body-size limits again at your reverse proxy/CDN. Application middleware should not be your only protection.

---

# 7. app/services/image_validation.py

```python
from io import BytesIO

from PIL import Image, UnidentifiedImageError

from app.config import Settings
from app.exceptions import AppException


ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


class ImageValidationService:

    def __init__(self, settings: Settings):
        self.settings = settings

    def validate_content_type(
        self,
        content_type: str | None,
    ) -> None:

        if content_type not in ALLOWED_CONTENT_TYPES:

            raise AppException(
                code="UNSUPPORTED_IMAGE_TYPE",
                message="Unsupported image format.",
                status_code=415,
                details={
                    "allowed_types": sorted(
                        ALLOWED_CONTENT_TYPES
                    )
                },
            )

    def validate_size(
        self,
        data: bytes,
    ) -> None:

        max_bytes = (
            self.settings.max_image_size_mb
            * 1024
            * 1024
        )

        if len(data) > max_bytes:

            raise AppException(
                code="IMAGE_TOO_LARGE",
                message=(
                    "The image exceeds the maximum "
                    "allowed size."
                ),
                status_code=413,
                details={
                    "max_size_mb":
                        self.settings.max_image_size_mb
                },
            )

    def decode(
        self,
        data: bytes,
    ) -> Image.Image:

        try:
            image = Image.open(BytesIO(data))

            image.load()

        except (
            UnidentifiedImageError,
            OSError,
            ValueError,
        ) as exc:

            raise AppException(
                code="INVALID_IMAGE",
                message=(
                    "The uploaded image could "
                    "not be decoded."
                ),
                status_code=422,
            ) from exc

        if (
            image.width > self.settings.max_image_width
            or image.height > self.settings.max_image_height
        ):

            raise AppException(
                code="INVALID_IMAGE",
                message=(
                    "Image dimensions exceed "
                    "the allowed limits."
                ),
                status_code=422,
                details={
                    "max_width":
                        self.settings.max_image_width,
                    "max_height":
                        self.settings.max_image_height,
                },
            )

        total_pixels = image.width * image.height

        if total_pixels > self.settings.max_image_pixels:

            raise AppException(
                code="INVALID_IMAGE",
                message=(
                    "Image contains too many pixels."
                ),
                status_code=422,
                details={
                    "max_pixels":
                        self.settings.max_image_pixels
                },
            )

        return image
```

---

# 8. app/services/age_estimation.py

This is the interface between FastAPI and your future ML model.

```python
from dataclasses import dataclass

from PIL import Image

from app.config import Settings
from app.exceptions import (
    InferenceException,
    QualityFailureException,
)
from app.schemas import (
    AgeRange,
    QualityFailureReason,
    Uncertainty,
)


@dataclass
class EstimationOutput:
    estimated_age: int | None
    estimated_range: AgeRange | None
    uncertainty: Uncertainty
    quality: str


class AgeEstimationService:

    def __init__(self, settings: Settings):
        self.settings = settings

        self.model_loaded = True

        # Load your actual PyTorch model here later:
        #
        # self.model = load_model(...)
        #
        # self.face_detector = ...
        # self.quality_engine = ...

    async def estimate(
        self,
        image: Image.Image,
    ) -> EstimationOutput:

        if not self.model_loaded:

            raise InferenceException(
                code="MODEL_UNAVAILABLE",
                message=(
                    "The age estimation service "
                    "is temporarily unavailable."
                ),
                status_code=503,
            )

        # ------------------------------------------------
        # IMPORTANT:
        #
        # Replace this section with the real pipeline:
        #
        # image
        #   ↓
        # face detection
        #   ↓
        # exactly one face
        #   ↓
        # quality checks
        #   ↓
        # face crop/alignment
        #   ↓
        # preprocessing
        #   ↓
        # PyTorch inference
        #   ↓
        # uncertainty/calibration
        # ------------------------------------------------

        #
        # Example placeholder only.
        # DO NOT use this as a real age predictor.
        #

        raise InferenceException(
            code="INFERENCE_NOT_IMPLEMENTED",
            message=(
                "The ML inference pipeline "
                "has not been configured yet."
            ),
            status_code=501,
        )
```

The deliberate `501` here is better than pretending that a hardcoded age is a working ML system.

---

# 9. app/dependencies.py

```python
from dataclasses import dataclass

from fastapi import Depends, Request

from app.config import Settings, get_settings
from app.exceptions import (
    AuthenticationException,
    RateLimitException,
)


@dataclass
class CurrentUser:
    user_id: str
    permissions: set[str]


async def get_current_user(
    request: Request,
    settings: Settings = Depends(get_settings),
) -> CurrentUser:

    if not settings.auth_required:

        # Development mode only.
        return CurrentUser(
            user_id="development-user",
            permissions={
                "age_estimation:run"
            },
        )

    authorization = request.headers.get(
        "Authorization"
    )

    if not authorization:

        raise AuthenticationException(
            code="AUTHENTICATION_REQUIRED",
            message="Authentication is required.",
        )

    if not authorization.startswith("Bearer "):

        raise AuthenticationException(
            code="INVALID_AUTHENTICATION",
            message=(
                "Authentication credentials "
                "are invalid."
            ),
        )

    token = authorization.removeprefix(
        "Bearer "
    ).strip()

    if not token:

        raise AuthenticationException(
            code="INVALID_AUTHENTICATION",
            message=(
                "Authentication credentials "
                "are invalid."
            ),
        )

    # ------------------------------------------------
    # Replace with real JWT/OIDC validation:
    #
    # - signature
    # - expiration
    # - issuer
    # - audience
    # - subject
    # - permissions
    # ------------------------------------------------

    raise AuthenticationException(
        code="INVALID_AUTHENTICATION",
        message=(
            "Authentication credentials "
            "are invalid."
        ),
    )


async def require_age_estimation_permission(
    user: CurrentUser = Depends(
        get_current_user
    ),
) -> CurrentUser:

    if "age_estimation:run" not in user.permissions:

        raise AuthenticationException(
            code="FORBIDDEN",
            message=(
                "You do not have permission "
                "to use this service."
            ),
            status_code=403,
        )

    return user


async def rate_limit(
    request: Request,
    user: CurrentUser = Depends(
        require_age_estimation_permission
    ),
    settings: Settings = Depends(get_settings),
) -> None:

    # ------------------------------------------------
    # Development placeholder.
    #
    # Production:
    # implement Redis-backed:
    #
    # rl:user:{user_id}:age-estimation
    # rl:ip:{ip}:age-estimation
    #
    # Use an atomic INCR + EXPIRE strategy
    # or a token-bucket implementation.
    # ------------------------------------------------

    return None
```

---

# 10. app/api/v1.py

```python
from fastapi import (
    APIRouter,
    Depends,
    File,
    Request,
    UploadFile,
)

from app.config import Settings, get_settings
from app.dependencies import (
    CurrentUser,
    rate_limit,
    require_age_estimation_permission,
)
from app.schemas import (
    AgeEstimationResponse,
    HealthResponse,
    ModelInfoResponse,
    UncertainResponse,
)
from app.services.age_estimation import (
    AgeEstimationService,
)
from app.services.image_validation import (
    ImageValidationService,
)


router = APIRouter(
    prefix="/api/v1",
    tags=["Age Estimation"],
)


def get_image_validator(
    settings: Settings = Depends(get_settings),
) -> ImageValidationService:

    return ImageValidationService(settings)


def get_age_service(
    settings: Settings = Depends(get_settings),
) -> AgeEstimationService:

    return AgeEstimationService(settings)


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
)
async def health(
    settings: Settings = Depends(get_settings),
):
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
    )


@router.get(
    "/model/info",
    response_model=ModelInfoResponse,
    summary="Get model information",
)
async def model_info(
    settings: Settings = Depends(get_settings),
):

    return ModelInfoResponse(
        model_name=settings.model_name,
        model_version=settings.model_version,
        framework="pytorch",
        status="ready",
    )


@router.post(
    "/age-estimation",
    response_model=(
        AgeEstimationResponse
        | UncertainResponse
    ),
    summary="Estimate approximate age from a face image",
    description=(
        "Accepts a single face image, validates the "
        "image and face quality, and performs "
        "approximate age estimation."
    ),
    responses={
        400: {
            "description": "Invalid request",
        },
        401: {
            "description": "Authentication required",
        },
        403: {
            "description": "Forbidden",
        },
        413: {
            "description": "Request or image too large",
        },
        415: {
            "description": "Unsupported image format",
        },
        422: {
            "description": "Invalid image or quality failure",
        },
        429: {
            "description": "Rate limited",
        },
        500: {
            "description": "Inference failure",
        },
        503: {
            "description": "Model unavailable",
        },
    },
)
async def estimate_age(
    request: Request,
    image: UploadFile = File(
        ...,
        description=(
            "JPEG, PNG, or WEBP image containing "
            "exactly one visible face."
        ),
    ),
    user: CurrentUser = Depends(
        require_age_estimation_permission
    ),
    _: None = Depends(rate_limit),
    validator: ImageValidationService = Depends(
        get_image_validator
    ),
    service: AgeEstimationService = Depends(
        get_age_service
    ),
):

    request_id = request.state.request_id

    if image is None:

        # Normally FastAPI catches this before reaching
        # the endpoint, but keeping the business rule
        # explicit is useful.
        from app.exceptions import AppException

        raise AppException(
            code="IMAGE_REQUIRED",
            message="An image is required.",
            status_code=400,
        )

    validator.validate_content_type(
        image.content_type
    )

    image_bytes = await image.read()

    validator.validate_size(
        image_bytes
    )

    decoded_image = validator.decode(
        image_bytes
    )

    result = await service.estimate(
        decoded_image
    )

    if result.uncertainty.value == "high":

        return UncertainResponse(
            status="uncertain",
            result={
                "estimated_age": None,
                "estimated_range": None,
                "uncertainty": "high",
            },
            message=(
                "A sufficiently reliable age "
                "estimate could not be produced."
            ),
            request_id=request_id,
        )

    return AgeEstimationResponse(
        status="success",
        result={
            "estimated_age":
                result.estimated_age,
            "estimated_range":
                result.estimated_range,
            "uncertainty":
                result.uncertainty,
        },
        quality={
            "overall": result.quality,
        },
        model={
            "name":
                service.settings.model_name,
            "version":
                service.settings.model_version,
        },
        request_id=request_id,
    )
```

---

# 11. app/main.py

```python
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import (
    RequestValidationError,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import router
from app.config import get_settings
from app.exceptions import AppException
from app.middleware import (
    RequestIdMiddleware,
    RequestSizeMiddleware,
)


logging.basicConfig(
    level=logging.INFO,
)

logger = logging.getLogger(
    "age-estimation-api"
)

settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
API for approximate face-based age estimation.

The service validates image quality before inference
and may return an uncertain result when the model
cannot produce a sufficiently reliable estimate.

This service does not perform identity recognition.
""",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# -----------------------------------------------------
# Middleware
# -----------------------------------------------------

app.add_middleware(
    RequestIdMiddleware
)

app.add_middleware(
    RequestSizeMiddleware
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "OPTIONS",
    ],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Request-ID",
        "Idempotency-Key",
    ],
)


# -----------------------------------------------------
# Exception handlers
# -----------------------------------------------------

@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException,
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "status": (
                "quality_failed"
                if exc.status_code == 422
                and exc.code
                in {
                    "NO_FACE",
                    "MULTIPLE_FACES",
                    "FACE_TOO_SMALL",
                    "FACE_TOO_LARGE",
                    "FACE_OUT_OF_FRAME",
                    "FACE_NOT_CENTERED",
                    "POOR_LIGHTING",
                    "TOO_DARK",
                    "OVEREXPOSED",
                    "IMAGE_BLURRY",
                    "EXCESSIVE_POSE",
                    "FACE_OCCLUDED",
                    "INSUFFICIENT_FACE_VISIBILITY",
                    "UNSTABLE_FRAME",
                    "QUALITY_TOO_LOW",
                }
                else "error"
            ),
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "request_id": request_id,
        },
    )

    if exc.status_code == 429:

        retry_after = exc.details.get(
            "retry_after_seconds"
        )

        if retry_after is not None:
            response.headers[
                "Retry-After"
            ] = str(retry_after)

    return response


@app.exception_handler(
    RequestValidationError
)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "error": {
                "code": "REQUEST_VALIDATION_FAILED",
                "message": (
                    "The request failed "
                    "validation."
                ),
                "details": {
                    "errors": exc.errors()
                },
            },
            "request_id": request_id,
        },
    )


@app.exception_handler(Exception)
async def unexpected_exception_handler(
    request: Request,
    exc: Exception,
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown",
    )

    logger.exception(
        "Unhandled exception request_id=%s",
        request_id,
    )

    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": (
                    "An unexpected server error "
                    "occurred."
                ),
                "details": {},
            },
            "request_id": request_id,
        },
    )


# -----------------------------------------------------
# Routes
# -----------------------------------------------------

app.include_router(router)
```

---

# 12. OpenAPI examples

FastAPI's generated `/docs` will expose the endpoint automatically. For richer OpenAPI documentation, you can attach examples to the endpoint responses.

For example, add these dictionaries to `v1.py`:

```python
SUCCESS_EXAMPLE = {
    "summary": "Successful estimation",
    "value": {
        "status": "success",
        "result": {
            "estimated_age": 35,
            "estimated_range": {
                "min": 32,
                "max": 38
            },
            "uncertainty": "moderate"
        },
        "quality": {
            "overall": "good"
        },
        "model": {
            "name": "age-estimator",
            "version": "1.0.0"
        },
        "request_id": "req_200"
    }
}


UNCERTAIN_EXAMPLE = {
    "summary": "Uncertain estimate",
    "value": {
        "status": "uncertain",
        "result": {
            "estimated_age": None,
            "estimated_range": None,
            "uncertainty": "high"
        },
        "message": (
            "A sufficiently reliable age estimate "
            "could not be produced."
        ),
        "request_id": "req_201"
    }
}


NO_FACE_EXAMPLE = {
    "summary": "No face detected",
    "value": {
        "status": "quality_failed",
        "error": {
            "code": "NO_FACE",
            "message": (
                "No suitable face was detected."
            ),
            "details": {
                "faces_detected": 0
            }
        },
        "request_id": "req_101"
    }
}


MULTIPLE_FACES_EXAMPLE = {
    "summary": "Multiple faces",
    "value": {
        "status": "quality_failed",
        "error": {
            "code": "MULTIPLE_FACES",
            "message": (
                "Only one face should be visible."
            ),
            "details": {
                "faces_detected": 2
            }
        },
        "request_id": "req_102"
    }
}


BLURRY_EXAMPLE = {
    "summary": "Blurry image",
    "value": {
        "status": "quality_failed",
        "error": {
            "code": "IMAGE_BLURRY",
            "message": (
                "The image is too blurry for "
                "reliable estimation."
            ),
            "details": {}
        },
        "request_id": "req_109"
    }
}


RATE_LIMIT_EXAMPLE = {
    "summary": "Rate limit exceeded",
    "value": {
        "status": "error",
        "error": {
            "code": "RATE_LIMITED",
            "message": (
                "Too many requests. "
                "Please try again later."
            ),
            "details": {
                "retry_after_seconds": 30
            }
        },
        "request_id": "req_500"
    }
}
```

Then use them in the route:

```python
responses={
    200: {
        "description": (
            "Successful age estimation"
        ),
        "content": {
            "application/json": {
                "examples": {
                    "success": SUCCESS_EXAMPLE,
                    "uncertain": UNCERTAIN_EXAMPLE,
                }
            }
        },
    },
    401: {
        "description": "Authentication required"
    },
    403: {
        "description": "Forbidden"
    },
    413: {
        "description": "Request or image too large"
    },
    415: {
        "description": "Unsupported image format"
    },
    422: {
        "description": (
            "Invalid image or face quality failure"
        ),
        "content": {
            "application/json": {
                "examples": {
                    "no_face": NO_FACE_EXAMPLE,
                    "multiple_faces":
                        MULTIPLE_FACES_EXAMPLE,
                    "blurry": BLURRY_EXAMPLE,
                }
            }
        },
    },
    429: {
        "description": "Rate limit exceeded",
        "content": {
            "application/json": {
                "example": RATE_LIMIT_EXAMPLE
            }
        },
    },
}
```

---

# 13. Running the API

From the project root:

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

Install:

```bash
pip install -r requirements.txt
```

Run:

```bash
uvicorn app.main:app --reload
```

Then:

```text
http://127.0.0.1:8000/docs
```

OpenAPI JSON:

```text
http://127.0.0.1:8000/openapi.json
```

---

# 14. Example curl request

```bash
curl -X POST ^
  "http://127.0.0.1:8000/api/v1/age-estimation" ^
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" ^
  -H "X-Request-ID: req_demo_001" ^
  -H "accept: application/json" ^
  -F "image=@face.jpg"
```

Development mode with `AUTH_REQUIRED=false` doesn't require the Authorization header.

---

# 15. Frontend API flow

Your frontend should NOT do:

```text
Camera
 ↓
calculate age itself
 ↓
show result
```

Instead:

```text
Camera
 ↓
Frontend quality checks
 ↓
Capture gate
 ↓
POST /api/v1/age-estimation
 ↓
Backend authentication
 ↓
Backend image validation
 ↓
Backend face detection
 ↓
Backend quality checks
 ↓
ML inference
 ↓
uncertainty validation
 ↓
JSON response
 ↓
Frontend result state
```

---

# 16. Frontend response handling

Conceptually:

```typescript
switch (response.status) {

  case "success":
    showAgeResult(response.result);
    break;

  case "uncertain":
    showRetryState(response.message);
    break;

  case "quality_failed":
    showQualityMessage(
      response.error.code
    );
    break;

  case "error":
    showGenericError(
      response.error.code
    );
    break;
}
```

This is much cleaner than trying to interpret arbitrary backend strings.

---

# 17. One thing I intentionally did NOT implement

The API above deliberately contains:

```python
raise InferenceException(
    code="INFERENCE_NOT_IMPLEMENTED",
    ...
)
```

rather than fake something like:

```python
estimated_age = 25
```

That's intentional.

The next layer should be:

```text
Face detector
      ↓
Face quality engine
      ↓
Face alignment
      ↓
PyTorch model
      ↓
Age distribution
      ↓
Calibration
      ↓
Uncertainty
      ↓
AgeEstimationService
```

Then the FastAPI contract stays unchanged.

So when you improve the model from:

```text
35 → 25
```

to a properly trained/calibrated model producing something like:

```text
35 → 34/35/36
```

the frontend/API doesn't need to be rewritten.

**One production note:** `AUTH_REQUIRED=false`, the placeholder auth dependency, and the in-memory/no-op rate-limit hook above are for development scaffolding only. Before exposing this API publicly, wire them to your real authentication provider and a shared Redis-backed limiter, and enforce request limits at the reverse proxy/WAF as well.
