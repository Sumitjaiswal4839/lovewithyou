"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import {
  ShieldCheck,
  CheckCircle2,
  ScanFace,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BaseModal } from "@/components/ui/BaseModal";
import dynamic from "next/dynamic";

const FaceScanner = dynamic(() => import("./FaceScanner"), { ssr: false });

interface Props {
  onClose: () => void;
}

export function GetVerifiedModal({ onClose }: Props) {
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);

  const [step, setStep] = useState<"intro" | "scanning" | "success">("intro");
  const [detectedAge, setDetectedAge] = useState<number | null>(null);

  const handleAgeEstimated = (age: number) => {
    if (age < 18) {
       // Just show an error or reset
       alert(`Estimated age ${age} is under 18.`);
       setStep("intro");
       return;
    }
    
    setDetectedAge(age);
    if (profile) {
      setProfile({ ...profile, verified: true, age });
    }
    setStep("success");
  };

  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title="Get Blue Tick ✓"
      subtitle="Free AI Face Verification"
      icon={<ScanFace size={20} />}
      headerGradient="from-blue-600 via-blue-500 to-cyan-500"
    >
      {/* ── Body ── */}
        <div className="p-5 space-y-4">

          {/* STEP: Intro */}
          {step === "intro" && (
            <div className="space-y-4 animate-in fade-in">
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
                onClick={() => setStep("scanning")}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 font-black text-white shadow-lg shadow-blue-600/30"
                size="lg"
              >
                Start Verification
              </Button>
            </div>
          )}

          {/* STEP: Camera / Scanning */}
          {step === "scanning" && (
            <div className="animate-in fade-in">
              <FaceScanner onAgeEstimated={handleAgeEstimated} />
              <button
                onClick={() => setStep("intro")}
                className="w-full text-center text-xs text-muted hover:text-foreground transition-colors py-3"
              >
                Cancel
              </button>
            </div>
          )}

          {/* STEP: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center text-center py-4 gap-4 animate-in fade-in">
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

              <div className="flex gap-2">
                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold px-3 py-1 rounded-full">
                  👤 Age ~{detectedAge}
                </span>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 font-black text-white shadow-lg shadow-blue-500/30"
                size="lg"
              >
                🎉 Profile Pe Wapas Jao
              </Button>
            </div>
          )}
        </div>
    </BaseModal>
  );
}
