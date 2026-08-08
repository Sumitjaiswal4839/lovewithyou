"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export function usePresence() {
  const deviceId = useUserStore((state) => state.deviceId);

  useEffect(() => {
    if (!deviceId) return;

    const updateLastActive = async () => {
      try {
        await supabase
          .from("profiles")
          .update({ last_active: new Date().toISOString() })
          .eq("device_id", deviceId);
      } catch (err) {
        console.warn("Failed to update presence last_active:", err);
      }
    };

    // Immediate presence ping on app launch / route change
    updateLastActive();

    // Heartbeat pulse every 5 minutes
    const interval = setInterval(updateLastActive, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [deviceId]);
}
