"use client";

import { useEffect } from "react";
import fpPromise from "@fingerprintjs/fingerprintjs";
import { useUserStore } from "@/store/useUserStore";
import { v4 as uuidv4 } from "uuid";

export function useDeviceAuth() {
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const token = useUserStore((state) => state.authToken);
  const deviceId = useUserStore((state) => state.deviceId);

  useEffect(() => {
    async function initAuth() {
      // 1. SMART CHECK: Agar authenticated hai PAR token missing hai (purana bug), toh rukna nahi hai!
      if (isAuthenticated && token) return;

      try {
        let currentId = deviceId;
        if (!currentId) {
          // Initialize an agent at application startup.
          const fp = await fpPromise.load();
          const result = await fp.get();
          currentId = result.visitorId;
        }

        // 3. Sirf store ka ek single function call karo. 
        // KOI duplicate fetch('/auth/device') yahan NAHI karna hai!
        await setDeviceId(currentId);
        
      } catch (error) {
        console.error("Failed to generate device fingerprint:", error);
      }
    }

    initAuth();
  }, [deviceId, isAuthenticated, token, setDeviceId]);

  return { isAuthenticated };
}

