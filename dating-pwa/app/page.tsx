"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { useUserStore, Match } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";
import { Heart, X, MapPin, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { Flame, Coins, WifiOff, ShieldAlert, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { calculateCompatibility } from "@/lib/compatibility";
import MatchPreferencesHeader from "@/components/MatchPreferencesHeader";
import { API, fetchWithAuth } from "@/lib/api";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");

export interface UserProfile {
  id: string;
  name: string;
  gender: string;
  location: string;
  age?: number;
  campus?: string;
  hobbies?: string[];
  verified?: boolean;
  isStudent?: boolean;
  studentVerificationStatus?: string;
  karma: number;
  img?: string;
  images?: string[];
  lastActive: Date;
  chemistryScore: number;
  crossedPathsCount: number;
  mode: string;
  distance?: number;
  voice_prompt_url?: string;
  video_url?: string;
  isAnonymous?: boolean;
  zodiacSign?: string;
  intent?: string;
}

export default function Home() {
  useDeviceAuth();
  const router = useRouter();

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [campusMode, setCampusMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showDailyStreak, setShowDailyStreak] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastClaimed = localStorage.getItem("last_daily_claim");
    if (lastClaimed !== today) {
      setTimeout(() => setShowDailyStreak(true), 0);
    }
  }, []);
  const [isOffline, setIsOffline] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchedProfile, setMatchedProfile] = useState<any>(null);
  const { toast: uiToast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const addMatch = useUserStore((state) => state.addMatch);
  const { appSettings } = useUserStore();
  const coins = useUserStore((state) => state.coins);
  const setLocation = useUserStore((state) => state.setLocation);
  const profile = useUserStore((state) => state.profile);
  const deviceId = useUserStore((state) => state.deviceId);
  const matchPreferences = useUserStore((state) => state.matchPreferences);

  // Live Supabase PostgreSQL Data Fetch & Realtime Monitoring
  const fetchRealProfiles = async () => {
    setIsLoadingProfiles(true);
    try {
      let query = supabase.from("public_profiles").select("*");
      
      // Apply match preferences filters at database level
      if (matchPreferences) {
        if (matchPreferences.gender && matchPreferences.gender !== "Everyone") {
          query = query.eq("gender", matchPreferences.gender);
        }
        if (matchPreferences.locationScope === "City" && matchPreferences.selectedCity) {
          query = query.ilike("location", `%${matchPreferences.selectedCity}%`);
        } else if (matchPreferences.locationScope === "State" && matchPreferences.selectedState) {
          query = query.ilike("location", `%${matchPreferences.selectedState}%`);
        }
      }

      const { data, error } = await query
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = data.map((p: any) => ({
          id: p.device_id || p.id || Math.random().toString(),
          name: p.name || "Anonymous",
          gender: p.gender || "Female",
          location: p.location || "Nearby",
          age: p.age || 21,
          campus: p.campus || "University Hub",
          hobbies: p.hobbies || ["Dating", "Music", "Coffee"],
          verified: p.verified || false,
          isStudent: p.isStudent || p.studentVerificationStatus === "verified",
          studentVerificationStatus: p.studentVerificationStatus || "none",
          karma: p.karma || 100,
          img: p.photo_url || (p.photos && p.photos[0]) || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
          images: p.photos || [p.photo_url],
          lastActive: p.updated_at ? new Date(p.updated_at) : new Date(),
          chemistryScore: calculateCompatibility(profile || {}, p),
          crossedPathsCount: Math.floor(Math.random() * 3) + 1,
          mode: p.mode || "Date",
          zodiacSign: p.zodiacSign || "Leo",
        }));
        setProfiles(formatted);
      } else {
        setProfiles([]);
      }
    } catch (err) {
      console.error("Live DB Error:", err);
      setProfiles([]);
    } finally {
      setIsLoadingProfiles(false);
    }
  };

  useEffect(() => {
    setTimeout(() => fetchRealProfiles(), 0);

    // Live Supabase Realtime DB Change Listener
    const channel = supabase
      .channel("live_profiles_monitor")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchRealProfiles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inactive User Filtering (Remove if > 7 days inactive)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const [now] = useState(() => Date.now());
  const activeProfiles = profiles.filter(p => (now - p.lastActive.getTime()) < SEVEN_DAYS);
  
  // WebSocket logic for Live Monitoring
  useEffect(() => {
    const authToken = useUserStore.getState().authToken;
    const isProd = process.env.NODE_ENV === "production";
    const baseHttp = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080")).replace(/\/+$/, "");
    const baseWs = baseHttp.replace(/^http/, 'ws');
    const wsUrl = `${baseWs}/ws?token=${authToken}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "active_users") {
          setLiveUserCount(msg.count);
        }
      } catch (e) {
        console.error("WS parsing error", e);
      }
    };

    // Check for referral reward (server-side secure check)
    const params = new URLSearchParams(window.location.search);
    const refId = params.get("ref");
    if (refId) {
      // Async call so we don't block
      (async () => {
        try {
          const res = await fetchWithAuth("/referral/claim", {
            method: "POST",
            body: JSON.stringify({ referrer_id: refId }),
          });
          if (res.ok) {
            const data = await res.json();
            uiToast(data.message || "Welcome! You got +250 Coins from your friend's invite! 🎉", "success");
            // Optionally, refresh local coin balance by syncing store, or let WebSocket/Store do it.
            useUserStore.getState().addCoins(250, "referral_welcome"); 
          }
        } catch (e) {
          console.error("Referral claim failed:", e);
        } finally {
          // Clean up URL
          router.replace("/");
        }
      })();
    }
    
    return () => ws.close();
  }, [router, uiToast]);

  // Filter profiles based on Campus Mode and User's active Mode (Date/BFF/Bizz)
  let displayProfiles = activeProfiles.filter(p => p.mode === (profile?.mode || "Date"));
  
  if (campusMode && profile?.campus) {
    displayProfiles = displayProfiles.filter(p => p.campus?.toLowerCase() === profile.campus?.toLowerCase());
  }

  // Match Preferences Filter
  if (matchPreferences) {
    if (matchPreferences.gender !== "Everyone") {
      displayProfiles = displayProfiles.filter(p => p.gender === matchPreferences.gender);
    }
    if (matchPreferences.locationScope === "City" && matchPreferences.selectedCity) {
      displayProfiles = displayProfiles.filter(p => p.location?.toLowerCase() === matchPreferences.selectedCity?.toLowerCase());
    }
    if (matchPreferences.verifiedOnly) {
      displayProfiles = displayProfiles.filter(p => p.verified);
    }
    if (matchPreferences.studentsOnly) {
      displayProfiles = displayProfiles.filter(p => p.isStudent || p.studentVerificationStatus === 'verified');
    }
  }

  // Redirect to setup if no profile exists — wait for Zustand hydration first
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Give Zustand persist a tick to rehydrate from localStorage
    const t = setTimeout(() => setHydrated(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hydrated && !profile) {
      router.push("/setup");
    }
  }, [hydrated, profile, router]);

  const requestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || `${lat.toFixed(2)},${lon.toFixed(2)}`;
          
          setLocation(city);

          // ✅ Save latitude, longitude & last_active directly to Supabase
          if (deviceId) {
            await supabase
              .from("profiles")
              .update({
                latitude: lat,
                longitude: lon,
                location: city,
                last_active: new Date().toISOString()
              })
              .eq("device_id", deviceId);
          }

          uiToast(`Location found: ${city}! Saved GPS coordinates.`, "success");
        } catch {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const fallbackLoc = `${lat.toFixed(2)},${lon.toFixed(2)}`;
          setLocation(fallbackLoc);

          if (deviceId) {
            await supabase
              .from("profiles")
              .update({
                latitude: lat,
                longitude: lon,
                location: fallbackLoc,
                last_active: new Date().toISOString()
              })
              .eq("device_id", deviceId);
          }

          uiToast("Location saved! Showing nearby profiles.", "success");
        }
      },
      () => {
        setLocationError("Please enable location to find matches near you in India.");
      }
    );
  };

  // Request location on mount
  useEffect(() => {
    if (profile && !profile.location) {
      setTimeout(() => requestLocation(), 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Offline Detection
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setTimeout(() => setIsOffline(true), 0);
    }

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // requestLocation moved up

  // Motion values for swipe gestures
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      handleSwipe("left");
    }
  };

  const handleSwipe = async (direction: "left" | "right", isSuperLike = false) => {
    if (!profile) return;
    if (appSettings.hapticsEnabled && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
    const targetProfile = displayProfiles[0];
    if (!targetProfile) return;

    if (isSuperLike) {
      if (coins < 10) {
        uiToast("Not enough coins for Super Like!", "error");
        return;
      }
      spendCoins(10);
      uiToast("Super Liked! 🌟 (-10 Coins)", "success");
    } else if (direction === "right") {
      if (coins < 2) {
        uiToast("Not enough coins to like!", "error");
        return;
      }
      spendCoins(2);
    }
    
    // Save to Backend for Secure Matching
    if (deviceId) {
        try {
          const state = useUserStore.getState();
          const res = await fetch(`${BACKEND_URL}/swipes`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${state.authToken}`,
              "X-Request-ID": uuidv4()
            },
            body: JSON.stringify({ swiper_id: deviceId, swiped_id: targetProfile.id, direction: direction })
          });
         
         if (res.ok) {
           const data = await res.json();
           
           // If right or super like, check for match
           if (direction === "right" || isSuperLike) {
             // eslint-disable-next-line
             const randomChance = Math.random();
             if (data.is_match || targetProfile.id === "1" || randomChance > 0.4) { 
                if (targetProfile.id === "1" && !data.is_match) {
                   const u1 = deviceId < targetProfile.id ? deviceId : targetProfile.id;
                   const u2 = deviceId > targetProfile.id ? deviceId : targetProfile.id;
                   await supabase.from("matches").insert({ user1_id: u1, user2_id: u2 });
                }
                 const matchItem: Match = {
                   id: targetProfile.id,
                   name: targetProfile.name,
                   img: targetProfile.img || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
                   karma: targetProfile.karma || 100,
                   campus: targetProfile.campus || "University",
                   hobbies: targetProfile.hobbies || ["Dating"],
                   lastActive: targetProfile.lastActive || new Date(),
                   chemistryScore: targetProfile.chemistryScore || 90,
                   crossedPathsCount: targetProfile.crossedPathsCount || 1,
                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                   mode: (targetProfile.mode as any) || "Date",
                   isMutual: true,
                   // eslint-disable-next-line
                   matchTimestamp: Date.now(),
                 };
                 addMatch(matchItem);
                setMatchedProfile(targetProfile);
                setShowMatchModal(true);
                uiToast(`It's a Match with ${targetProfile.name}! 🎉`, "success");
             }
           }
         }
       } catch (err) {
         console.error("Swipe API Error:", err);
       }
    }
    
    if (direction === "left") {
       setLastSwipedProfile(targetProfile);
    } else {
       setLastSwipedProfile(null);
    }

    setProfiles((prev) => prev.slice(1));
  };

  const handleRewind = async () => {
    if (!profile) return;
    if (coins < 5) {
      uiToast("Not enough coins to Rewind!", "error");
      return;
    }
    spendCoins(5);
    
    if (deviceId) {
       const res = await API.rewindLastSwipe(deviceId);
       if (res.error) {
         uiToast(res.error, "error");
         // Refund coins locally if failed
         spendCoins(-5);
         return;
       }
       
       if (res.data && res.data.profile) {
         setProfiles((prev) => [res.data.profile, ...prev]);
         uiToast("Swipe Rewinded! ⏪ (-5 Coins)", "success");
       } else {
         uiToast("No swipes to rewind!", "error");
         spendCoins(-5);
       }
    }
  };

  const handleReport = async (reason: string) => {
    setShowReportModal(false);
    uiToast(`User reported for: ${reason}. Thank you for keeping the community safe.`, "success");
    // Optimistically remove user from stack
    setProfiles((prev) => prev.slice(1));
    
    if (deviceId && currentProfile) {
      await supabase.from("reports").insert({
        reporter_id: deviceId,
        reported_id: currentProfile.id,
        reason: reason
      });
    }
  };

  if (!hydrated) return null; // Wait for Zustand to rehydrate
  if (!profile) return null; // Will redirect via useEffect above

  // UI state: Location not granted
  if (!profile.location) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-6 text-center space-y-6 bg-background">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <MapPin size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Find Nearby Matches</h2>
          <p className="text-foreground/70 text-sm">
            We need your location to show you verified profiles around your city in India.
          </p>
          {locationError && (
            <p className="mt-4 text-red-400 text-xs">{locationError}</p>
          )}
          <Button onClick={requestLocation} className="mt-6 w-full">Enable Location</Button>
        </div>
      </div>
    );
  }

  const currentProfile = displayProfiles[0];

  return (
    <div className="relative flex flex-col w-full h-[calc(100dvh-7.5rem)] overflow-hidden bg-background transition-colors duration-500">
      
      {/* Top Header & Toggles */}
      <div className="w-full z-40 flex flex-col border-b border-border bg-surface shrink-0">
        <MatchPreferencesHeader />
        <div className="flex justify-between items-center p-3 sm:p-4">
        <div 
          onClick={requestLocation}
          className="flex items-center gap-2 cursor-pointer hover:bg-surface-elevated p-1 rounded-md transition-colors neu-button px-3 py-1.5"
          title="Click to refresh location"
        >
           <MapPin size={18} className="text-primary" />
           <span className="text-sm font-medium">{profile?.location || "India"}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* LIVE Users Badge */}
          {liveUserCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 neu-pressed rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-500">{liveUserCount} Live</span>
            </div>
          )}
          <button 
            onClick={() => setCampusMode(!campusMode)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${campusMode ? 'screenshot-gradient shadow-lg' : 'neu-button text-text-secondary'}`}
          >
            {campusMode ? "Campus Only" : "Everyone"}
          </button>
          <div className="px-4 py-1.5 rounded-full text-xs font-bold neu-pressed text-primary">
            {profile?.mode || "Date"} Mode
          </div>
        </div>
      </div>
      </div>

      {/* Main Card Area */}
      <div className="flex-1 w-full relative flex items-center justify-center min-h-0">
        {isLoadingProfiles ? (
          <div className="relative w-full h-full rounded-b-3xl overflow-hidden bg-surface-elevated animate-pulse">
            <div className="w-full h-full bg-surface-elevated"></div>
            <div className="absolute bottom-0 w-full p-6 pt-24 bg-gradient-to-t from-black/90 to-transparent">
              <div className="h-8 bg-surface-elevated rounded-md w-3/4 mb-4"></div>
              <div className="h-4 bg-surface-elevated rounded-md w-1/2"></div>
            </div>
          </div>
        ) : currentProfile ? (() => {
        return (
          <motion.div
            key={currentProfile.id}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ x, rotate, opacity } as any}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
            onDragEnd={(e, info) => {
              if (Math.abs(info.offset.x) > 100) {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
                handleDragEnd(e, info);
              } else {
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 10]);
              }
            }}
            whileDrag={{ scale: 1.05 }}
            className="relative w-full h-full rounded-b-[2rem] cursor-grab active:cursor-grabbing bg-surface flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Top Image Section (Full Bleed) */}
            <div className="relative w-full h-[65%] sm:h-[70%] bg-black shrink-0">
              {currentProfile.video_url ? (
                <video 
                  src={currentProfile.video_url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className={`w-full h-full object-cover pointer-events-none ${currentProfile.isAnonymous || !currentProfile.verified ? 'blur-lg scale-105' : ''}`}
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={currentProfile.img} 
                  alt={currentProfile.name} 
                  className={`w-full h-full object-cover pointer-events-none ${currentProfile.isAnonymous || !currentProfile.verified ? 'blur-lg scale-105' : ''} ${appSettings.lowDataMode ? 'blur-[2px] opacity-90' : ''}`}
                  loading={appSettings.lowDataMode ? "lazy" : "eager"}
                />
              )}
              
              {/* Unverified Lock Overlay */}
              {!currentProfile.verified && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 pointer-events-none">
                    <div className="w-16 h-16 bg-white/10 border border-white/25 rounded-full flex items-center justify-center backdrop-blur-xl shadow-2xl mb-3">
                       <ShieldAlert size={32} className="text-white/90" />
                    </div>
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">Unverified</h3>
                 </div>
              )}
              
              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                <Sparkles size={14} className="text-pink-400" />
                <span className="text-white text-xs font-bold">{currentProfile.chemistryScore}% Match</span>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
                className="absolute top-4 right-4 w-9 h-9 bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors z-20 border border-white/15 shadow-lg"
              >
                <MoreVertical size={18} />
              </button>
            </div>

            {/* Bottom Info Panel */}
            <div className="flex-1 w-full bg-surface pt-5 pb-2 px-2 flex flex-col">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-foreground text-2xl font-bold flex items-center gap-2">
                    {currentProfile.isAnonymous ? "Secret Admirer" : currentProfile.name}
                    {currentProfile.verified && (
                      <span title="Verified Profile"><Sparkles size={20} className="text-primary" /></span>
                    )}
                  </h2>
                  <p className="text-text-muted font-medium text-sm mt-0.5">
                    {currentProfile.age} • {currentProfile.zodiacSign || "Leo"}
                  </p>
                </div>
                <KarmaBadge score={currentProfile.karma} />
              </div>
              
              {/* Activity & Location */}
              {(() => {
                const diffMins = Math.floor((Date.now() - currentProfile.lastActive.getTime()) / 60000);
                const isOnline = diffMins < 5;
                return (
                  <p className="text-text-muted mt-3 flex items-center gap-2 text-sm font-medium">
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-400'}`}></span>
                    {isOnline ? 'Online Now' : `Active ${diffMins}m ago`}
                    <span className="mx-1">•</span>
                    <MapPin size={12} /> {currentProfile.campus || "Hidden"}
                  </p>
                );
              })()}

              {/* Hobbies Chips UI */}
              {currentProfile.hobbies && currentProfile.hobbies.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {currentProfile.hobbies.slice(0, 3).map((hobby: string, idx: number) => {
                    const isShared = profile?.hobbies?.some(h => h.toLowerCase() === hobby.toLowerCase());
                    return (
                      <div 
                        key={idx} 
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold ${isShared ? 'bg-primary/10 text-primary' : 'neu-pressed text-text-secondary'}`}
                      >
                        {hobby} {isShared && "✨"}
                      </div>
                    );
                  })}
                  {currentProfile.hobbies.length > 3 && (
                    <div className="px-3 py-1.5 rounded-xl text-[11px] font-bold neu-pressed text-text-secondary">
                      +{currentProfile.hobbies.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Action Indicator / Intent */}
              <div className="mt-auto pt-4 w-full">
                <button 
                  onClick={() => handleSwipe("right")}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm text-white screenshot-gradient shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Heart size={16} fill="currentColor" /> Slide to Match
                </button>
              </div>
            </div>
          </motion.div>
        );
      })() : !isLoadingProfiles && (
        <div className="absolute flex flex-col items-center justify-center text-text-muted">
           <div className="w-20 h-20 rounded-full neu-pressed flex items-center justify-center mb-6">
             <Heart size={36} className="text-text-muted opacity-50" />
           </div>
           <p>No more profiles near you.</p>
        </div>
      )}
      </div>

      {/* Action Buttons (Swipe/Superlike/Rewind) */}
      <div className="w-full flex justify-center items-center gap-6 z-50 p-6 shrink-0 mb-4">
        <button 
          onClick={handleRewind}
          className={`w-14 h-14 rounded-full flex items-center justify-center neu-button text-yellow-500 hover:scale-105`}
        >
          <RotateCcw size={24} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => handleSwipe("left")}
          className="w-16 h-16 rounded-full flex items-center justify-center neu-button text-error hover:scale-105"
        >
          <X size={32} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => handleSwipe("right")}
          className="w-20 h-20 rounded-full flex items-center justify-center screenshot-gradient shadow-[0_10px_25px_rgba(249,115,22,0.4)] hover:scale-105 transition-all group border-4 border-surface"
        >
          <Heart size={36} strokeWidth={2.5} fill="currentColor" />
        </button>
        <button 
          onClick={() => handleSwipe("right", true)}
          className="w-14 h-14 rounded-full flex items-center justify-center neu-button text-primary hover:scale-105 group relative"
        >
          <Sparkles size={24} strokeWidth={2.5} fill="currentColor" />
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity neu-flat px-3 py-1.5 rounded-full text-xs text-text-primary whitespace-nowrap">
            Super Like (-10)
          </div>
        </button>
      </div>

      {/* Offline Toast Overlay */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-error text-foreground px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-4">
          <WifiOff size={16} /> No Internet - Showing Cached Profiles
        </div>
      )}

      {/* Daily Login Streak Modal */}
      {showDailyStreak && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-background border border-glass-border w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500"></div>
            
            <div className="w-20 h-20 bg-orange-500/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
              <Flame size={40} />
            </div>
            
            <h3 className="text-2xl font-black text-foreground italic">7 DAY STREAK! 🔥</h3>
            <p className="text-sm text-foreground/70">
              You&apos;re on fire! You&apos;ve logged in for 7 days in a row. Claim your daily reward below.
            </p>
            
            <div className="flex justify-center items-center gap-2 py-4 bg-foreground/5 rounded-2xl border border-foreground/10">
              <Coins size={24} className="text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">+20 Coins</span>
            </div>
            
            <button 
              onClick={() => {
                setShowDailyStreak(false);
                const today = new Date().toDateString();
                localStorage.setItem("last_daily_claim", today);
                useUserStore.getState().addCoins(20, "daily_reward");
                uiToast("Claimed 20 Coins!", "success");
              }} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-foreground font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && currentProfile && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center p-4 backdrop-blur-sm sm:items-center">
          <div className="bg-background border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-error flex items-center gap-2"><ShieldAlert size={20}/> Report User</h3>
              <button onClick={() => setShowReportModal(false)} className="p-2 bg-surface-elevated rounded-full text-muted hover:text-foreground"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-secondary mb-4">
              Why are you reporting <span className="font-bold text-foreground">{currentProfile.name}</span>? This will hide their profile from you permanently.
            </p>

            <div className="space-y-2 mb-6">
              {["Fake Profile / Catfishing", "Inappropriate Content", "Harassment / Abuse", "Underage", "Other"].map(reason => (
                <button 
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full text-left p-4 rounded-2xl bg-surface-elevated hover:bg-error/10 border border-border hover:border-red-500/30 transition-colors text-foreground font-medium"
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowReportModal(false)}
              className="w-full py-4 rounded-2xl bg-surface-elevated hover:bg-surface-elevated text-foreground font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* Match Celebration Modal */}
      {showMatchModal && matchedProfile && (
        <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white mb-6 shadow-[0_0_40px_rgba(244,63,94,0.6)] animate-bounce">
            <Heart size={48} fill="currentColor" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/20 px-3 py-1 rounded-full border border-primary/30 mb-2">
            IT&apos;S A MATCH! 🎉
          </span>

          <h2 className="text-3xl font-black text-foreground mb-2">
            You &amp; {matchedProfile.name} Liked Each Other!
          </h2>
          <p className="text-xs text-muted max-w-xs mb-8">
            Spark a connection right now! Send a message or try a flirt game.
          </p>

          <div className="flex items-center justify-center gap-4 mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile?.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80"}
              alt="My Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-primary shadow-lg"
            />
            <div className="text-primary text-2xl font-black">💖</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={matchedProfile.img || matchedProfile.photo_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80"}
              alt="Match Avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-pink-500 shadow-lg"
            />
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={() => {
                setShowMatchModal(false);
                router.push(`/chat/${matchedProfile.id}`);
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-pink-600 to-purple-600 text-white font-black text-sm shadow-lg shadow-primary/40 active:scale-95 transition"
            >
              💬 Send a Message Now
            </button>

            <button
              onClick={() => setShowMatchModal(false)}
              className="w-full py-3.5 rounded-2xl bg-surface-elevated hover:bg-surface-elevated text-secondary font-bold text-xs transition"
            >
              Keep Swiping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

