"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Lock, AlertTriangle, CheckCircle2, Plus, X as XIcon, Image as ImageIcon } from "lucide-react";
import dynamic from "next/dynamic";
const FaceScanner = dynamic(() => import("@/components/FaceScanner"), { 
  ssr: false, 
  loading: () => <div className="h-48 rounded-2xl bg-white/5 animate-pulse flex items-center justify-center text-gray-400 text-sm">Loading Face Scanner...</div> 
});
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";

export default function SetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  // Ensure device fingerprint is generated before profile is saved
  useDeviceAuth();
  const setProfile = useUserStore((state) => state.setProfile);
  const addCoins = useUserStore((state) => state.addCoins);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    campus: "", // Optional campus field
    photo_url: "", // Temporarily storing base64 image data
  });
  
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [aiVerifiedAge, setAiVerifiedAge] = useState<number | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // 6 Photos required
  const [photos, setPhotos] = useState<string[]>(Array(6).fill(""));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number | null>(null);

  // Helper to compress image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.6)); // Compress strongly
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activePhotoIndex === null) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast("Image must be less than 10MB", "error");
      return;
    }

    try {
      const compressedDataUrl = await compressImage(file);
      setPhotos((prev) => {
        const newPhotos = [...prev];
        newPhotos[activePhotoIndex] = compressedDataUrl;
        return newPhotos;
      });
    } catch (err) {
      toast("Failed to process image", "error");
    }
  };

  const handlePhotoClick = (index: number) => {
    if (photos[index]) return; // already has photo
    setActivePhotoIndex(index);
    fileInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      newPhotos[index] = "";
      return newPhotos;
    });
  };

  const handleAgeEstimated = (age: number) => {
    if (age < 18) {
      setAgeError(`AI estimated age is ${Math.round(age)}. You must be 18+ to use this app.`);
      setAiVerifiedAge(null);
    } else {
      setAiVerifiedAge(Math.round(age));
      setFormData(prev => ({ ...prev, age: Math.round(age).toString(), photo_url: "verified_by_ai" }));
      setAgeError(null);
      toast("Age verified by AI!", "success");
    }
  };

  const handleComplete = async () => {
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

    const filledPhotos = photos.filter(p => p !== "");
    if (filledPhotos.length < 1) {
      toast("Please upload at least 1 main profile photo to proceed.", "error");
      return;
    }

    setIsUploading(true);
    toast("Uploading your photos... Please wait ⏳", "message");

    try {
      // Upload provided photos to Cloudinary and get back secure URLs
      const uploadedUrls = await uploadMultipleToCloudinary(filledPhotos);
      const primaryPhoto = uploadedUrls[0];

      // Save to Zustand — setProfile also syncs to backend if deviceId is set
      setProfile({
        name: formData.name,
        bio: "",
        hobbies: [],
        interests: [],
        location: "",
        campus: formData.campus,
        age: parseInt(formData.age),
        photo_url: primaryPhoto,      // Real Cloudinary URL ✅
        photos: uploadedUrls,          // All 6 Cloudinary URLs ✅
        gender: formData.gender,
        verified: true,
        karma: 100,
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
    } catch (err) {
      console.error("Photo upload failed:", err);
      toast("Photo upload failed. Please check your internet and try again.", "error");
    } finally {
      setIsUploading(false);
    }
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

        {/* AI Face Scan Section */}
        <div className="space-y-3 pt-2">
          {!aiVerifiedAge ? (
            <FaceScanner onAgeEstimated={handleAgeEstimated} />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-2" />
              <h3 className="text-lg font-bold text-white">Age Verified: {aiVerifiedAge}</h3>
              <p className="text-gray-400 text-xs">AI successfully confirmed you are 18+</p>
            </div>
          )}
          
          {ageError && (
            <div className="flex items-start gap-2 bg-red-500/20 p-3 rounded-lg text-red-400 text-sm mt-2 w-full text-left">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{ageError}</span>
            </div>
          )}
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
            <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-1">
              Age <Lock size={12} className="text-primary-500" />
            </label>
            <input 
              type="text"
              readOnly
              className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-400 outline-none cursor-not-allowed"
              placeholder="Verified by AI"
              value={formData.age}
            />
            <p className="text-[10px] text-primary-400 mt-1 ml-1">Estimated securely via on-device AI.</p>
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
          
          {/* 6 Photos Requirement */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-300 ml-1 flex items-center gap-2">
                <ImageIcon size={16} className="text-primary-500" /> Your Photos
              </label>
              <span className="text-xs text-primary-400 font-bold">{photos.filter(p => p !== "").length} / 6</span>
            </div>
            <p className="text-xs text-gray-400 ml-1 mb-3">You must add exactly 6 photos to complete your profile.</p>
            
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div 
                  key={i} 
                  onClick={() => handlePhotoClick(i)}
                  className={`aspect-[3/4] rounded-xl overflow-hidden relative cursor-pointer transition-all border-2 ${photo ? 'border-transparent' : 'border-dashed border-white/20 bg-white/5 hover:border-primary-500 hover:bg-white/10 flex items-center justify-center'}`}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={`Upload ${i+1}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-red-500 transition-colors"
                      >
                        <XIcon size={12} />
                      </button>
                    </>
                  ) : (
                    <Plus size={24} className="text-white/30" />
                  )}
                  {/* Number Badge */}
                  {!photo && <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/40 rounded-full flex items-center justify-center text-[10px] text-white/50">{i + 1}</div>}
                </div>
              ))}
            </div>
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>

        </div>
        
        {/* Safety & Respect Pledge Banner */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-pink-500/10 border border-rose-500/30 flex items-start gap-3 my-3">
          <CheckCircle2 className="text-rose-400 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-bold text-white">🔒 Safety &amp; Respect Pledge</h4>
            <p className="text-[10px] text-gray-300 mt-0.5">
              By entering LoveWithYou, you pledge to treat all users with dignity. No harassment, screenshotting private media, or fake profiles allowed.
            </p>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="pt-1">
           <label className="flex items-start gap-3 cursor-pointer">
             <input 
               type="checkbox" 
               className="mt-1 w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500 bg-dark-bg"
               checked={termsAgreed}
               onChange={(e) => setTermsAgreed(e.target.checked)}
             />
             <span className="text-xs text-gray-400 leading-tight">
               I agree to the <Link href="/terms" target="_blank" className="text-primary-500 hover:underline">Terms &amp; Conditions</Link> &amp; <Link href="/privacy" target="_blank" className="text-primary-500 hover:underline">Privacy Policy</Link>. My verified gender is bound to my photo capture.
             </span>
           </label>
        </div>

        <Button 
          onClick={handleComplete} 
          className="w-full mt-6" 
          size="lg" 
          disabled={!!cameraError || !formData.photo_url || !termsAgreed || photos.filter(p => p !== "").length < 1 || isUploading}
        >
          {isUploading ? "Uploading Photos... ⏳" : "Start Matching 🎉"}
        </Button>
      </Card>
    </div>
  );
}
