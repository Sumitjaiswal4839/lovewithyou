"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "./ui/Button";

export function A2HSPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt if user hasn't dismissed it before
      if (!localStorage.getItem("a2hs_dismissed")) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("a2hs_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-dark-bg border border-glass-border p-4 rounded-2xl shadow-[0_10px_40px_rgba(236,72,153,0.3)] z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-10">
      <div className="flex-1">
        <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
          Install App <span className="bg-primary-500 text-[10px] px-1.5 py-0.5 rounded-full">RECOMMENDED</span>
        </h3>
        <p className="text-xs text-gray-400">Add to your home screen for a faster, full-screen experience and push notifications.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleInstall} size="sm" className="px-4 bg-white text-black hover:bg-gray-200">
          <Download size={16} className="mr-1" /> Get
        </Button>
        <button onClick={handleDismiss} className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
