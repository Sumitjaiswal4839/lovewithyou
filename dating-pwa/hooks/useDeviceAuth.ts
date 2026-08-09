"use client";

import { useEffect } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { useUserStore } from "@/store/useUserStore";
import { v4 as uuidv4 } from "uuid";

export function useDeviceAuth() {
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    async function initAuth() {
      if (isAuthenticated) return;

      try {
        // Initialize an agent at application startup.
        const fp = await fpPromise.load();
        
        // Get the visitor identifier when you need it.
        const result = await fp.get();
        const visitorId = result.visitorId;

        // Sync device authentication with Go backend & Supabase
        const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "https://lovewithyou.onrender.com")?.replace(/\/+$/, "");
        try {
          await fetch(`${BACKEND_URL}/auth/device`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "X-Request-ID": uuidv4()
            },
            body: JSON.stringify({ device_id: visitorId }),
          });
        } catch (authErr) {
          console.warn("Backend auth registration offline fallback:", authErr);
        }

        setDeviceId(visitorId);
        
      } catch (error) {
        console.error("Failed to generate device fingerprint:", error);
      }
    }

    initAuth();
  }, [isAuthenticated, setDeviceId]);

  return { isAuthenticated };
}

