"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";
import { Heart, X, Play, Pause, Headphones } from "lucide-react";

// Dummy audio prompts for testing (using generic free sounds or placeholders)
const DUMMY_PROFILES = [
  { id: "1", name: "Stranger #842", age: 21, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "2", name: "Stranger #991", age: 24, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "3", name: "Stranger #105", age: 20, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function BlindDatePage() {
  useDeviceAuth();
  const router = useRouter();
  
  const [profiles, setProfiles] = useState(DUMMY_PROFILES);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  const coins = useUserStore((state) => state.coins);
  const profile = useUserStore((state) => state.profile);

  // If user hasn't recorded a voice prompt, block access
  if (profile && !profile.voice_prompt_url) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] px-6 text-center space-y-6">
        <div className="w-24 h-24 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
          <Headphones size={48} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Voice First Mode</h2>
          <p className="text-gray-400 text-sm">
            You need to record an Icebreaker voice note in your Profile Settings to participate in Blind Dates.
          </p>
        </div>
        <button 
          onClick={() => router.push("/profile/edit")}
          className="w-full py-3 rounded-xl bg-primary-500 text-white font-bold"
        >
          Record Now
        </button>
      </div>
    );
  }

  // Motion values for swipe gestures
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) {
      handleSwipe("right");
    } else if (info.offset.x < -100) {
      handleSwipe("left");
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    stopAudio();
    if (direction === "right") {
      if (coins < 2) {
        toast("Not enough coins to like!", "error");
        return;
      }
      spendCoins(2);
      toast("Vibe Liked! (-2 Coins)", "success");
    }
    setProfiles((prev) => prev.slice(1));
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4 pt-32">
        <h2 className="text-2xl font-bold text-primary-500 mb-2">No more voices!</h2>
        <p className="text-gray-400">Check back later for new people.</p>
      </div>
    );
  }

  const currentProfile = profiles[0];

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[calc(100vh-8rem)] overflow-hidden bg-dark-bg">
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        src={currentProfile.audio_url} 
        onEnded={() => setIsPlaying(false)} 
        className="hidden"
      />

      <div className="absolute top-8 text-center px-6">
        <h1 className="text-2xl font-bold text-white mb-2">Blind Date</h1>
        <p className="text-sm text-gray-400">Listen to their voice. Swipe right if you like their vibe.</p>
      </div>

      <motion.div
        key={currentProfile.id}
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.05 }}
        className="absolute w-[90%] h-[60%] max-h-[500px] rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing border-4 border-primary-500/20 bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center"
      >
        
        {/* Abstract Audio Visualizer (CSS Animation) */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <div className={`absolute inset-0 border-4 border-primary-500/30 rounded-full ${isPlaying ? 'animate-ping' : ''}`}></div>
          <button 
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            className="w-24 h-24 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.4)] z-10 transition-transform hover:scale-105"
          >
            {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
          </button>
        </div>

        <h2 className="text-white text-2xl font-bold tracking-widest text-center">
          {currentProfile.name}
        </h2>
        <p className="text-primary-400 mt-2 text-sm">Age: {currentProfile.age}</p>
        
      </motion.div>

      {/* Swipe Actions Buttons */}
      <div className="absolute bottom-8 flex items-center gap-6 z-10">
        <button 
          onClick={() => handleSwipe("left")}
          className="w-16 h-16 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <X size={32} strokeWidth={3} />
        </button>
        <button 
          onClick={() => handleSwipe("right")}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 text-white flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)] hover:scale-110 transition-transform"
        >
          <Heart size={32} strokeWidth={3} fill="currentColor" />
        </button>
      </div>

    </div>
  );
}
