"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { ShieldCheck, AlertTriangle, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BaseModal } from "@/components/ui/BaseModal";

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

  // Deriving state during render instead of useEffect (React recommended way)
  if (!isAgeUnverified && visible) {
    setVisible(false);
  }

  const showPopup = () => {
    // Double-check store state at the time of firing — agar tab tak verify ho gaya ho
    const currentProfile = useUserStore.getState().profile;
    const stillUnverified = !currentProfile?.age || currentProfile.age === 0;
    if (stillUnverified && currentProfile) {
      setVisible(true);
    }
  };

  useEffect(() => {
    // Agar age verify ho gayi — sirf timers saaf karo
    if (!isAgeUnverified) {
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
    <BaseModal
      isOpen={visible}
      onClose={handleDismiss}
      title="Age Verification Required"
      subtitle="Yeh app sirf 18+ users ke liye hai"
      icon={<ShieldCheck size={28} className="text-white" />}
      headerGradient="from-primary via-purple-500 to-pink-500"
      zIndex={999}
      maxWidth="max-w-md"
    >
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
    </BaseModal>
  );
}
