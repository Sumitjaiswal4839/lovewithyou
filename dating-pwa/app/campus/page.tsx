"use client";

import { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Calendar, Users, ChevronRight, Zap, Heart, Flame, Send, MessageCircle, Sparkles, UserPlus, ShieldCheck, ThumbsUp, Tag, Percent, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Confession {
  id: string;
  text: string;
  tag: string;
  time: string;
  likes: number;
  liked: boolean;
}

export default function CampusPage() {
  const router = useRouter();
  const { toast } = useToast();
  const profile = useUserStore((state) => state.profile);
  
  const [activeTab, setActiveTab] = useState<"hub" | "crush" | "confessions">("hub");
  const [crushHandle, setCrushHandle] = useState<string>("");
  const [savedCrushes, setSavedCrushes] = useState<string[]>(["Rohit_Vibe24"]);
  const [newConfessionText, setNewConfessionText] = useState<string>("");
  const [confessionTag, setConfessionTag] = useState<string>("CS Department");

  const [confessions, setConfessions] = useState<Confession[]>([
    { id: "c1", text: "To the girl in denim jacket sitting at the central coffee canteen today: your smile instantly brightened my mood! ☕✨", tag: "Library Hub", time: "2h ago", likes: 24, liked: false },
    { id: "c2", text: "Who was that guy playing guitar during the hostel break? You totally rocked that acoustic solo! 🎸", tag: "Music Society", time: "5h ago", likes: 41, liked: true },
    { id: "c3", text: "Best luck to everyone in Third Year Engineering for tomorrow's lab evaluations! Let's crush this! 🚀", tag: "CS Department", time: "1d ago", likes: 18, liked: false },
  ]);

  // If not a student or not verified, show lock screen with Guidelines
  const isVerifiedStudent = profile?.isStudent && profile?.studentVerificationStatus === 'verified';

  if (!isVerifiedStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg px-6 py-10 text-center font-sans pb-24">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 relative border border-indigo-500/30">
          <GraduationCap size={44} className="text-indigo-400 opacity-80" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-full flex items-center justify-center">
            <Lock size={28} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Campus Mode &amp; Student Perks 🎓</h1>
        <p className="text-gray-400 text-xs mb-6 max-w-xs leading-relaxed">
          Verify your student status to unlock Exclusive Campus Fests, Secret Crushes, and 50% Off Coin Store!
        </p>

        {/* Guidelines Box */}
        <div className="w-full max-w-xs bg-white/5 border border-indigo-500/30 rounded-2xl p-4 text-left space-y-3 mb-6 shadow-xl">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-white/10 pb-2">
            <Percent size={14} className="text-rose-400" /> Student Verification Perks
          </h3>
          
          <div className="flex items-start gap-2.5 text-xs text-gray-300">
            <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">50% Discount on Coins:</span> Automatically unlocked on all Razorpay coin packages.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-gray-300">
            <CheckCircle2 size={16} className="text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Secret Crush Lockbox:</span> Add 3 campus crushes privately with 100% mutual reveal matching.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-gray-300">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white">Anonymous Campus Confessions:</span> Post &amp; read college stories safely.
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/profile')}
          className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold transition text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          Verify Student ID Now
        </button>
      </div>
    );
  }

  const handleAddCrush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!crushHandle.trim()) return;
    if (savedCrushes.length >= 3) {
      toast("You can only keep up to 3 active Secret Crushes at a time!", "error");
      return;
    }
    if (savedCrushes.includes(crushHandle.trim())) {
      toast("User is already in your Secret Crush lock box!", "info");
      return;
    }
    setSavedCrushes((prev) => [...prev, crushHandle.trim()]);
    setCrushHandle("");
    toast(`💘 Added to Secret Crush! If they secretly add your handle too, an instant match unlocks!`, "success");
  };

  const handlePostConfession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfessionText.trim()) return;
    const newEntry: Confession = {
      id: Date.now().toString(),
      text: newConfessionText.trim(),
      tag: confessionTag || "General",
      time: "Just now",
      likes: 1,
      liked: true,
    };
    setConfessions((prev) => [newEntry, ...prev]);
    setNewConfessionText("");
    toast("🔥 Your anonymous campus confession has been published!", "success");
  };

  const toggleLike = (id: string) => {
    setConfessions((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const newLiked = !c.liked;
          return { ...c, liked: newLiked, likes: newLiked ? c.likes + 1 : c.likes - 1 };
        }
        return c;
      })
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg pb-24 overflow-y-auto text-white font-sans">
      {/* Header */}
      <div className="bg-[#080512]/90 p-5 pt-8 sticky top-0 z-20 backdrop-blur-xl border-b border-white/10">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Campus Hub <GraduationCap size={26} className="text-rose-400" />
          </h1>
          <span className="bg-rose-500/15 text-rose-300 px-3 py-1 rounded-full text-[11px] font-bold border border-rose-500/30 flex items-center gap-1 shadow">
            <Zap size={13} /> 50% Student Discount Active
          </span>
        </div>
        <p className="text-gray-400 text-xs">{profile?.campus || "Delhi University Hub"}&apos;s Private Student Circle</p>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mt-4">
          <button
            onClick={() => setActiveTab("hub")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "hub" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <Users size={14} /> Fests &amp; Rooms
          </button>
          <button
            onClick={() => setActiveTab("crush")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "crush" ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart size={14} /> Secret Crush
          </button>
          <button
            onClick={() => setActiveTab("confessions")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "confessions" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30" : "text-gray-400 hover:text-white"
            }`}
          >
            <Flame size={14} /> Confessions
          </button>
        </div>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* TAB 1: HUB & EVENTS */}
          {activeTab === "hub" && (
            <motion.div key="hub" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
              {/* Student Perks Banner */}
              <div className="bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Tag size={24} className="text-pink-400 shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-white">50% Student Discount Active 🎉</h3>
                    <p className="text-[10px] text-gray-300">All Coin Store packages in VIP Store automatically discounted.</p>
                  </div>
                </div>
                <button onClick={() => router.push('/premium')} className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-[10px] rounded-xl shrink-0">
                  Buy Coins
                </button>
              </div>

              {/* Events Section */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <Calendar size={18} className="text-pink-400" /> Upcoming University Fests
                  </h2>
                  <button className="text-indigo-400 text-xs font-bold hover:underline">See All</button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                  <div className="min-w-[240px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition">
                    <div className="h-28 bg-pink-500/20 relative">
                      <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" alt="Fest" className="w-full h-full object-cover mix-blend-overlay" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold">
                        Oct 14 • Auditorium
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-sm mb-1">Tech Symphony &apos;26</h3>
                      <p className="text-gray-400 text-xs">Annual Hackathon &amp; Musical Night</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">S</div>
                          <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">R</div>
                          <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-white">+42</div>
                        </div>
                        <span className="text-[11px] text-indigo-400 font-bold">Register Free</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[240px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition">
                    <div className="h-28 bg-indigo-500/20 relative">
                      <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80" alt="Music" className="w-full h-full object-cover mix-blend-overlay" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-white font-bold">
                        Oct 20 • Campus Ground
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-bold text-sm mb-1">EDM &amp; Glow Night</h3>
                      <p className="text-gray-400 text-xs">Exclusive student IDs entry only</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">K</div>
                          <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-white">+89</div>
                        </div>
                        <span className="text-[11px] text-pink-400 font-bold">RSVP Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Student Communities */}
              <section>
                <h2 className="text-white font-bold text-base flex items-center gap-2 mb-4 px-1">
                  <Users size={18} className="text-blue-400" /> Study &amp; Chill Hangouts
                </h2>
                
                <div className="space-y-3">
                  {[
                    { name: "Late Night Coders", members: 124, emoji: "💻", active: 14, tag: "CS Dept" },
                    { name: "Anime Otakus", members: 89, emoji: "🍙", active: 8, tag: "All Campus" },
                    { name: "Startup & Founders Circle", members: 56, emoji: "🚀", active: 6, tag: "MBA/Tech" },
                    { name: "Acoustic Guitar Jams", members: 42, emoji: "🎸", active: 9, tag: "Arts Hub" },
                  ].map((room, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-white/10 hover:border-indigo-500/30 transition shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-black/60 rounded-xl flex items-center justify-center text-2xl border border-white/10">
                          {room.emoji}
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-sm">{room.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">{room.tag}</span>
                            <span className="text-[11px] text-green-400 font-medium">● {room.active} online</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center hover:bg-indigo-500 text-white transition">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {/* TAB 2: SECRET CRUSH */}
          {activeTab === "crush" && (
            <motion.div key="crush" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              <div className="bg-gradient-to-br from-pink-900/30 via-black/40 to-purple-900/30 border border-pink-500/20 rounded-3xl p-6 text-center shadow-lg relative overflow-hidden">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.5)]">
                  <Heart size={28} className="text-white fill-current animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Secret Crush Matcher 💘</h3>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xs mx-auto">
                  Add up to 3 campus peers privately. <span className="text-pink-400 font-bold">They will never know</span> unless they also add your handle into their box, unlocking a mutual VIP chat!
                </p>

                <form onSubmit={handleAddCrush} className="mt-5 flex gap-2">
                  <input
                    type="text"
                    value={crushHandle}
                    onChange={(e) => setCrushHandle(e.target.value)}
                    placeholder="Enter peer's handle (e.g. Priya_Design24)..."
                    className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-white/20 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-pink-600 hover:bg-pink-500 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition"
                  >
                    <UserPlus size={16} /> Add
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
                  <span>🔒 100% Anonymous Encryption</span>
                  <span className="text-pink-300 font-bold">{savedCrushes.length}/3 Slots Used</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                  🔥 2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">2 Students marked YOU as their secret crush!</h4>
                  <p className="text-[11px] text-gray-400">Keep guessing handles to strike the mutual match!</p>
                </div>
              </div>

              {/* Saved Crushes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Your Active Lock Box</h4>
                {savedCrushes.map((handle, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 font-bold text-sm">
                        {handle[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{handle}</p>
                        <p className="text-[10px] text-gray-400">Status: Waiting for mutual match...</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSavedCrushes(savedCrushes.filter((h) => h !== handle));
                        toast("Removed from secret crushes.", "info");
                      }}
                      className="text-xs font-bold text-gray-500 hover:text-red-400 px-2 py-1 transition"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 3: ANONYMOUS CONFESSIONS */}
          {activeTab === "confessions" && (
            <motion.div key="confessions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Post Confession Form */}
              <form onSubmit={handlePostConfession} className="bg-black/60 border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Flame size={15} /> Post Anonymous Confession
                  </span>
                  <select
                    value={confessionTag}
                    onChange={(e) => setConfessionTag(e.target.value)}
                    className="bg-dark-bg text-gray-300 text-[11px] px-2 py-1 rounded border border-white/20 focus:outline-none"
                  >
                    <option value="CS Department">CS Department</option>
                    <option value="Medical Hub">Medical Hub</option>
                    <option value="Library Circle">Library Circle</option>
                    <option value="Sports & Fests">Sports & Fests</option>
                  </select>
                </div>
                <textarea
                  value={newConfessionText}
                  onChange={(e) => setNewConfessionText(e.target.value)}
                  placeholder="Share a sweet compliment, college story, or secret admirer note... (100% anonymous & safe)"
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 text-white shadow"
                >
                  <Send size={14} /> Post Confession Anonymously
                </button>
              </form>

              {/* Confessions Feed */}
              <div className="space-y-3">
                {confessions.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 hover:bg-white/[0.07] transition">
                    <div className="flex items-center justify-between">
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        📍 {item.tag}
                      </span>
                      <span className="text-[10px] text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">{item.text}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          item.liked ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-white/5 text-gray-400 hover:text-white"
                        }`}
                      >
                        <Heart size={14} className={item.liked ? "fill-current" : ""} /> {item.likes}
                      </button>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-blue-400" /> Verified Peer Post
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
