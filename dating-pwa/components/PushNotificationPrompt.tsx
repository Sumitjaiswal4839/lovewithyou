"use client";

import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "./ui/Button";

export function PushNotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Only show if notifications are supported and not already granted/denied
    if ("Notification" in window) {
      if (Notification.permission === "default" && !localStorage.getItem("push_prompt_dismissed")) {
        // Delay showing prompt to not overwhelm the user immediately
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAllow = async () => {
    if (!("Notification" in window)) return;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setShowPrompt(false);
        // We would call subscribeToPush() here if the backend was fully wired up.
        console.log("Notification permission granted!");
      } else {
        setShowPrompt(false);
        localStorage.setItem("push_prompt_dismissed", "true");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("push_prompt_dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed top-20 left-4 right-4 bg-primary text-white p-4 rounded-2xl shadow-2xl z-50 flex items-center justify-between gap-4 animate-in slide-in-from-top-10">
      <div className="flex-1">
        <h3 className="font-bold flex items-center gap-2 mb-1">
          <Bell size={16} className="animate-bounce" /> Turn on Notifications
        </h3>
        <p className="text-xs text-foreground/80">Don't miss out! Get alerted immediately when you get a new match or message.</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button onClick={handleAllow} size="sm" className="bg-white text-primary hover:bg-gray-100 whitespace-nowrap">
          Allow
        </Button>
        <button onClick={handleDismiss} className="text-[10px] uppercase font-bold text-foreground/60 hover:text-foreground">
          Not Now
        </button>
      </div>
    </div>
  );
}
