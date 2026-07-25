"use client";

import { useEffect, useRef, useState } from "react";
import * as faceapi from "@vladmandic/face-api";
import { Camera, ShieldAlert } from "lucide-react";

export default function FaceScanner({ onAgeEstimated }: { onAgeEstimated: (age: number) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Failed to load face models", err);
        setError("Failed to load security models.");
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      videoRef.current.srcObject = stream;
      setIsScanning(true);
      setError(null);
    } catch (err) {
      console.error("Camera access denied", err);
      setError("Camera access is required for age verification.");
    }
  };

  const handleVideoPlay = () => {
    if (!videoRef.current || !isModelLoaded) return;
    
    // Scan every second until we get a solid reading
    const scanInterval = setInterval(async () => {
      if (!videoRef.current) return;
      
      const detection = await faceapi.detectSingleFace(
        videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()
      ).withAgeAndGender();

      if (detection) {
        // Stop scanning once we detect age
        clearInterval(scanInterval);
        
        // Stop the camera
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsScanning(false);
        onAgeEstimated(detection.age);
      }
    }, 1000);

    // Timeout after 15 seconds if no face detected
    setTimeout(() => {
      clearInterval(scanInterval);
      if (isScanning) {
        setError("Could not detect a face. Please try again in good lighting.");
        setIsScanning(false);
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) stream.getTracks().forEach(track => track.stop());
      }
    }, 15000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
      <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mb-4">
        <Camera className="w-8 h-8 text-primary-500" />
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2">Age Verification</h3>
      <p className="text-gray-400 text-sm mb-6 max-w-[250px]">
        To keep this community safe, we use on-device AI to verify you are 18 or older. No photos are uploaded.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/20 p-3 rounded-lg text-red-400 text-sm mb-4 w-full text-left">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="relative w-full max-w-[240px] aspect-[3/4] bg-black rounded-xl overflow-hidden mb-4 border-2 border-white/10">
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-gray-500 text-sm px-4">Camera off</p>
          </div>
        )}
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline
          onPlay={handleVideoPlay}
          className={`w-full h-full object-cover ${!isScanning ? 'hidden' : ''}`} 
        />
        
        {isScanning && (
          <div className="absolute inset-0 border-[3px] border-primary-500 rounded-xl animate-pulse pointer-events-none" />
        )}
      </div>

      {!isScanning && (
        <button 
          onClick={startCamera}
          disabled={!isModelLoaded}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            isModelLoaded 
              ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20' 
              : 'bg-white/10 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isModelLoaded ? 'Start Verification' : 'Loading Security Models...'}
        </button>
      )}
    </div>
  );
}
