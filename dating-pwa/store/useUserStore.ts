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
  likes: Match[];
  appSettings: {
    lowDataMode: boolean;
    highContrast: boolean;
    language: string;
    currency: string;
    hapticsEnabled: boolean;
  };
  matchPreferences: {
    gender: "Everyone" | "Male" | "Female";
    locationScope: "Anywhere" | "State" | "City";
    selectedState: string | null;
    selectedCity: string | null;
  };
  dailyUnlockDate: string | null;
  liveUserCount: number;
  setDeviceId: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  requestLocation: () => void;
  setLocation: (loc: string) => void;
  addMatch: (match: Match) => void;
  addLike: (match: Match) => void;
  unlockDailyBlur: () => boolean;
  updateSettings: (settings: Partial<UserState['appSettings']>) => void;
  updateMatchPreferences: (prefs: Partial<UserState['matchPreferences']>) => void;
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
      matchPreferences: {
        gender: "Everyone",
        locationScope: "Anywhere",
        selectedState: null,
        selectedCity: null,
      },
      dailyUnlockDate: null,
      liveUserCount: 0,
      matches: [],
      likes: [],
      setDeviceId: async (id: string) => {
        set({ deviceId: id, isAuthenticated: true })
        // Register device with backend
        try {
          await fetch(`${BACKEND_URL}/auth/device`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
              headers: { 'Content-Type': 'application/json' },
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
      addLike: (match) => set((state) => ({ likes: [...state.likes, match] })),
      unlockDailyBlur: () => {
        const state = useUserStore.getState();
        if (state.coins >= 50) {
          state.spendCoins(50);
          set({ dailyUnlockDate: new Date().toISOString().split('T')[0] });
          return true;
        }
        return false;
      },
      updateSettings: (settings) => set((state) => ({ appSettings: { ...state.appSettings, ...settings } })),
      updateMatchPreferences: (prefs) => set((state) => ({ matchPreferences: { ...state.matchPreferences, ...prefs } })),
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
