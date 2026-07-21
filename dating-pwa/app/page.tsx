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
import { Flame, Coins, WifiOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

const DUMMY_PROFILES = [
  { id: "1", name: "Priya", age: 21, campus: "Delhi University", karma: 130, img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 2), chemistryScore: 94, crossedPathsCount: 5, mode: "Date" },
  { id: "2", name: "Ananya", age: 22, campus: "Amity", karma: 160, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 45), chemistryScore: 88, crossedPathsCount: 1, mode: "Date", isAnonymous: true },
  { id: "3", name: "Riya", age: 20, campus: "Delhi University", karma: 80, img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), chemistryScore: 72, crossedPathsCount: 0, mode: "BFF" },
];

export default function Home() {
  useDeviceAuth();
  const router = useRouter();
  
  const [profiles, setProfiles] = useState(DUMMY_PROFILES);
  const [lastSwipedProfile, setLastSwipedProfile] = useState<typeof DUMMY_PROFILES[0] | null>(null);
  const [campusMode, setCampusMode] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showDailyStreak, setShowDailyStreak] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [liveUserCount, setLiveUserCount] = useState(0);
  
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const addMatch = useUserStore((state) => state.addMatch);
  const { appSettings } = useUserStore();
  const coins = useUserStore((state) => state.coins);
  const setLocation = useUserStore((state) => state.setLocation);
  const profile = useUserStore((state) => state.profile);

  // Inactive User Filtering (Remove if > 7 days inactive)
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  const activeProfiles = profiles.filter(p => (Date.now() - p.lastActive.getTime()) < SEVEN_DAYS);
  
  // WebSocket logic for Live Monitoring
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/ws");
    
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
    
    return () => ws.close();
  }, []);

  // Filter profiles based on Campus Mode and User's active Mode (Date/BFF/Bizz)
  let displayProfiles = activeProfiles.filter(p => p.mode === (profile?.mode || "Date"));
  
  if (campusMode && profile?.campus) {
    displayProfiles = displayProfiles.filter(p => p.campus?.toLowerCase() === profile.campus?.toLowerCase());
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
      (position) => {
        setLocation(`${position.coords.latitude.toFixed(2)},${position.coords.longitude.toFixed(2)}`);
        toast("Location found! Showing nearby profiles.", "success");
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
    
    // Save to Supabase DB (Fire and Forget)
    if (profile.device_id) {
       try {
         await supabase.from("swipes").insert({
           swiper_id: profile.device_id,
           swiped_id: targetProfile.id,
           direction: direction,
           is_super_like: isSuperLike
         });
         
         // If right or super like, check for match
         if (direction === "right" || isSuperLike) {
            const { data: matchSwipe } = await supabase.from("swipes")
              .select("*")
              .eq("swiper_id", targetProfile.id)
              .eq("swiped_id", profile.device_id)
              .eq("direction", "right")
              .maybeSingle();
              
            if (matchSwipe || targetProfile.id === "1") { 
               // For demo purposes, let's auto-match with Priya (id 1) if swiped right
               const u1 = profile.device_id < targetProfile.id ? profile.device_id : targetProfile.id;
               const u2 = profile.device_id > targetProfile.id ? profile.device_id : targetProfile.id;
               await supabase.from("matches").insert({ user1_id: u1, user2_id: u2 });
               toast(`It's a Match with ${targetProfile.name}! 🎉`, "success");
            }
         }
       } catch (err) {
         console.error("Swipe DB Error:", err);
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
    if (!lastSwipedProfile) return;
    if (coins < 5) {
      toast("Not enough coins to Rewind!", "error");
      return;
    }
    spendCoins(5);
    
    if (profile.device_id) {
       await supabase.from("swipes")
         .delete()
         .eq("swiper_id", profile.device_id)
         .eq("swiped_id", lastSwipedProfile.id)
         .eq("direction", "left");
    }
    
    setProfiles((prev) => [lastSwipedProfile, ...prev]);
    setLastSwipedProfile(null);
    toast("Swipe Rewinded! ⏪ (-5 Coins)", "success");
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

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-4rem)] overflow-hidden bg-background">
      
      {/* Top Header & Toggles */}
      <div className="absolute top-0 w-full p-4 z-10 flex justify-between items-center glass border-b border-glass-border">
        <div className="flex items-center gap-2">
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

      {currentProfile && (() => {
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
            className="absolute w-[95%] h-[75%] max-h-[600px] rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing border border-glass-border"
          >
            <img 
              src={currentProfile.img} 
              alt={currentProfile.name} 
              className={`w-full h-full object-cover pointer-events-none ${currentProfile.isAnonymous ? 'blur-xl scale-110' : ''} ${appSettings.lowDataMode ? 'blur-[2px] opacity-90' : ''}`}
              loading={appSettings.lowDataMode ? "lazy" : "eager"}
            />
            
            {/* AI Chemistry Badge Top Left */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary-500/50 flex items-center gap-1.5 shadow-lg">
              <Sparkles size={14} className="text-primary-400" />
              <span className="text-white text-xs font-bold">{currentProfile.chemistryScore}% Match</span>
            </div>
            
            {/* Crossed Paths Badge Top Right */}
            {currentProfile.crossedPathsCount > 0 && (
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-lg">
                <MapPin size={12} className="text-white/80" />
                <span className="text-white/90 text-[10px] font-bold">Crossed Paths {currentProfile.crossedPathsCount}x</span>
              </div>
            )}
            
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-6 pt-24">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-white text-3xl font-bold flex items-center gap-2">
                    {currentProfile.isAnonymous ? "Secret Admirer" : `${currentProfile.name}, ${currentProfile.age}`}
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
                  
                  {/* Campus Badge on Card */}
                  {currentProfile.campus && (
                    <div className="mt-2 inline-block px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-semibold text-white border border-white/30">
                      🎓 {currentProfile.campus}
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
      })()}

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
              <span className="text-2xl font-bold text-foreground">+50 Coins</span>
            </div>
            
            <button 
              onClick={() => {
                setShowDailyStreak(false);
                toast("Claimed 50 Coins!", "success");
              }} 
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              Claim Reward
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
