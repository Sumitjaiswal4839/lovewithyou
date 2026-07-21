"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Medal, MapPin, Share2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

const LEADERBOARD_DATA = [
  { rank: 1, name: "Rahul", karma: 980, campus: "Delhi University", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80" },
  { rank: 2, name: "Priya", karma: 850, campus: "Amity", img: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80" },
  { rank: 3, name: "Ananya", karma: 720, campus: "JNU", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80" },
  { rank: 4, name: "Vikram", karma: 640, campus: "IIT Delhi", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80" },
  { rank: 5, name: "Neha", karma: 590, campus: "Delhi University", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&q=80" },
];

export default function LeaderboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"city" | "campus">("city");

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg">
      <div className="p-4 pt-6 glass border-b border-glass-border sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              Leaderboard <Trophy size={20} className="text-yellow-500" />
            </h2>
          </div>
          <button 
            onClick={() => toast("Invite link copied to clipboard!", "success")}
            className="flex items-center gap-1.5 text-xs bg-primary-500/20 text-primary-400 font-bold px-3 py-1.5 rounded-full"
          >
            <Share2 size={14} /> Refer & Earn
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-full border border-white/10">
          <button 
            onClick={() => setActiveTab("city")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${activeTab === "city" ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Top Connectors (City)
          </button>
          <button 
            onClick={() => setActiveTab("campus")}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${activeTab === "campus" ? 'bg-primary-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            My Campus
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 pb-24">
        {/* Top 3 Podium (Mock UI) */}
        <div className="flex justify-center items-end gap-2 mb-8 mt-4 h-40">
          {[LEADERBOARD_DATA[1], LEADERBOARD_DATA[0], LEADERBOARD_DATA[2]].map((user, idx) => (
            <div key={user.name} className="flex flex-col items-center">
              <div className="relative">
                <img src={user.img} className={`rounded-full object-cover border-4 ${idx === 1 ? 'w-20 h-20 border-yellow-500 z-10 -translate-y-4 shadow-[0_0_20px_rgba(234,179,8,0.5)]' : idx === 0 ? 'w-16 h-16 border-gray-400' : 'w-16 h-16 border-orange-700'}`} />
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 1 ? 'bg-yellow-500 text-black' : idx === 0 ? 'bg-gray-400 text-black' : 'bg-orange-700 text-white'}`}>
                  {user.rank}
                </div>
              </div>
              <div className={`mt-4 font-bold text-white text-sm ${idx === 1 ? '-translate-y-4' : ''}`}>{user.name}</div>
              <div className={`text-xs text-primary-400 font-bold ${idx === 1 ? '-translate-y-4' : ''}`}>{user.karma} Karma</div>
            </div>
          ))}
        </div>

        {/* Remaining List */}
        {LEADERBOARD_DATA.slice(3).map(user => (
          <div key={user.rank} className="flex items-center gap-4 bg-white/5 border border-white/10 p-3 rounded-2xl hover:border-primary-500/30 transition">
            <div className="w-6 font-bold text-gray-400 text-center">#{user.rank}</div>
            <img src={user.img} className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-white">{user.name}</h4>
              <p className="text-[10px] text-gray-400 flex items-center gap-1"><MapPin size={10} /> {user.campus}</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-primary-400 bg-primary-500/10 px-2 py-1 rounded-lg">{user.karma}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
