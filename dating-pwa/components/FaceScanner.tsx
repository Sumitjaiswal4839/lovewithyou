"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Camera, ShieldAlert, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

type ScannerState =
  | "INSTRUCTIONS"
  | "CAMERA_INITIALIZING"
  | "CHECKING"
  | "READY"
  | "CAPTURING"
  | "PROCESSING"
  | "RESULT"
  | "UNCERTAIN"
  | "ERROR";

type QualityIssue = 
  | "NO_FACE" 
  | "MULTIPLE_FACES" 
  | "NOT_CENTERED" 
  | "TOO_SMALL" 
  | "BAD_POSE"
  | "POOR_QUALITY"
  | null;

export default function FaceScanner({ onAgeEstimated }: { onAgeEstimated: (age: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [currentState, setCurrentState] = useState<ScannerState>("INSTRUCTIONS");
  const [qualityIssue, setQualityIssue] = useState<QualityIssue>(null);
  const [stableCount, setStableCount] = useState(0);
  const [estimatedAge, setEstimatedAge] = useState<number | null>(null);
  
  const authToken = useUserStore((state) => state.authToken);
  
  // Use ML Service backend URL if available, otherwise fallback to local
  const ML_BACKEND_URL = process.env.NEXT_PUBLIC_ML_BACKEND_URL || "http://localhost:5000";

  // Configuration for stability and quality
  const STABLE_FRAMES_REQUIRED = 5;
  const MIN_FACE_AREA_RATIO = 0.05; // Face must take up at least 5% of the frame

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          // We load face landmarks to check pose and centering
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face models", err);
        setCurrentState("ERROR");
        setQualityIssue(null);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    setCurrentState("CAMERA_INITIALIZING");
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      videoRef.current.srcObject = stream;
      setCurrentState("CHECKING");
    } catch (err) {
      console.error("Camera access denied", err);
      setCurrentState("ERROR");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const captureAndSend = async () => {
    if (!videoRef.current) return;
    
    setCurrentState("CAPTURING");
    
    // Slight delay to simulate capture flash/UI update
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const base64Image = canvas.toDataURL("image/jpeg", 0.9);
    
    stopCamera();
    setCurrentState("PROCESSING");

    // Convert data URL to Blob
    const response_blob = await fetch(base64Image).then(res => res.blob());
    
    const formData = new FormData();
    formData.append("image", response_blob, "face.jpg");

    try {
      // Send via multipart/form-data to our robust ML Service Python Backend
      const response = await fetch(`${ML_BACKEND_URL}/api/v1/age-estimation`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.is_human && data.age) {
        setEstimatedAge(data.age);
        setCurrentState("RESULT");
        
        // Notify parent component after a short delay
        setTimeout(() => {
          onAgeEstimated(data.age);
        }, 2000);
      } else {
        setCurrentState("UNCERTAIN");
        console.warn("Backend rejected or failed verification:", data);
      }
    } catch (error) {
      console.error("Failed to process image:", error);
      setCurrentState("ERROR");
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !isModelLoaded) return;
    
    let isChecking = true;
    let localStableCount = 0;

    const checkQuality = async () => {
      if (!isChecking || !videoRef.current || currentState === "CAPTURING" || currentState === "PROCESSING") return;
      
      try {
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks();

        if (detections.length === 0) {
          setQualityIssue("NO_FACE");
          localStableCount = 0;
          setCurrentState("CHECKING");
        } else if (detections.length > 1) {
          setQualityIssue("MULTIPLE_FACES");
          localStableCount = 0;
          setCurrentState("CHECKING");
        } else {
          const detection = detections[0];
          const box = detection.detection.box;
          const videoWidth = videoRef.current.videoWidth;
          const videoHeight = videoRef.current.videoHeight;
          
          const faceArea = box.width * box.height;
          const frameArea = videoWidth * videoHeight;
          const areaRatio = faceArea / frameArea;

          const centerX = box.x + box.width / 2;
          const centerY = box.y + box.height / 2;
          
          const isCenteredX = centerX > videoWidth * 0.3 && centerX < videoWidth * 0.7;
          const isCenteredY = centerY > videoHeight * 0.2 && centerY < videoHeight * 0.8;

          // Checking face score as a proxy for blur/poor lighting
          const isGoodQuality = detection.detection.score > 0.6;

          if (!isGoodQuality) {
            setQualityIssue("POOR_QUALITY");
            localStableCount = 0;
            setCurrentState("CHECKING");
          } else if (areaRatio < MIN_FACE_AREA_RATIO) {
            setQualityIssue("TOO_SMALL");
            localStableCount = 0;
            setCurrentState("CHECKING");
          } else if (!isCenteredX || !isCenteredY) {
            setQualityIssue("NOT_CENTERED");
            localStableCount = 0;
            setCurrentState("CHECKING");
          } else {
            // Quality passed
            setQualityIssue(null);
            localStableCount++;
            setStableCount(localStableCount);
            
            if (localStableCount >= STABLE_FRAMES_REQUIRED) {
              isChecking = false;
              setCurrentState("READY");
              captureAndSend();
              return; // Stop loop
            }
          }
        }
      } catch (err) {
        console.error("Error during face detection loop", err);
      }

      // Loop
      if (isChecking) {
        requestAnimationFrame(checkQuality);
      }
    };

    checkQuality();
  };

  const retry = () => {
    setEstimatedAge(null);
    setQualityIssue(null);
    setStableCount(0);
    startCamera();
  };

  const getStatusMessage = () => {
    switch (currentState) {
      case "INSTRUCTIONS": return "Ready to start";
      case "CAMERA_INITIALIZING": return "Starting camera...";
      case "CHECKING": 
        switch(qualityIssue) {
          case "NO_FACE": return "Place your face inside the frame";
          case "MULTIPLE_FACES": return "Only one face should be visible";
          case "TOO_SMALL": return "Move slightly closer to the camera";
          case "NOT_CENTERED": return "Center your face in the guide";
          case "POOR_QUALITY": return "Improve lighting and hold still";
          case "BAD_POSE": return "Look directly at the camera";
          default: return "Analyzing frame...";
        }
      case "READY": return "Hold still...";
      case "CAPTURING": return "Capturing...";
      case "PROCESSING": return "Verifying age securely...";
      case "RESULT": return `Estimated Age: ${estimatedAge}`;
      case "UNCERTAIN": return "Could not estimate age reliably";
      case "ERROR": return "A technical error occurred";
    }
  };

  // Render Instructions State
  if (currentState === "INSTRUCTIONS") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-surface-elevated border border-border rounded-2xl text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Camera className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-4">Prepare for Scan</h3>
        
        <div className="text-left space-y-3 mb-6">
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-green-500"/> Use a well-lit environment</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-green-500"/> Face the camera directly</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-green-500"/> Do not cover your face</p>
          <p className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle2 className="w-4 h-4 text-green-500"/> Hold the camera steady</p>
        </div>

        <button 
          onClick={startCamera}
          disabled={!isModelLoaded}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            isModelLoaded 
              ? 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/20' 
              : 'bg-surface-elevated text-white/60 cursor-not-allowed'
          }`}
        >
          {isModelLoaded ? 'Continue to Camera' : 'Loading Security Models...'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-surface-elevated border border-border rounded-2xl text-center">
      <h3 className="text-xl font-bold text-foreground mb-2">Age Verification</h3>
      
      {/* Status Alert Box */}
      <div className={`flex items-center justify-center gap-2 p-3 rounded-lg text-sm mb-4 w-full 
        ${currentState === "ERROR" || currentState === "UNCERTAIN" ? 'bg-error/20 text-red-400' : ''}
        ${currentState === "RESULT" ? 'bg-green-500/20 text-green-400' : ''}
        ${currentState === "CHECKING" && qualityIssue ? 'bg-yellow-500/20 text-yellow-500' : ''}
        ${currentState === "READY" || currentState === "CAPTURING" ? 'bg-primary/20 text-primary' : ''}
        ${currentState === "PROCESSING" || currentState === "CAMERA_INITIALIZING" ? 'bg-blue-500/20 text-blue-400' : ''}
      `}>
        {currentState === "CHECKING" && qualityIssue && <AlertTriangle className="w-4 h-4" />}
        {currentState === "RESULT" && <CheckCircle2 className="w-4 h-4" />}
        {(currentState === "PROCESSING" || currentState === "CAMERA_INITIALIZING") && <Loader2 className="w-4 h-4 animate-spin" />}
        <span className="font-medium">{getStatusMessage()}</span>
      </div>

      <div className="relative w-full max-w-[280px] aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4 border-2 border-border shadow-inner">
        {["CHECKING", "READY", "CAPTURING"].includes(currentState) && (
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline
            onPlay={handleVideoPlay}
            className="w-full h-full object-cover transform -scale-x-100" 
          />
        )}
        
        {/* Face Guide UI */}
        {["CHECKING", "READY"].includes(currentState) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className={`w-2/3 h-1/2 border-2 rounded-[40%] transition-colors duration-300 ${
              currentState === "READY" ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]' : 
              (qualityIssue ? 'border-yellow-500/50' : 'border-white/30')
            }`}></div>
          </div>
        )}

        {/* Capture Flash */}
        {currentState === "CAPTURING" && (
          <div className="absolute inset-0 bg-white animate-pulse" />
        )}

        {/* Processing State Overlay */}
        {currentState === "PROCESSING" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-white/80 text-sm animate-pulse">Running AI Model...</p>
          </div>
        )}
      </div>

      {/* Progress bar for stability */}
      {["CHECKING", "READY"].includes(currentState) && (
        <div className="w-full max-w-[280px] h-2 bg-surface rounded-full overflow-hidden mb-4">
          <div 
            className="h-full bg-primary transition-all duration-200 ease-out"
            style={{ width: `${Math.min(100, (stableCount / STABLE_FRAMES_REQUIRED) * 100)}%` }}
          />
        </div>
      )}

      {["UNCERTAIN", "ERROR"].includes(currentState) && (
        <button 
          onClick={retry}
          className="w-full py-3 bg-surface hover:bg-surface-hover text-foreground rounded-xl font-semibold transition-all border border-border"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
