"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Calendar, MessageSquare, Users, ChevronRight, Zap } from "lucide-react";

export default function CampusPage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);

  // If not a student or not verified, show lock screen
  const isVerifiedStudent = profile?.isStudent && profile?.studentVerificationStatus === 'verified';

  if (!isVerifiedStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 relative">
          <GraduationCap size={48} className="text-indigo-400 opacity-50" />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Lock size={32} className="text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Campus Mode Locked</h1>
        <p className="text-gray-400 text-sm mb-8">
          Verify your student ID in your Profile to unlock Campus Mode. Connect with students, join communities, and get exclusive event invites.
        </p>
        <button 
          onClick={() => router.push('/profile')}
          className="w-full max-w-xs py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition shadow-[0_0_15px_rgba(99,102,241,0.4)]"
        >
          Go to Profile to Verify
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-bg pb-20 overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-b from-indigo-900/40 to-dark-bg p-6 pt-12 pb-8 sticky top-0 z-10 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Campus <GraduationCap size={28} className="text-indigo-400" />
          </h1>
          <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1">
            <Zap size={14} /> Perks Active
          </span>
        </div>
        <p className="text-gray-400 text-sm">{profile?.campus || "Your University"}'s Exclusive Hub</p>
      </div>

      <div className="p-4 space-y-8">
        
        {/* Events Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Calendar size={20} className="text-pink-400" /> Upcoming Fests
            </h2>
            <button className="text-indigo-400 text-xs font-bold hover:underline">See All</button>
          </div>
          
          <div className="flex overflow-x-auto gap-4 pb-4 px-2 no-scrollbar">
            {/* Event Card 1 */}
            <div className="min-w-[240px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:bg-white/10 transition">
              <div className="h-28 bg-pink-500/20 relative">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" alt="Fest" className="w-full h-full object-cover mix-blend-overlay" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-bold">
                  Oct 14
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold mb-1">Tech Symphony '26</h3>
                <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={12} /> Main Auditorium</p>
                <div className="mt-3 flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-dark-bg"></div>
                  <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-dark-bg"></div>
                  <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-white">+42</div>
                  <span className="text-xs text-gray-400 ml-4 font-medium">Going</span>
                </div>
              </div>
            </div>

            {/* Event Card 2 */}
            <div className="min-w-[240px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg group cursor-pointer hover:bg-white/10 transition">
              <div className="h-28 bg-indigo-500/20 relative">
                <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80" alt="Music" className="w-full h-full object-cover mix-blend-overlay" />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-bold">
                  Oct 20
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold mb-1">EDM Night</h3>
                <p className="text-gray-400 text-xs flex items-center gap-1"><MapPin size={12} /> College Ground</p>
                <div className="mt-3 flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-dark-bg"></div>
                  <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-white">+89</div>
                  <span className="text-xs text-gray-400 ml-4 font-medium">Going</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Student Communities */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <Users size={20} className="text-blue-400" /> Study & Chill Rooms
            </h2>
          </div>
          
          <div className="space-y-3 px-2">
            {[
              { name: "Late Night Coders", members: 124, emoji: "💻", active: 12 },
              { name: "Anime Otakus", members: 89, emoji: "🍙", active: 5 },
              { name: "Startup Enthusiasts", members: 56, emoji: "🚀", active: 2 },
              { name: "Guitar Jams", members: 42, emoji: "🎸", active: 8 },
            ].map((room, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-white/10 transition">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-xl">
                    {room.emoji}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">{room.name}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{room.members} members • <span className="text-green-400">{room.active} online</span></p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/40 transition">
                  <ChevronRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}

// Dummy MapPin since lucide-react might complain if not imported here
function MapPin(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
}
