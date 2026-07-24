"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";
import { Heart, X, MapPin, Sparkles, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { Flame, Coins, WifiOff, ShieldAlert, MoreVertical } from "lucide-react";
import { supabase } from "@/lib/supabase";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

interface DummyProfile {
  id: string;
  name: string;
  gender: string;
  location: string;
  age?: number;
  campus?: string;
  hobbies?: string[];
  verified?: boolean;
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

const DUMMY_PROFILES: DummyProfile[] = [
  { id: "1", name: "Priya", gender: "Female", location: "New Delhi", age: 21, campus: "Delhi University", hobbies: ["Photography", "Cafe Hopping", "Netflix"], verified: true, karma: 130, img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 2), chemistryScore: 94, crossedPathsCount: 5, mode: "Date" },
  { id: "2", name: "Ananya", gender: "Female", location: "Mumbai", age: 22, campus: "Mumbai University", hobbies: ["Painting", "Travel"], verified: false, karma: 160,
    distance: 1.5,
    voice_prompt_url: "https://actions.google.com/sounds/v1/human_voices/human_snoring.ogg",
    images: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"], lastActive: new Date(Date.now() - 1000 * 60 * 45), chemistryScore: 88, crossedPathsCount: 1, mode: "Date", isAnonymous: true },
  { id: "3", name: "Riya", gender: "Female", location: "New Delhi", age: 20, campus: "Delhi University", hobbies: ["Dancing", "Anime"], verified: true, zodiacSign: "Leo", karma: 80, video_url: "https://www.w3schools.com/html/mov_bbb.mp4", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), chemistryScore: 72, crossedPathsCount: 0, mode: "BFF" },
  { id: "4", name: "Rahul", gender: "Male", location: "Bengaluru", age: 23, campus: "Christ", hobbies: ["Coding", "Gym", "Gaming"], verified: false, karma: 110, img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 5), chemistryScore: 85, crossedPathsCount: 2, mode: "Date" }
];

export default function Home() {
  useDeviceAuth();
  const router = useRouter();
  
  const [profiles, setProfiles] = useState<typeof DUMMY_PROFILES>([]);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(true);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<typeof DUMMY_PROFILES[0] | null>(null);
  const [campusMode, setCampusMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showDailyStreak, setShowDailyStreak] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const addMatch = useUserStore((state) => state.addMatch);
  const { appSettings } = useUserStore();
  const coins = useUserStore((state) => state.coins);
  const setLocation = useUserStore((state) => state.setLocation);
  const profile = useUserStore((state) => state.profile);
  const deviceId = useUserStore((state) => state.deviceId);
  const matchPreferences = useUserStore((state) => state.matchPreferences);

  // Initial data fetch simulation
  useEffect(() => {
    const fetchTimer = setTimeout(() => {
      setProfiles(DUMMY_PROFILES);
      setIsLoadingProfiles(false);
    }, 1500);
    return () => clearTimeout(fetchTimer);
  }, []);

  // Inactive User Filtering (Remove if > 7 days inactive)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const activeProfiles = profiles.filter(p => (Date.now() - p.lastActive.getTime()) < SEVEN_DAYS);
  
  // WebSocket logic for Live Monitoring
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws";
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

    // Check for referral reward
    const params = new URLSearchParams(window.location.search);
    if (params.get("ref") && !localStorage.getItem("referral_claimed")) {
      useUserStore.getState().addCoins(50);
      toast("Welcome! You got +50 Coins from your friend's invite! 🎉", "success");
      localStorage.setItem("referral_claimed", "true");
      
      // Clean up URL
      router.replace("/");
    }
    
    return () => ws.close();
  }, [router, toast]);

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
  }

  // Redirect to setup if no profile exists
  useEffect(() => {
    if (!profile) {
      router.push("/setup");
    }
  }, [profile, router]);

  // Request location on mount
  useEffect(() => {
    if (profile && !profile.location) {
      requestLocation();
    }
  }, [profile]);

  // Offline Detection
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    if (!navigator.onLine) setIsOffline(true);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

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
          toast(`Location found: ${city}! Showing nearby profiles.`, "success");
        } catch (e) {
          setLocation(`${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`);
          toast("Location found! Showing nearby profiles.", "success");
        }
      },
      (error) => {
        setLocationError("Please enable location to find matches near you in India.");
      }
    );
  };

  // Motion values for swipe gestures
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

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
        toast("Not enough coins for Super Like!", "error");
        return;
      }
      spendCoins(10);
      toast("Super Liked! 🌟 (-10 Coins)", "success");
    } else if (direction === "right") {
      if (coins < 2) {
        toast("Not enough coins to like!", "error");
        return;
      }
      spendCoins(2);
    }
    
    // Save to Backend for Secure Matching
    if (deviceId) {
       try {
         const res = await fetch(`${BACKEND_URL}/swipes`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ swiper_id: deviceId, swiped_id: targetProfile.id, direction: direction })
         });
         
         if (res.ok) {
           const data = await res.json();
           
           // If right or super like, check for match
           if (direction === "right" || isSuperLike) {
             if (data.is_match || targetProfile.id === "1") { 
                // For demo purposes, let's auto-match with Priya (id 1) if swiped right
                if (targetProfile.id === "1" && !data.is_match) {
                   const u1 = deviceId < targetProfile.id ? deviceId : targetProfile.id;
                   const u2 = deviceId > targetProfile.id ? deviceId : targetProfile.id;
                   await supabase.from("matches").insert({ user1_id: u1, user2_id: u2 });
                }
                toast(`It's a Match with ${targetProfile.name}! 🎉`, "success");
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
    if (!lastSwipedProfile) return;
    if (coins < 5) {
      toast("Not enough coins to Rewind!", "error");
      return;
    }
    spendCoins(5);
    
    if (deviceId) {
       await supabase.from("swipes")
         .delete()
         .eq("swiper_id", deviceId)
         .eq("swiped_id", lastSwipedProfile.id)
         .eq("direction", "left");
    }
    
    setProfiles((prev) => [lastSwipedProfile, ...prev]);
    setLastSwipedProfile(null);
    toast("Swipe Rewinded! ⏪ (-5 Coins)", "success");
  };

  const handleReport = async (reason: string) => {
    setShowReportModal(false);
    toast(`User reported for: ${reason}. Thank you for keeping the community safe.`, "success");
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

  if (!profile) return null; // Wait for redirect to /setup

  // UI state: Location not granted
  if (!profile.location) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-6 text-center space-y-6 bg-background">
        <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
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

  const getZodiacCompatibility = (myZodiac?: string, theirZodiac?: string) => {
    if (!myZodiac || !theirZodiac) return null;
    const score = 50 + ((myZodiac.length * theirZodiac.length * 7) % 50);
    return `${score}% Match`;
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
      
      {/* Top Header & Toggles */}
      <div className="absolute top-0 w-full p-4 z-10 flex justify-between items-center glass border-b border-glass-border">
        <div 
          onClick={requestLocation}
          className="flex items-center gap-2 cursor-pointer hover:bg-white/5 p-1 rounded-md transition-colors"
          title="Click to refresh location"
        >
           <MapPin size={18} className="text-primary-500" />
           <span className="text-sm font-medium">{profile?.location || "India"}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* LIVE Users Badge */}
          {liveUserCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-400">{liveUserCount} Live</span>
            </div>
          )}
          <button 
            onClick={() => setCampusMode(!campusMode)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${campusMode ? 'bg-primary-500 text-white' : 'bg-foreground/10 text-foreground/70 hover:bg-foreground/20'}`}
          >
            {campusMode ? "Campus Only" : "Everyone"}
          </button>
          <div className="px-3 py-1 rounded-full text-xs font-bold bg-foreground/10 text-foreground border border-foreground/20">
            {profile?.mode || "Date"} Mode
          </div>
        </div>
      </div>

      {isLoadingProfiles ? (
        <div className="absolute w-[95%] h-[75%] max-h-[600px] rounded-3xl overflow-hidden border border-white/10 bg-white/5 animate-pulse">
           <div className="w-full h-full bg-white/5"></div>
           <div className="absolute bottom-0 w-full p-6 pt-24 bg-gradient-to-t from-black/90 to-transparent">
             <div className="h-8 bg-white/20 rounded-md w-3/4 mb-4"></div>
             <div className="h-4 bg-white/20 rounded-md w-1/2"></div>
           </div>
        </div>
      ) : currentProfile ? (() => {
        return (
          <motion.div
            key={currentProfile.id}
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.8} // Elastic pull
            dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }} // Feature 4: Micro Animation Bounce Spring
            onDragEnd={(e, info) => {
              if (Math.abs(info.offset.x) > 100) {
                // Trigger Haptic Feedback on successful swipe
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(50);
                }
                handleDragEnd(e, info);
              } else {
                // If it didn't pass the threshold, it snaps back. Add a tiny error buzz.
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate([10, 30, 10]);
                }
              }
            }}
            whileDrag={{ scale: 1.05 }}
            className="absolute w-[95%] h-[75%] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing border border-glass-border bg-black"
          >
            {currentProfile.video_url ? (
              <video 
                src={currentProfile.video_url} 
                autoPlay 
                loop 
                muted 
                playsInline
                className={`w-full h-full object-cover pointer-events-none ${currentProfile.isAnonymous || !currentProfile.verified ? 'blur-xl scale-110' : ''}`}
              />
            ) : (
              <img 
                src={currentProfile.img} 
                alt={currentProfile.name} 
                className={`w-full h-full object-cover pointer-events-none ${currentProfile.isAnonymous || !currentProfile.verified ? 'blur-xl scale-110' : ''} ${appSettings.lowDataMode ? 'blur-[2px] opacity-90' : ''}`}
                loading={appSettings.lowDataMode ? "lazy" : "eager"}
              />
            )}
            
            {/* Unverified Lock Overlay */}
            {!currentProfile.verified && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 pointer-events-none">
                  <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-2xl mb-3">
                     <ShieldAlert size={32} className="text-white" />
                  </div>
                  <h3 className="text-white font-bold text-lg">Unverified Profile</h3>
                  <p className="text-white/70 text-xs">Verify your own profile to unblur others.</p>
               </div>
            )}
            
            {/* AI Chemistry Badge Top Left */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary-500/50 flex items-center gap-1.5 shadow-lg">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-white text-xs font-bold">{currentProfile.chemistryScore}% Match</span>
            </div>
            
            {/* Crossed Paths Badge Top Right */}
            {currentProfile.crossedPathsCount > 0 && (
              <div className="absolute top-4 right-14 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                <MapPin size={12} className="text-white/80" />
                <span className="text-white/90 text-[10px] font-bold">Crossed Paths {currentProfile.crossedPathsCount}x</span>
              </div>
            )}

            {/* Report/Menu Button Top Right */}
            <button 
              onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}
              className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors z-20 border border-white/10 shadow-lg"
            >
              <MoreVertical size={16} />
            </button>
            
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 pt-24">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-white text-3xl font-bold flex items-center gap-2">
                    {currentProfile.isAnonymous ? "Secret Admirer" : `${currentProfile.name}, ${currentProfile.age}`}
                    {currentProfile.verified && (
                      <span title="Verified Profile"><Sparkles size={20} className="text-blue-400" /></span>
                    )}
                  </h2>
                  
                  {/* Activity Indicator */}
                  {(() => {
                    const diffMins = Math.floor((Date.now() - currentProfile.lastActive.getTime()) / 60000);
                    const isOnline = diffMins < 5;
                    return (
                      <p className="text-white/80 mt-1 flex items-center gap-2 text-sm">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-gray-400'}`}></span>
                        {isOnline ? 'Online Now' : `Active ${diffMins}m ago`}
                      </p>
                    );
                  })()}
                  
                  {/* Looking For (Intent) Badge */}
                  {currentProfile.intent && (
                    <div className="mt-2 inline-block px-2.5 py-1 bg-gradient-to-r from-pink-500/20 to-rose-500/20 backdrop-blur-md rounded-md text-xs font-semibold text-pink-300 border border-pink-500/30 mr-2">
                      👀 {currentProfile.intent}
                    </div>
                  )}

                  {/* Zodiac Compatibility Badge */}
                  {profile?.zodiacSign && currentProfile.zodiacSign && (
                    <div className="mt-2 inline-block px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 backdrop-blur-md rounded-md text-xs font-semibold text-purple-300 border border-purple-500/30 mr-2">
                      ✨ {currentProfile.zodiacSign} • {getZodiacCompatibility(profile.zodiacSign, currentProfile.zodiacSign)}
                    </div>
                  )}

                  {/* Campus Badge on Card */}
                  {currentProfile.campus && (
                    <div className="mt-2 inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-semibold text-white border border-white/30 mr-2">
                      🎓 {currentProfile.campus}
                    </div>
                  )}

                  {/* Location Hidden Badge */}
                  <div className="mt-2 inline-block px-2.5 py-1 bg-black/40 backdrop-blur-md rounded-md text-xs font-semibold text-white/70 border border-white/10 mr-2">
                    <MapPin size={10} className="inline mr-1 text-primary-400" />
                    Hidden until Match
                  </div>

                  {/* Hobbies Chips UI */}
                  {currentProfile.hobbies && currentProfile.hobbies.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentProfile.hobbies.map((hobby: string, idx: number) => {
                        // Calculate compatibility if user has hobbies
                        const isShared = profile?.hobbies?.some(h => h.toLowerCase() === hobby.toLowerCase());
                        return (
                          <div 
                            key={idx} 
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border backdrop-blur-md ${isShared ? 'bg-primary-500/20 text-primary-300 border-primary-500/30' : 'bg-white/10 text-white/80 border-white/20'}`}
                          >
                            {hobby} {isShared && "✨"}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Voice Prompt Player */}
                  {currentProfile.voice_prompt_url && (
                    <div className="mt-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <p className="text-[10px] uppercase tracking-wider text-primary-400 font-bold mb-2">Voice Icebreaker</p>
                      <audio controls src={currentProfile.voice_prompt_url} className="w-full h-8" />
                    </div>
                  )}
                </div>
                {/* Karma Badge Display */}
                <div className="pb-1">
                  <KarmaBadge score={currentProfile.karma} />
                </div>
              </div>
            </div>
          </motion.div>
        );
      })() : !isLoadingProfiles && (
        <div className="absolute flex flex-col items-center justify-center text-gray-500">
           <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
             <Heart size={32} className="text-white/20" />
           </div>
           <p>No more profiles near you.</p>
        </div>
      )}

      {/* Swipe Actions Buttons */}
      <div className="absolute bottom-8 flex items-center gap-4 sm:gap-6 z-10">
        <button 
          onClick={handleRewind}
          disabled={!lastSwipedProfile}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform ${!lastSwipedProfile ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-yellow-500 hover:scale-110'}`}
        >
          <RotateCcw size={24} strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleSwipe("left")}
          className="w-16 h-16 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleSwipe("right")}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-110 transition-transform relative group"
        >
          <Heart size={32} strokeWidth={3} fill="currentColor" />
        </button>
        <button 
          onClick={() => handleSwipe("right", true)}
          className="w-12 h-12 rounded-full bg-white text-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative group"
        >
          <Sparkles size={24} strokeWidth={3} fill="currentColor" />
          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white border border-white/20 whitespace-nowrap">
            Super Like (-10)
          </div>
        </button>
      </div>

      {/* Offline Toast Overlay */}
      {isOffline && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold animate-in slide-in-from-top-4">
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
              You're on fire! You've logged in for 7 days in a row. Claim your daily reward below.
            </p>
            
            <div className="flex justify-center items-center gap-2 py-4 bg-foreground/5 rounded-2xl border border-foreground/10">
              <Coins size={24} className="text-yellow-500" />
              <span className="text-2xl font-bold text-foreground">+10 Coins</span>
            </div>
            
            <button 
              onClick={() => {
                setShowDailyStreak(false);
                useUserStore.getState().addCoins(10);
                toast("Claimed 10 Coins!", "success");
              }} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && currentProfile && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-end justify-center p-4 backdrop-blur-sm sm:items-center">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-red-500 flex items-center gap-2"><ShieldAlert size={20}/> Report User</h3>
              <button onClick={() => setShowReportModal(false)} className="p-2 bg-white/10 rounded-full text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-gray-300 mb-4">
              Why are you reporting <span className="font-bold text-white">{currentProfile.name}</span>? This will hide their profile from you permanently.
            </p>

            <div className="space-y-2 mb-6">
              {["Fake Profile / Catfishing", "Inappropriate Content", "Harassment / Abuse", "Underage", "Other"].map(reason => (
                <button 
                  key={reason}
                  onClick={() => handleReport(reason)}
                  className="w-full text-left p-4 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 transition-colors text-white font-medium"
                >
                  {reason}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setShowReportModal(false)}
              className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
