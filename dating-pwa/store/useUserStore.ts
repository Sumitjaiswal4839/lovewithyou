import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  bio: string;
  hobbies: string[];
  interests: string[];
  location: string;
  campus?: string;
  age: number | null;
  photo_url: string;
  voice_prompt_url?: string;
  gender: string;
  zodiacSign?: string;
  verified: boolean;
  karma: number;
  analytics: {
    views: number;
    likes: number;
    matches: number;
  };
  mode: "Date" | "BFF" | "Bizz";
  isAnonymous: boolean;
  orientation?: string;
  faith?: string;
  prismaPersonality?: string;
  spotifyArtists?: string[];
  prompts?: { question: string; answer: string }[];
}

export interface Match {
  id: string;
  name: string;
  img: string;
  karma: number;
  campus?: string;
  zodiacSign?: string;
  hobbies: string[];
  lastActive: Date;
  chemistryScore: number;
  crossedPathsCount: number;
  isAnonymous?: boolean;
  mode: "Date" | "BFF" | "Bizz";
  isMutual?: boolean;
  matchTimestamp?: number;
}

interface UserState {
  deviceId: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  coins: number;
  locationEnabled: boolean;
  matches: Match[];
  appSettings: {
    lowDataMode: boolean;
    highContrast: boolean;
    language: string;
    currency: string;
    hapticsEnabled: boolean;
  };
  liveUserCount: number;
  setDeviceId: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  requestLocation: () => void;
  setLocation: (loc: string) => void;
  addMatch: (match: Match) => void;
  updateSettings: (settings: Partial<UserState['appSettings']>) => void;
  initLocalization: () => void;
  syncProfile: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
  setLiveUserCount: (count: number) => void;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      deviceId: null,
      isAuthenticated: false,
      profile: null,
      coins: 100,
      locationEnabled: false,
      appSettings: {
        lowDataMode: false,
        highContrast: false,
        language: "en",
        currency: "INR",
        hapticsEnabled: true,
      },
      liveUserCount: 0,
      matches: [
        { id: "1", name: "Priya", karma: 130, campus: "Delhi University", zodiacSign: "Leo ♌", hobbies: ["Reading", "Coffee", "Travel"], img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80", lastActive: new Date(), chemistryScore: 92, crossedPathsCount: 3, mode: "Date", isMutual: true, matchTimestamp: Date.now() - 1000 * 60 * 60 * 12 },
        { id: "2", name: "Ananya", karma: 160, campus: "Amity", zodiacSign: "Scorpio ♏", hobbies: ["Coding", "Gaming", "Anime"], img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", lastActive: new Date(), chemistryScore: 85, crossedPathsCount: 0, mode: "Date", isAnonymous: true, isMutual: false, matchTimestamp: Date.now() }
      ],
      setDeviceId: async (id: string) => {
        set({ deviceId: id, isAuthenticated: true })
        // Register device with backend
        try {
          await fetch(`${BACKEND_URL}/auth/device`, {
            method: 'POST',
            body: JSON.stringify({ device_id: id }),
          })
        } catch (e) {
          console.error("Backend auth failed", e)
        }
      },
      setProfile: async (profile) => {
        set({ profile })
        // Sync to backend
        try {
          const state = useUserStore.getState()
          if (state.deviceId) {
            await fetch(`${BACKEND_URL}/profile`, {
              method: 'POST',
              body: JSON.stringify({ ...profile, device_id: state.deviceId }),
            })
          }
        } catch (e) {
          console.error("Failed to sync profile", e)
        }
      },
      syncProfile: async () => {
        const state = useUserStore.getState()
        if (state.deviceId) {
          try {
            const res = await fetch(`${BACKEND_URL}/profile/${state.deviceId}`)
            if (res.ok) {
              const data = await res.json()
              set({ profile: data })
            }
          } catch (e) {
            console.error("Failed to fetch profile", e)
          }
        }
      },
      subscribeToPush: async () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
          try {
            const registration = await navigator.serviceWorker.ready;
            const state = useUserStore.getState();
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            
            if (!vapidKey || !state.deviceId) return;

            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            await fetch(`${BACKEND_URL}/webpush/subscribe`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ device_id: state.deviceId, subscription: subscription })
            });
            console.log("Push notifications active!");
          } catch (e) {
            console.error("Push registration failed", e);
          }
        }
      },
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      spendCoins: (amount) => set((state) => ({ coins: Math.max(0, state.coins - amount) })),
      requestLocation: () => set({ locationEnabled: true }),
      setLocation: (loc: string) => set((state) => ({ profile: state.profile ? { ...state.profile, location: loc } : null })),
      setLiveUserCount: (count) => set({ liveUserCount: count }),
      addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
      updateSettings: (settings) => set((state) => ({ appSettings: { ...state.appSettings, ...settings } })),
      initLocalization: () => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (tz === "Asia/Calcutta" || tz === "Asia/Kolkata") {
            set((state) => ({ appSettings: { ...state.appSettings, currency: "₹", language: "hi" } }));
          } else {
            set((state) => ({ appSettings: { ...state.appSettings, currency: "$", language: "en" } }));
          }
        } catch (e) {
          console.error("Localization detection failed", e);
        }
      },
    }),
    {
      name: "dating-storage",
    }
  )
);
