import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";

export interface UserProfile {
  name: string;
  bio: string;
  hobbies: string[];
  interests: string[];
  location: string;
  campus?: string;
  age: number | null;
  photo_url: string;
  photos?: string[];
  video_url?: string;
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
  intent?: string;
  orientation?: string;
  faith?: string;
  prismaPersonality?: string;
  spotifyArtists?: string[];
  prompts?: { question: string; answer: string }[];
  isStudent?: boolean;
  studentIdUrl?: string;
  studentVerificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  latitude?: number;
  longitude?: number;
  match_preferences?: {
    gender?: string;
    selectedState?: string | null;
    selectedCity?: string | null;
  };
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

export interface FriendRequest {
  id: string;
  name: string;
  img: string;
  status: "incoming" | "outgoing";
  timestamp: number;
}

export interface Friend {
  id: string;
  name: string;
  img: string;
  addedAt: number;
}

export interface CoinTransaction {
  id: string;
  device_id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  related_entity_id?: string;
  created_at: string;
}

interface UserState {
  deviceId: string | null;
  authToken: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
  coins: number;
  coinHistory: CoinTransaction[];
  cashbackVault: number;
  adFreeEnabled: boolean;
  locationEnabled: boolean;
  matches: Match[];
  likes: Match[];
  friendRequests: FriendRequest[];
  friends: Friend[];
  notifications: AppNotification[];
  unreadNotificationCount: number;
  appSettings: {
    lowDataMode: boolean;
    highContrast: boolean;
    language: string;
    currency: string;
    hapticsEnabled: boolean;
    pushNotifications: boolean;
    incognitoMode: boolean;
    showActiveStatus: boolean;
    screenshotShield: boolean;
    distanceUnit: "km" | "mi";
    accentColor: "pink" | "purple" | "emerald" | "gold";
    fontSize: number;
    photoPickerType: string;
    allowFriendSearch: boolean;
    allowAutoFriendAccept: boolean;
    automaticTranslation: boolean;
    encryptedChat: boolean;
  };
  matchPreferences: {
    gender: "Everyone" | "Male" | "Female";
    locationScope: "Anywhere" | "State" | "City";
    selectedState: string | null;
    selectedCity: string | null;
    verifiedOnly: boolean;
    studentsOnly: boolean;
    zodiacMatchOnly: boolean;
  };
  dailyUnlockDate: string | null;
  liveUserCount: number;
  dailySearchCount: number;
  lastSearchDate: string | null;
  setDeviceId: (id: string) => void;
  setProfile: (profile: UserProfile) => void;
  addCoins: (amount: number, reason: string) => Promise<void>;
  addCoinsLocal: (amount: number) => void;
  spendCoins: (amount: number, description?: string) => Promise<void>;
  loadCoinHistory: () => Promise<void>;
  claimCashback: () => number;
  toggleAdFree: () => void;
  requestLocation: () => void;
  setLocation: (loc: string) => void;
  addMatch: (match: Match) => void;
  addLike: (match: Match) => void;
  sendFriendRequest: (userId: string, name: string, img: string) => void;
  receiveFriendRequest: (userId: string, name: string, img: string) => void;
  acceptFriendRequest: (userId: string) => void;
  declineFriendRequest: (userId: string) => void;
  unlockDailyBlur: () => boolean;
  canSearch: () => boolean;
  incrementSearchCount: () => void;
  updateSettings: (settings: Partial<UserState['appSettings']>) => Promise<void>;
  updateMatchPreferences: (prefs: Partial<UserState['matchPreferences']>) => void;
  initLocalization: () => void;
  syncProfile: () => Promise<void>;
  subscribeToPush: () => Promise<void>;
  setLiveUserCount: (count: number) => void;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  logout: () => void;
}

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");

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
    (set, get) => ({
      deviceId: null,
      authToken: null,
      isAuthenticated: false,
      profile: null,
      coins: 100,
      cashbackVault: 15,
      adFreeEnabled: false,
      locationEnabled: false,
      appSettings: {
        lowDataMode: false,
        highContrast: false,
        language: "System defaults",
        currency: "INR",
        hapticsEnabled: true,
        pushNotifications: true,
        incognitoMode: false,
        showActiveStatus: true,
        screenshotShield: true,
        distanceUnit: "km",
        accentColor: "pink",
        fontSize: 10,
        photoPickerType: "Classic Photo Picker",
        allowFriendSearch: true,
        allowAutoFriendAccept: false,
        automaticTranslation: true,
        encryptedChat: false,
      },
      matchPreferences: {
        gender: "Everyone",
        locationScope: "Anywhere",
        selectedState: null,
        selectedCity: null,
        verifiedOnly: false,
        studentsOnly: false,
        zodiacMatchOnly: false,
      },
      dailyUnlockDate: null,
      dailySearchCount: 0,
      lastSearchDate: null,
      liveUserCount: 0,
      matches: [],
      likes: [],
      friendRequests: [],
      friends: [],
      notifications: [],
      unreadNotificationCount: 0,
      logout: () => {
        localStorage.removeItem("dating-storage");
        set({
          deviceId: null,
          authToken: null,
          isAuthenticated: false,
          profile: null,
          coins: 100,
          matches: [],
          likes: [],
          friendRequests: [],
          friends: [],
          coinHistory: [],
          notifications: [],
          unreadNotificationCount: 0,
        });
      },
      setDeviceId: async (id: string) => {
        set({ deviceId: id })
        try {
          const res = await fetch(`${BACKEND_URL}/auth/device`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'X-Request-ID': uuidv4()
            },
            body: JSON.stringify({ device_id: id }),
          })
          if (!res.ok) {
            throw new Error('Backend se token nahi mila (Cold start ya Network fail)');
          }
          const data = await res.json();
          if (data.app_settings) {
            set({ appSettings: { ...get().appSettings, ...data.app_settings } });
          }
          set({ authToken: data.token, isAuthenticated: true });
        } catch (e) {
          console.error("Backend auth failed", e)
          set({ isAuthenticated: false, authToken: null });
        }
      },
      setProfile: async (profile) => {
        set({ profile })
        try {
          const state = useUserStore.getState()
          if (state.deviceId) {
            await fetch(`${BACKEND_URL}/profile`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.authToken}`,
                'X-Request-ID': uuidv4()
              },
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
            const res = await fetch(`${BACKEND_URL}/profile/${state.deviceId}`, {
              headers: { 'Authorization': `Bearer ${state.authToken}` }
            })
            if (res.ok) {
              const data = await res.json()
              set({ profile: data })
              if (data.match_preferences) {
                set((state) => ({ 
                  matchPreferences: { ...state.matchPreferences, ...data.match_preferences } 
                }))
              }
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
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.authToken}`,
                'X-Request-ID': uuidv4()
              },
              body: JSON.stringify({ device_id: state.deviceId, subscription: subscription })
            });
            console.log("Push notifications active!");
          } catch (e) {
            console.error("Push registration failed", e);
          }
        }
      },
      coinHistory: [],
      loadCoinHistory: async () => {
        const state = get();
        if (!state.deviceId) return;
        try {
          const res = await fetch(`${BACKEND_URL}/api/v1/coins/history/${state.deviceId}`, {
            headers: { 'Authorization': `Bearer ${state.authToken}` }
          });
          if (res.ok) {
            const history = await res.json();
            set({ coinHistory: history || [] });
          }
        } catch (e) {
          console.error("Error fetching coin history:", e);
        }
      },
      addCoins: async (amount, reason) => {
        const state = get();
        const previousCoins = state.coins;
        const previousCashback = state.cashbackVault;
        
        // Ensure student logic is applied properly
        const isVerifiedStudent = state.profile?.isStudent || state.profile?.studentVerificationStatus === 'verified';
        const finalAmount = isVerifiedStudent ? amount * 2 : amount;
        const cashbackEarned = Math.max(1, Math.floor(finalAmount * 0.1));

        // 1. Optimistic Update (Turant UI update karo taaki lag na ho)
        set({ 
          coins: previousCoins + finalAmount,
          cashbackVault: previousCashback + cashbackEarned
        });

        try {
          const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");
          const response = await fetch(`${BACKEND_URL}/coins/earn`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.authToken}`,
              'X-Request-ID': crypto.randomUUID() 
            },
            // 🔴 AMOUNT NAHI BHEJNA HAI, SIRF REASON BHEJNA HAI 🔴
            body: JSON.stringify({ reason: reason }), 
          });

          if (!response.ok) {
            throw new Error('Server rejected the coin request');
          }
          state.loadCoinHistory();
        } catch (error) {
          // 2. Rollback: Agar API fail hui, toh fake balance wapas purana wala set kar do
          console.error("Coin update failed, rolling back:", error);
          set({ coins: previousCoins, cashbackVault: previousCashback });
        }
      },
      addCoinsLocal: (amount) => {
        set((state) => ({ coins: state.coins + amount }));
      },
      spendCoins: async (amount, description = "Spent Coins") => {
        const state = useUserStore.getState();
        const isVerifiedStudent = state.profile?.isStudent || state.profile?.studentVerificationStatus === 'verified';
        const finalAmount = isVerifiedStudent ? Math.floor(amount / 2) : amount;
        // 10% Cashback refund on coin spending
        const cashbackRefund = Math.max(1, Math.floor(finalAmount * 0.1));

        const prevCoins = state.coins;
        const prevCashback = state.cashbackVault;

        set({ 
          coins: Math.max(0, state.coins - finalAmount),
          cashbackVault: state.cashbackVault + cashbackRefund
        });

        try {
          if (state.deviceId) {
            const res = await fetch(`${BACKEND_URL}/coins/spend`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.authToken}`,
                'X-Request-ID': uuidv4()
              },
              body: JSON.stringify({ device_id: state.deviceId, amount: finalAmount, description }),
            });
            if (!res.ok) throw new Error('Server update failed');
            state.loadCoinHistory();
          }
        } catch (e) {
          console.error("Failed to spend coins on backend", e);
          set({ coins: prevCoins, cashbackVault: prevCashback });
        }
      },
      claimCashback: () => {
        const state = get();
        const claimed = state.cashbackVault;
        if (claimed > 0) {
          set({
            coins: state.coins + claimed,
            cashbackVault: 0
          });
        }
        return claimed;
      },
      toggleAdFree: () => set((state) => ({ adFreeEnabled: !state.adFreeEnabled })),
      requestLocation: async () => {
        set({ locationEnabled: true });
        if (typeof navigator !== "undefined" && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;
              const state = useUserStore.getState();
              if (state.profile) {
                const updated = { ...state.profile, latitude: lat, longitude: lng };
                set({ profile: updated });
              }
              if (state.deviceId) {
                await supabase
                  .from("profiles")
                  .update({ latitude: lat, longitude: lng })
                  .eq("device_id", state.deviceId);
              }
            },
            (err) => console.warn("GPS Geolocation error:", err),
            { enableHighAccuracy: true }
          );
        }
      },
      setLocation: (loc: string) => set((state) => ({ profile: state.profile ? { ...state.profile, location: loc } : null })),
      setLiveUserCount: (count) => set({ liveUserCount: count }),
      fetchNotifications: async () => {
        try {
          const state = get();
          if (!state.isAuthenticated) return;
          const res = await fetch(`${BACKEND_URL}/notifications`, {
            headers: { 'Authorization': `Bearer ${state.authToken}` }
          });
          if (res.ok) {
            const notifications = await res.json() || [];
            const unreadCount = notifications.filter((n: AppNotification) => !n.is_read).length;
            set({ notifications, unreadNotificationCount: unreadCount });
          }
        } catch (e) {
          console.error("Failed to fetch notifications", e);
        }
      },
      markNotificationRead: async (id: string) => {
        try {
          const state = get();
          await fetch(`${BACKEND_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${state.authToken}` }
          });
          const newNotifs = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
          const unreadCount = newNotifs.filter(n => !n.is_read).length;
          set({ notifications: newNotifs, unreadNotificationCount: unreadCount });
        } catch (e) {
          console.error("Failed to mark notification read", e);
        }
      },
      markAllNotificationsRead: async () => {
        try {
          const state = get();
          await fetch(`${BACKEND_URL}/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${state.authToken}` }
          });
          const newNotifs = state.notifications.map(n => ({ ...n, is_read: true }));
          set({ notifications: newNotifs, unreadNotificationCount: 0 });
        } catch (e) {
          console.error("Failed to mark all notifications read", e);
        }
      },
      addMatch: (match) => set((state) => ({ matches: [...state.matches, match] })),
      addLike: (match) => set((state) => ({ likes: [...state.likes, match] })),
      
      sendFriendRequest: (userId, name, img) => set((state) => {
        if (state.friendRequests.some(r => r.id === userId) || state.friends.some(f => f.id === userId)) {
          return state;
        }
        return {
          friendRequests: [
            ...state.friendRequests, 
            { id: userId, name, img, status: "outgoing", timestamp: Date.now() }
          ]
        };
      }),

      receiveFriendRequest: (userId, name, img) => set((state) => {
         if (state.friendRequests.some(r => r.id === userId) || state.friends.some(f => f.id === userId)) {
          return state;
        }
        return {
          friendRequests: [
            { id: userId, name, img, status: "incoming", timestamp: Date.now() },
            ...state.friendRequests
          ]
        };
      }),

      acceptFriendRequest: (userId) => set((state) => {
        const request = state.friendRequests.find(r => r.id === userId);
        if (!request) return state;

        return {
          friendRequests: state.friendRequests.filter(r => r.id !== userId),
          friends: [
            ...state.friends,
            { id: userId, name: request.name, img: request.img, addedAt: Date.now() }
          ]
        };
      }),

      declineFriendRequest: (userId) => set((state) => ({
        friendRequests: state.friendRequests.filter(r => r.id !== userId)
      })),

      unlockDailyBlur: () => {
        const state = get();
        if (state.coins >= 50) {
          state.spendCoins(50);
          set({ dailyUnlockDate: new Date().toISOString().split('T')[0] });
          return true;
        }
        return false;
      },
      canSearch: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        if (state.lastSearchDate !== today) {
           set({ dailySearchCount: 0, lastSearchDate: today });
           return true;
        }
        if (state.dailySearchCount >= 5) {
           return state.coins >= 1;
        }
        return true;
      },
      incrementSearchCount: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const newCount = state.lastSearchDate !== today ? 1 : state.dailySearchCount + 1;
        if (newCount > 5) {
           state.spendCoins(1);
        }
        set({ dailySearchCount: newCount, lastSearchDate: today });
      },
      updateSettings: async (settings) => {
        const newState = { ...get().appSettings, ...settings };
        set({ appSettings: newState });
        
        // Sync to backend
        const state = get();
        if (state.profile && state.isAuthenticated) {
          const updatedProfile = { ...state.profile, app_settings: newState };
          set({ profile: updatedProfile });
          try {
            await fetch(`${BACKEND_URL}/profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.authToken}`,
              },
              body: JSON.stringify(updatedProfile),
            });
          } catch (e) {
            console.error("Failed to sync settings:", e);
          }
        }
      },
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

