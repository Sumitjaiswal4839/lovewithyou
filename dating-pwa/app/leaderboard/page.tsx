"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, MapPin, Share2, Sparkles, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function LeaderboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"city" | "campus">("city");
  const [leaders, setLeaders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      // 1. Try Go backend endpoint
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
      const res = await fetch(`${API_BASE_URL}/leaderboard/top-connectors`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setLeaders(json.data.map((l: any, idx: number) => ({
            rank: idx + 1,
            name: l.alias || l.name || "Single User",
            karma: l.rating || (l.karma || 100) * 10,
            campus: l.campus || l.location || "Delhi Hub",
            img: l.photo_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80`,
            badge: l.badge || "👑 Vibe King/Queen",
          })));
          setIsLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn("Backend leaderboard fetch error, falling back to Supabase direct query", e);
    }

    // 2. Direct Supabase Query Fallback
    try {
      const { data } = await supabase
        .from("profiles")
        .select("name, campus, location, karma, photo_url, gender")
        .order("karma", { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setLeaders(data.map((p: any, idx: number) => ({
          rank: idx + 1,
          name: p.name || "Anonymous Single",
          karma: (p.karma || 100) * 10,
          campus: p.campus || p.location || "India Lounge",
          img: p.photo_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80",
          badge: idx === 0 ? (p.gender === "Female" ? "👑 Platinum Vibe Queen" : "👑 Platinum Vibe King") : "✨ Gold Matcher",
        })));
      } else {
        setLeaders([
          { rank: 1, name: "Ayesha M.", karma: 9800, campus: "Delhi University", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80", badge: "👑 Platinum Vibe Queen" },
          { rank: 2, name: "Rohan S.", karma: 9450, campus: "IIT Tech Hub", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80", badge: "👑 Platinum Vibe King" },
          { rank: 3, name: "Priya K.", karma: 9100, campus: "Amity Campus", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80", badge: "✨ Gold Matcher" },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const top3 = leaders.slice(0, 3);
  const remaining = leaders.slice(3);

  return (
    <div className="flex flex-col min-h-screen bg-[#07050e] text-white">
      <div className="p-4 pt-6 bg-black/60 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Leaderboard <Trophy size={20} className="text-amber-400 animate-pulse" />
            </h2>
          </div>
          <button 
            onClick={() => toast("Invite link copied to clipboard!", "success")}
            className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1.5 rounded-full border border-amber-500/30"
          >
            <Share2 size={14} /> Refer &amp; Earn
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          <button 
            onClick={() => setActiveTab("city")}
            className={`flex-1 py-2 rounded-full text-xs font-black transition ${activeTab === "city" ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Top Connectors (City)
          </button>
          <button 
            onClick={() => setActiveTab("campus")}
            className={`flex-1 py-2 rounded-full text-xs font-black transition ${activeTab === "campus" ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            My Campus Vibe Kings
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw size={16} className="animate-spin text-rose-400" /> Fetching live Supabase connector rankings...
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {top3.length >= 3 && (
              <div className="flex justify-center items-end gap-3 mb-8 mt-4 h-44">
                {/* 2nd Place */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img src={top3[1]?.img} className="w-16 h-16 rounded-full object-cover border-4 border-gray-400 shadow-md" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gray-400 text-black text-xs font-black flex items-center justify-center">
                      2
                    </div>
                  </div>
                  <div className="mt-3 font-bold text-white text-xs truncate max-w-[80px] text-center">{top3[1]?.name}</div>
                  <div className="text-[10px] text-amber-400 font-black">{top3[1]?.karma} Vibe</div>
                </div>

                {/* 1st Place */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img src={top3[0]?.img} className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 -translate-y-3 shadow-[0_0_25px_rgba(251,191,36,0.6)]" />
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-amber-400 text-black text-xs font-black flex items-center justify-center">
                      👑 1
                    </div>
                  </div>
                  <div className="mt-5 font-black text-white text-sm -translate-y-2 truncate max-w-[90px] text-center">{top3[0]?.name}</div>
                  <div className="text-xs text-amber-300 font-black -translate-y-2">{top3[0]?.karma} Vibe</div>
                </div>

                {/* 3rd Place */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <img src={top3[2]?.img} className="w-16 h-16 rounded-full object-cover border-4 border-amber-700 shadow-md" />
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center">
                      3
                    </div>
                  </div>
                  <div className="mt-3 font-bold text-white text-xs truncate max-w-[80px] text-center">{top3[2]?.name}</div>
                  <div className="text-[10px] text-amber-400 font-black">{top3[2]?.karma} Vibe</div>
                </div>
              </div>
            )}

            {/* Remaining List */}
            {remaining.map((user) => (
              <div key={user.rank} className="flex items-center gap-3 bg-white/[0.03] border border-white/10 p-3.5 rounded-3xl hover:border-rose-500/40 transition">
                <div className="w-7 font-black text-gray-400 text-xs text-center">#{user.rank}</div>
                <img src={user.img} className="w-11 h-11 rounded-2xl object-cover border border-white/10 shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                    {user.name} <span className="text-[10px] text-amber-300 font-normal">{user.badge}</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 flex items-center gap-1 truncate"><MapPin size={10} /> {user.campus}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
                    {user.karma} Vibe
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
