"use client";

import { useState, useRef, useCallback } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";
import {
  ShieldCheck,
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ScanFace,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

// ─── Types ────────────────────────────────────────────────────────────────────
type Step = "intro" | "scanning" | "processing" | "success" | "error";

interface Props {
  onClose: () => void;
}

// ─── ML Service URL ───────────────────────────────────────────────────────────
const ML_URL =
  process.env.NEXT_PUBLIC_ML_SERVICE_URL || "http://localhost:5000";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function captureFrameAsBase64(video: HTMLVideoElement): string {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx?.drawImage(video, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.8);
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GetVerifiedModal({ onClose }: Props) {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [step, setStep] = useState<Step>("intro");
  const [errorMsg, setErrorMsg] = useState("");
  const [detectedAge, setDetectedAge] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<string>("");

  // ── Camera helpers ──────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startCamera = async () => {
    setStep("scanning");
    setErrorMsg("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      stopCamera();
      setErrorMsg(
        "Camera access denied. Please allow camera permission and try again."
      );
      setStep("error");
    }
  };

  // ── Capture + send to ML backend ────────────────────────────────────────────
  const handleCapture = async () => {
    if (!videoRef.current) return;

    setStep("processing");
    const base64Image = captureFrameAsBase64(videoRef.current);
    stopCamera();

    try {
      const res = await fetch(`${ML_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await res.json();

      if (!res.ok || !data.is_human) {
        // No face detected or bad image
        const reason = data.reason ?? "analysis_failed";
        const reasonMap: Record<string, string> = {
          no_face_detected: "Koi face nahi dikha. Acchi roshni mein try karo.",
          image_too_blurry: "Image blur hai. Camera seedha rakh ke try karo.",
          analysis_failed:  "Verification fail hui. Dobara try karo.",
        };
        setErrorMsg(reasonMap[reason] ?? reasonMap["analysis_failed"]);
        setStep("error");
        return;
      }

      const age: number = data.age;
      const conf: string = data.confidence ?? "medium";

      if (age < 18) {
        setErrorMsg(
          `AI ne aapki umar ${age} saal estimate ki hai. Yeh app sirf 18+ users ke liye hai.`
        );
        setStep("error");
        return;
      }

      // ✅ All good — mark verified
      setDetectedAge(age);
      setConfidence(conf);

      if (profile) {
        setProfile({ ...profile, verified: true, age });
      }

      setStep("success");
    } catch (err) {
      console.error("ML service error:", err);
      setErrorMsg(
        "Verification service se connect nahi ho paya. Internet check karo ya baad mein try karo."
      );
      setStep("error");
    }
  };

  const handleRetry = () => {
    setStep("intro");
    setErrorMsg("");
    setDetectedAge(null);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-background border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-300">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <ScanFace size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-black text-sm">Get Blue Tick ✓</h2>
              <p className="text-white/70 text-[10px]">Free AI Face Verification</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* STEP: Intro */}
          {step === "intro" && (
            <div className="space-y-4 animate-in fade-in">
              {/* Benefits list */}
              <div className="space-y-2.5">
                {[
                  { icon: "🛡️", text: "Real identity confirm hogi — fake profiles filter honge" },
                  { icon: "🔵", text: "Blue Tick badge tera profile pe laga rahega" },
                  { icon: "📸", text: "Koi photo upload nahi hoti — sirf on-device scan" },
                  { icon: "⚡", text: "Sirf 2-3 seconds lagenge" },
                ].map((item) => (
                  <div key={item.text} className="flex items-start gap-3">
                    <span className="text-base leading-none mt-0.5">{item.icon}</span>
                    <p className="text-xs text-secondary leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-start gap-2">
                <BadgeCheck size={15} className="text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-300 leading-relaxed">
                  Tera selfie kisi server pe nahi jaata. Sirf ek frame capture hota hai
                  aur turant delete ho jaata hai.
                </p>
              </div>

              <Button
                onClick={startCamera}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 font-black text-white shadow-lg shadow-blue-600/30"
                size="lg"
              >
                <Camera size={16} className="mr-2" />
                Camera Kholo — Verify Karo
              </Button>
            </div>
          )}

          {/* STEP: Camera / Scanning */}
          {step === "scanning" && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-muted text-center">
                Camera seedha apne chehere ke saamne rakho aur{" "}
                <span className="text-blue-400 font-bold">Capture</span> dabao.
              </p>

              {/* Viewfinder */}
              <div className="relative w-full aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-blue-500/40 shadow-lg shadow-blue-500/10">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Corner brackets */}
                <div className="absolute inset-4 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
                </div>
                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="w-full h-0.5 bg-blue-400/60 animate-[scan_2s_linear_infinite]" />
                </div>
              </div>

              <Button
                onClick={handleCapture}
                className="w-full bg-blue-600 hover:bg-blue-700 font-black text-white shadow-lg shadow-blue-600/30"
                size="lg"
              >
                📸 Abhi Capture Karo
              </Button>
              <button
                onClick={handleClose}
                className="w-full text-center text-xs text-muted hover:text-foreground transition-colors py-1"
              >
                Cancel
              </button>
            </div>
          )}

          {/* STEP: Processing */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 animate-in fade-in">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin" />
                <Loader2 size={24} className="absolute inset-0 m-auto text-blue-400 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-foreground">AI Scan Chal Raha Hai...</p>
                <p className="text-xs text-muted mt-1">Face detect kar raha hai • Age estimate ho rahi hai</p>
              </div>
            </div>
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-4 gap-4 animate-in fade-in">
              {/* Animated checkmark */}
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <CheckCircle2 size={36} className="text-white" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-black text-foreground flex items-center justify-center gap-2">
                  Blue Tick Verified!
                  <ShieldCheck size={20} className="text-blue-400 fill-blue-500/20" />
                </h3>
                <p className="text-xs text-muted mt-1">
                  AI ne confirm kiya — Real Human ✅
                </p>
              </div>

              {/* Age & Confidence chips */}
              <div className="flex gap-2">
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold px-3 py-1 rounded-full">
                  👤 Age ~{detectedAge}
                </span>
                <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                  confidence === "high"
                    ? "bg-green-500/10 border-green-500/20 text-green-300"
                    : confidence === "medium"
                    ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-300"
                    : "bg-orange-500/10 border-orange-500/20 text-orange-300"
                }`}>
                  {confidence === "high" ? "🎯 High Confidence"
                   : confidence === "medium" ? "✓ Medium Confidence"
                   : "⚡ Low Confidence"}
                </span>
              </div>

              <Button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-500/30"
                size="lg"
              >
                🎉 Profile Pe Wapas Jao
              </Button>
            </div>
          )}

          {/* STEP: Error */}
          {step === "error" && (
            <div className="flex flex-col items-center text-center py-4 gap-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle size={28} className="text-red-400" />
              </div>

              <div>
                <h3 className="text-sm font-black text-foreground">Verification Fail</h3>
                <p className="text-xs text-muted mt-2 leading-relaxed">{errorMsg}</p>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  onClick={handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-white text-sm"
                >
                  Dobara Try Karo
                </Button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 rounded-xl border border-border text-xs text-muted hover:text-foreground transition-colors font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scanning line keyframe */}
      <style jsx>{`
        @keyframes scan {
          0%   { transform: translateY(0); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
}
