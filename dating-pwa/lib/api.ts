/**
 * lib/api.ts
 * Cross-Platform Sync Architecture
 * Prepares the frontend to sync Zustand state with the Go Backend and Supabase.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const API = {
  /**
   * Syncs the user's local state (coins, profile changes, chat history markers)
   * to the backend to ensure cross-platform (Web & Mobile) consistency.
   */
  async syncState(deviceId: string, payload: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Device-Id": deviceId,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Sync failed");
      return await response.json();
    } catch (error) {
      console.error("[API] Sync Error:", error);
      // Fallback: If offline, Service Worker (NetworkFirst) handles failures.
      throw error;
    }
  },

  /**
   * Retrieves the latest profile data across platforms.
   */
  async fetchProfile(deviceId: string) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: { "X-Device-Id": deviceId },
    });
    return response.json();
  }
};
