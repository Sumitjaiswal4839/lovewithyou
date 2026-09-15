"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { ShieldCheck, X, AlertTriangle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Har 10 minute mein popup dobara dikhao (agar age verify nahi hui)
const REMIND_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

export function AgeVerificationBanner() {
  const router = useRouter();
  const profile = useUserStore((s) => s.profile);
  const addLocalNotification = useUserStore((s) => s.addLocalNotification);

  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Age verified hai ya nahi — yeh reactive check hai
  const isAgeUnverified = !profile?.age || profile.age === 0;

  const showPopup = () => {
    // Double-check store state at the time of firing — agar tab tak verify ho gaya ho
    const currentProfile = useUserStore.getState().profile;
    const stillUnverified = !currentProfile?.age || currentProfile.age === 0;
    if (stillUnverified && currentProfile) {
      setVisible(true);
    }
  };

  useEffect(() => {
    // Agar age verify ho gayi — sab kuch saaf karo, popup band karo
    if (!isAgeUnverified) {
      setVisible(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
      return;
    }

    // Profile nahi hai matlab logged out — kuch mat karo
    if (!profile) return;

    // Pehli baar 800ms baad dikhao (hydration flash avoid ke liye)
    initialTimerRef.current = setTimeout(() => {
      showPopup();
    }, 800);

    // Uske baad har 10 min mein dobara dikhao
    intervalRef.current = setInterval(() => {
      showPopup();
    }, REMIND_INTERVAL_MS);

    return () => {
      if (initialTimerRef.current) clearTimeout(initialTimerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAgeUnverified, profile?.name]); // profile?.name as stable identity key

  if (!visible) return null;

  const handleVerifyNow = () => {
    setVisible(false);
    router.push("/setup");
  };

  const handleDismiss = () => {
    setVisible(false);

    // Ek in-app notification push karo bell mein — persistent reminder
    addLocalNotification({
      title: "⚠️ Age Not Verified",
      message:
        "Aapki age verify nahi hui hai. Doosron ke profiles aapse hide hain. Verify karein aur matches unlock karein!",
      type: "age_verification",
    });

    // Popup 10 min baad dobara aayega (interval already chal raha hai)
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] animate-in fade-in duration-300"
        onClick={handleDismiss}
      />

      {/* Modal Card */}
      <div className="fixed bottom-0 left-0 right-0 z-[999] flex justify-center px-4 pb-6 animate-in slide-in-from-bottom-8 duration-400">
        <div className="w-full max-w-md bg-surface rounded-3xl shadow-2xl border border-border overflow-hidden">

          {/* Header Gradient Banner */}
          <div className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-5 flex items-center gap-4 relative">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg leading-tight">
                Age Verification Required
              </h2>
              <p className="text-white/80 text-xs mt-0.5">
                Yeh app sirf 18+ users ke liye hai
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Warning Points */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-start gap-3">
                <EyeOff size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  <span className="font-bold text-amber-200">Profiles hide hain:</span>{" "}
                  Bina verification ke doosron ke profiles aapko nahi dikhenge.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  <span className="font-bold text-amber-200">Matching band hai:</span>{" "}
                  Age verify kiye bina aap kisi se match nahi kar sakte.
                </p>
              </div>
            </div>

            <p className="text-xs text-muted text-center leading-relaxed">
              Verification sirf ek baar hoti hai. Apna age enter karo aur
              turant sab unlock ho jayega. 🔓
            </p>

            {/* Actions */}
            <Button
              onClick={handleVerifyNow}
              className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90 font-bold text-white shadow-lg shadow-primary/30"
              size="lg"
            >
              ✅ Abhi Verify Karein
            </Button>
            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs text-muted hover:text-foreground transition-colors py-1"
            >
              Baad mein karunga
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
