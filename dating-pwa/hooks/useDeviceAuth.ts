"use client";

import { useEffect } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { useUserStore } from "@/store/useUserStore";

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

        // Optionally, you can hit your Go backend here:
        // await fetch("http://localhost:8080/auth/device", {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ device_id: visitorId })
        // });

        setDeviceId(visitorId);
        
      } catch (error) {
        console.error("Failed to generate device fingerprint:", error);
      }
    }

    initAuth();
  }, [isAuthenticated, setDeviceId]);

  return { isAuthenticated };
}
