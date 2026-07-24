"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, Camera, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";

export default function SetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setProfile = useUserStore((state) => state.setProfile);
  const addCoins = useUserStore((state) => state.addCoins);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    campus: "", // Optional campus field
    photo_url: "", // Temporarily storing base64 image data
  });
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setCameraError(null);
    } catch (err) {
      console.error("Camera access denied or failed:", err);
      setCameraError("Camera access is mandatory. Please allow camera permissions to continue.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [startCamera]);

  const capturePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        // Match the video dimensions
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const photoDataUrl = canvasRef.current.toDataURL("image/jpeg");
        setFormData({ ...formData, photo_url: photoDataUrl });
        toast("Photo captured successfully for verification.", "success");
      }
    }
  };

  const retakePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    setFormData({ ...formData, photo_url: "" });
  };

  const handleComplete = () => {
    if (!formData.name || !formData.gender || !formData.age) {
      toast("Please fill all required fields", "error");
      return;
    }

    if (!formData.photo_url) {
      toast("A live photo capture is strictly required to proceed.", "error");
      return;
    }

    if (!termsAgreed) {
      toast("You must agree to the Terms & Conditions.", "error");
      return;
    }
    
    // Cleanup video stream before navigating
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Save to Zustand
    setProfile({
      name: formData.name,
      bio: "",
      hobbies: [],
      interests: [],
      location: "",
      campus: formData.campus, // Save the campus
      age: parseInt(formData.age),
      photo_url: formData.photo_url,
      gender: formData.gender,
      verified: true, // Marking true locally for UI purposes based on live photo
      karma: 100, // Default safe karma score for new users
      analytics: {
        views: 0,
        likes: 0,
        matches: 0
      },
      mode: "Date",
      isAnonymous: false
    });

    addCoins(20);
    toast("Profile Verified! +20 Coins Awarded 💰", "success");
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-dark-bg">
      <Card className="w-full max-w-md space-y-6 !p-6 border-primary-500/20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mandatory Verification</h1>
          <p className="text-gray-400 text-xs">
            We enforce strict identity verification to ensure a safe environment.
          </p>
        </div>

        {/* Live Photo Capture Section */}
        <div className="space-y-3 pt-2">
          <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1">
            Live Photo Capture <Lock size={12} className="text-primary-500" />
          </label>
          
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black border border-glass-border">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-red-500/10">
                <AlertTriangle size={32} className="text-red-500 mb-2" />
                <p className="text-sm text-red-400">{cameraError}</p>
                <Button onClick={startCamera} size="sm" variant="secondary" className="mt-4">
                  Retry Camera
                </Button>
              </div>
            ) : !formData.photo_url ? (
              <>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full h-full object-cover -scale-x-100" 
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button 
                    onClick={capturePhoto} 
                    className="p-4 bg-primary-500 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
                  >
                    <Camera size={24} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <img src={formData.photo_url} alt="Captured" className="w-full h-full object-cover -scale-x-100" />
                <div className="absolute top-4 right-4 bg-green-500 text-white p-1 rounded-full shadow-lg">
                   <CheckCircle2 size={24} />
                </div>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <button 
                    onClick={retakePhoto} 
                    className="px-4 py-2 bg-black/60 text-white rounded-full text-sm backdrop-blur-md hover:bg-black/80"
                  >
                    Retake Photo
                  </button>
                </div>
              </>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <p className="text-[10px] text-primary-400 text-center leading-tight">
            This photo is used by our system to permanently lock your gender identity. 
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-gray-300 ml-1">Your Name</label>
            <input 
              type="text"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
              placeholder="e.g. Sumit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 ml-1">Age</label>
            <input 
              type="number"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
              placeholder="e.g. 21"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 ml-1">College/Campus (Optional)</label>
            <input 
              type="text"
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
              placeholder="e.g. Delhi University"
              value={formData.campus}
              onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1">
              Gender <Lock size={12} className="text-primary-500" />
            </label>
            <div className="flex gap-2 mt-1">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={(e) => { e.preventDefault(); setFormData({ ...formData, gender: g }); }}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    formData.gender === g 
                      ? "border-primary-500 bg-primary-500/10 text-primary-500 font-bold" 
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-gray-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 mt-2 text-center flex items-center justify-center gap-1">
               Locked permanently post-verification.
            </p>
          </div>
        </div>
        
        {/* Terms and Conditions Checkbox */}
        <div className="pt-2">
           <label className="flex items-start gap-3 cursor-pointer">
             <input 
               type="checkbox" 
               className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 bg-dark-bg"
               checked={termsAgreed}
               onChange={(e) => setTermsAgreed(e.target.checked)}
             />
             <span className="text-xs text-gray-400 leading-tight">
               I agree that my gender is permanently locked based on my live photo. Changing my name will not alter my verified gender. Read the <Link href="/terms" target="_blank" className="text-primary-500 hover:underline">Terms & Conditions</Link>.
             </span>
           </label>
        </div>

        <Button 
          onClick={handleComplete} 
          className="w-full mt-8" 
          size="lg" 
          disabled={!!cameraError || !formData.photo_url || !termsAgreed}
        >
          Start Matching
        </Button>
      </Card>
    </div>
  );
}
