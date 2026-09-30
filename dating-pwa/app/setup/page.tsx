"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Plus, X as XIcon, Image as ImageIcon, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import Link from "next/link";
import { uploadMultipleToCloudinary } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";
import { FEATURE_FLAGS } from "@/config/features";

export default function SetupPage() {
  const router = useRouter();
  const { toast } = useToast();
  // Ensure device fingerprint is generated before profile is saved
  useDeviceAuth();
  const setProfile = useUserStore((state) => state.setProfile);
  const addCoins = useUserStore((state) => state.addCoins);
  const addCoinsLocal = useUserStore((state) => state.addCoinsLocal);

  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    campus: "",
  });

  // Email OTP Verification State
  type SetupStep = "email" | "otp" | "profile";
  const [step, setStep] = useState<SetupStep>(FEATURE_FLAGS.MAINTENANCE_EMAIL_AUTH ? "profile" : "email");
  const [email, setEmail] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    setIsSendingOtp(true);
    try {
      // Use Supabase email OTP (magic link with OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      toast(`📧 OTP sent to ${email}! Check your inbox & spam.`, "success");
      setStep("otp");
      startResendTimer();
    } catch (err) {
      console.error("OTP send error:", err);
      toast("Failed to send OTP. Try again.", "error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpInput.length !== 6) {
      toast("Please enter the 6-digit OTP from your email.", "error");
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpInput,
        type: "email"
      });
      if (error) throw error;
      toast("✅ Email verified successfully!", "success");
      setStep("profile");
    } catch (err) {
      console.error("OTP verify error:", err);
      toast("Invalid or expired OTP. Please try again.", "error");
    } finally {
      setIsVerifyingOtp(false);
    }
  };
  const [termsAgreed, setTermsAgreed] = useState(false);
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

  const handleComplete = async () => {
    if (!formData.name || !formData.gender || !formData.age) {
      toast("Please fill all required fields", "error");
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 100) {
      toast("Please enter a valid age (18–100)", "error");
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
        age: ageNum,
        photo_url: primaryPhoto,      // Real Cloudinary URL ✅
        photos: uploadedUrls,          // All Cloudinary URLs ✅
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

      addCoins(200, "profile_setup");
      toast("Profile Verified! +200 Coins Awarded 💰", "success");
      router.push("/");
    } catch (err) {
      console.error("Photo upload failed:", err);
      toast("Photo upload failed. Please check your internet and try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-background">

      {/* === STEP 1: EMAIL ENTRY === */}
      {step === "email" && (
        <Card className="w-full max-w-md space-y-6 !p-6 border-primary/20">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Mail size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Verify Your Email</h1>
            <p className="text-muted text-xs">
              We&apos;ll send a one-time password to your email. Your email is only used for verification and is never shown to others.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              placeholder="yourname@example.com"
              className="w-full px-4 py-3 bg-surface-elevated border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-[10px] text-muted">
              🔒 Your email is private — it&apos;s only used to send this one-time verification code.
            </p>
          </div>

          <Button
            onClick={handleSendOtp}
            className="w-full"
            disabled={isSendingOtp}
          >
            {isSendingOtp ? "Sending OTP..." : "Send Verification Code →"}
          </Button>
        </Card>
      )}

      {/* === STEP 2: OTP VERIFICATION === */}
      {step === "otp" && (
        <Card className="w-full max-w-md space-y-6 !p-6 border-primary/20">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <ShieldCheck size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Enter OTP</h1>
            <p className="text-muted text-xs">
              A 6-digit code was sent to <span className="text-primary font-bold">{email}</span>. Check your inbox and spam folder.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground block">6-Digit Code</label>
            <input
              type="number"
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value.slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 bg-surface-elevated border border-border rounded-xl text-foreground text-2xl text-center font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <Button
            onClick={handleVerifyOtp}
            className="w-full"
            disabled={isVerifyingOtp}
          >
            {isVerifyingOtp ? "Verifying..." : "✅ Verify & Continue"}
          </Button>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-xs text-muted">Resend OTP in {resendTimer}s</p>
            ) : (
              <button
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="text-xs text-primary font-bold hover:underline"
              >
                {isSendingOtp ? "Sending..." : "Resend OTP"}
              </button>
            )}
            <button
              onClick={() => { setStep("email"); setOtpInput(""); }}
              className="block mx-auto mt-2 text-xs text-muted hover:text-foreground"
            >
              ← Change Email
            </button>
          </div>
        </Card>
      )}

      {/* === STEP 3: PROFILE SETUP (only after email verified) === */}
      {step === "profile" && (
      <Card className="w-full max-w-md space-y-6 !p-6 border-primary/20">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Mandatory Verification</h1>
          <p className="text-muted text-xs">
            We enforce strict identity verification to ensure a safe environment.
          </p>
        </div>

        {/* Local Development Skip Button */}
        {process.env.NODE_ENV === 'development' && (
          <Button
            onClick={() => {
              setProfile({
                name: "Dev User",
                bio: "Local testing",
                hobbies: [],
                interests: [],
                location: "Localhost",
                campus: "Dev Campus",
                age: 22,
                photo_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
                photos: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
                gender: "Male",
                verified: true,
                karma: 500,
                analytics: { views: 0, likes: 0, matches: 0 },
                mode: "Date",
                isAnonymous: false
              });
              addCoinsLocal(500);
              toast("Dev Mode: Setup Skipped!", "success");
              router.push("/");
            }}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold shadow-lg shadow-yellow-500/20"
          >
            🚧 Dev Mode: Skip Setup
          </Button>
        )}

        <div className="space-y-4 pt-4">
          <div>
            <label className="text-sm font-medium text-secondary ml-1">Your Name</label>
            <input
              type="text"
              className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
              placeholder="e.g. Sumit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-secondary ml-1">Your Age</label>
            <input
              type="number"
              min="18"
              max="100"
              className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
              placeholder="e.g. 22"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
            <p className="text-[10px] text-muted mt-1 ml-1">You must be 18+ to use this app.</p>
          </div>

          <div>
            <label className="text-sm font-medium text-secondary ml-1">College/Campus (Optional)</label>
            <input
              type="text"
              className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
              placeholder="e.g. Delhi University"
              value={formData.campus}
              onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-secondary ml-1">Gender</label>
            <div className="flex gap-2 mt-1">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  onClick={(e) => { e.preventDefault(); setFormData({ ...formData, gender: g }); }}
                  className={`flex-1 py-3 rounded-xl border transition-all ${
                    formData.gender === g
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border bg-surface-elevated text-white/60 hover:border-gray-500"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* 6 Photos Requirement */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-secondary ml-1 flex items-center gap-2">
                <ImageIcon size={16} className="text-primary" /> Your Photos
              </label>
              <span className="text-xs text-primary font-bold">{photos.filter(p => p !== "").length} / 6</span>
            </div>
            <p className="text-xs text-muted ml-1 mb-3">Upload at least 1 photo to complete your profile.</p>

            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  onClick={() => handlePhotoClick(i)}
                  className={`aspect-[3/4] rounded-xl overflow-hidden relative cursor-pointer transition-all border-2 ${photo ? 'border-transparent' : 'border-dashed border-white/20 bg-surface-elevated hover:border-primary hover:bg-surface-elevated flex items-center justify-center'}`}
                >
                  {photo ? (
                    <>
                      <img src={photo} alt={`Upload ${i+1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                        className="absolute top-1 right-1 bg-surface-elevated text-foreground rounded-full p-1 hover:bg-error transition-colors"
                      >
                        <XIcon size={12} />
                      </button>
                    </>
                  ) : (
                    <Plus size={24} className="text-foreground/30" />
                  )}
                  {/* Number Badge */}
                  {!photo && <div className="absolute bottom-1 right-1 w-5 h-5 bg-surface-elevated rounded-full flex items-center justify-center text-[10px] text-foreground/50">{i + 1}</div>}
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
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/30 flex items-start gap-3 my-3">
          <CheckCircle2 className="text-primary shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-xs font-bold text-foreground">🔒 Safety &amp; Respect Pledge</h4>
            <p className="text-[10px] text-secondary mt-0.5">
              By entering LoveWithYou, you pledge to treat all users with dignity. No harassment, screenshotting private media, or fake profiles allowed.
            </p>
          </div>
        </div>

        {/* Terms and Conditions Checkbox */}
        <div className="pt-1">
           <label className="flex items-start gap-3 cursor-pointer">
             <input
               type="checkbox"
               className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-background"
               checked={termsAgreed}
               onChange={(e) => setTermsAgreed(e.target.checked)}
             />
             <span className="text-xs text-muted leading-tight">
               I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms &amp; Conditions</Link> &amp; <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>. I confirm I am 18 years or older.
             </span>
           </label>
        </div>

        <Button
          onClick={handleComplete}
          className="w-full mt-6"
          size="lg"
          disabled={!formData.name || !formData.gender || !formData.age || !termsAgreed || photos.filter(p => p !== "").length < 1 || isUploading}
        >
          {isUploading ? "Uploading Photos... ⏳" : "Start Matching 🎉"}
        </Button>
      </Card>
      )}
    </div>
  );
}
