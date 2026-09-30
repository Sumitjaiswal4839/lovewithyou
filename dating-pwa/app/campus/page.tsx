"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Calendar, Users, ChevronRight, Zap, Heart, Flame, Send, UserPlus, ShieldCheck, Tag, Percent, CheckCircle2, Plus, X, Crown } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

import { supabase } from "@/lib/supabase";

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
  const authToken = useUserStore((state) => state.authToken);
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";
  
  const [activeTab, setActiveTab] = useState<"hub" | "crush" | "confessions">("hub");
  const [crushHandle, setCrushHandle] = useState<string>("");
  const [savedCrushes, setSavedCrushes] = useState<string[]>(["Rohit_Vibe24"]);
  const [newConfessionText, setNewConfessionText] = useState<string>("");
  const [confessionTag, setConfessionTag] = useState<string>("All / General");

  const [confessions, setConfessions] = useState<Confession[]>([]);
  
  const [studyGroups, setStudyGroups] = useState([
    { id: 1, name: "Late Night Coders", members: 124, emoji: "💻", active: 14, tag: "CS Dept" },
    { id: 2, name: "Anime Otakus", members: 89, emoji: "🍙", active: 8, tag: "All Campus" },
    { id: 3, name: "Startup & Founders Circle", members: 56, emoji: "🚀", active: 6, tag: "MBA/Tech" },
    { id: 4, name: "Acoustic Guitar Jams", members: 42, emoji: "🎸", active: 9, tag: "Arts Hub" },
  ]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupEmoji, setNewGroupEmoji] = useState("✨");
  const [newGroupTag, setNewGroupTag] = useState("General");
  
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [leaderRole, setLeaderRole] = useState("Ambassador");
  const [leaderDept, setLeaderDept] = useState("");
  const [leaderMotiv, setLeaderMotiv] = useState("");

  const isVerifiedStudent = profile?.isStudent && profile?.studentVerificationStatus === 'verified';

  useEffect(() => {
    const fetchConfessions = async () => {
      if (!isVerifiedStudent) return;
      const { data, error } = await supabase
        .from('confessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setConfessions(data.map((c: any) => ({
          id: c.id?.toString() || Math.random().toString(),
          text: c.text,
          tag: c.department_tag || c.campus || "General",
          time: new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          likes: c.likes || 0,
          liked: false,
        })));
      }
    };
    fetchConfessions();
  }, [isVerifiedStudent]);

  // If not a student or not verified, show lock screen with Guidelines

  if (!isVerifiedStudent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-6 py-10 text-center font-sans pb-24">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 relative border border-indigo-500/30">
          <GraduationCap size={44} className="text-indigo-400 opacity-80" />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] rounded-full flex items-center justify-center">
            <Lock size={28} className="text-foreground" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Campus Mode &amp; Student Perks 🎓</h1>
        <p className="text-muted text-xs mb-6 max-w-xs leading-relaxed">
          Verify your student status to unlock Exclusive Campus Fests, Secret Crushes, and 50% Off Coin Store!
        </p>

        {/* Guidelines Box */}
        <div className="w-full max-w-xs bg-surface-elevated border border-indigo-500/30 rounded-2xl p-4 text-left space-y-3 mb-6 shadow-xl">
          <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
            <Percent size={14} className="text-primary" /> Student Verification Perks
          </h3>
          
          <div className="flex items-start gap-2.5 text-xs text-secondary">
            <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">50% Discount on Coins:</span> Automatically unlocked on all Razorpay coin packages.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-secondary">
            <CheckCircle2 size={16} className="text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Secret Crush Lockbox:</span> Add 3 campus crushes privately with 100% mutual reveal matching.
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-secondary">
            <CheckCircle2 size={16} className="text-warning shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Anonymous Campus Confessions:</span> Post &amp; read college stories safely.
            </div>
          </div>
        </div>

        <button 
          onClick={() => router.push('/profile')}
          className="w-full max-w-xs py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-foreground font-bold transition text-sm shadow-[0_0_20px_rgba(99,102,241,0.4)]"
        >
          Verify Student ID Now
        </button>

        {/* DEV BYPASS */}
        <button 
          onClick={() => {
             if (profile) {
               useUserStore.getState().setProfile({
                 ...profile,
                 isStudent: true,
                 studentVerificationStatus: 'verified'
               });
               toast("Dev Bypass: Student mode unlocked!", "success");
             }
          }}
          className="w-full max-w-xs py-3 mt-3 rounded-2xl bg-surface-elevated border border-border text-xs text-muted font-bold hover:text-foreground transition"
        >
          [DEV] Bypass Lock Screen
        </button>
      </div>
    );
  }

  const handleAddCrush = async (e: React.FormEvent) => {
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

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/campus/crush`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ crush_handle: crushHandle.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setSavedCrushes((prev) => [...prev, crushHandle.trim()]);
        setCrushHandle("");
        
        if (data.mutualMatch) {
          toast(`💘 IT'S A MATCH! They added you too! Check your inbox!`, "success");
        } else {
          toast(`💘 Added to Secret Crush! If they secretly add your handle too, an instant match unlocks!`, "success");
        }
      } else {
        toast("Failed to add secret crush.", "error");
      }
    } catch {
      toast("Network error.", "error");
    }
  };

  const handlePostConfession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfessionText.trim()) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/campus/confessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          text: newConfessionText.trim(),
          departmentTag: confessionTag || "General",
        }),
      });

      if (res.ok) {
        const newEntry: Confession = {
          id: Date.now().toString(),
          text: newConfessionText.trim(),
          tag: confessionTag || "General",
          time: "Just now",
          likes: 0,
          liked: false,
        };
        setConfessions((prev) => [newEntry, ...prev]);
        setNewConfessionText("");
        toast("🔥 Your anonymous campus confession has been published!", "success");
      } else {
        toast("Failed to post confession.", "error");
      }
    } catch {
      toast("Network error.", "error");
    }
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
    <div className="flex flex-col min-h-screen max-w-md mx-auto border-x border-border/10 bg-background pb-24 overflow-y-auto text-foreground font-sans relative shadow-2xl">
      {/* Header */}
      <div className="bg-background/90 p-5 pt-8 sticky top-0 z-20 backdrop-blur-xl border-b border-border">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Campus Hub <GraduationCap size={26} className="text-primary" />
          </h1>
          <span className="bg-primary/15 text-primary px-3 py-1 rounded-full text-[11px] font-bold border border-primary/30 flex items-center gap-1 shadow">
            <Zap size={13} /> 50% Student Discount Active
          </span>
        </div>
        <p className="text-muted text-xs">{profile?.campus || "Delhi University Hub"}&apos;s Private Student Circle</p>

        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-surface-elevated p-1 border border-border mt-4">
          <button
            onClick={() => setActiveTab("hub")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "hub" ? "bg-indigo-600 text-foreground shadow-lg shadow-indigo-600/30" : "text-muted hover:text-foreground"
            }`}
          >
            <Users size={14} /> Fests &amp; Rooms
          </button>
          <button
            onClick={() => setActiveTab("crush")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "crush" ? "bg-pink-600 text-foreground shadow-lg shadow-pink-600/30" : "text-muted hover:text-foreground"
            }`}
          >
            <Heart size={14} /> Secret Crush
          </button>
          <button
            onClick={() => setActiveTab("confessions")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === "confessions" ? "bg-amber-600 text-foreground shadow-lg shadow-amber-600/30" : "text-muted hover:text-foreground"
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
                    <h3 className="text-xs font-bold text-foreground">50% Student Discount Active 🎉</h3>
                    <p className="text-[10px] text-secondary">All Coin Store packages in VIP Store automatically discounted.</p>
                  </div>
                </div>
                <button onClick={() => router.push('/premium')} className="px-3 py-1.5 bg-pink-600 hover:bg-primary text-white font-bold text-[10px] rounded-xl shrink-0">
                  Buy Coins
                </button>
              </div>

              {/* Campus Leader Banner */}
              <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-rose-500/20 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Crown size={64} />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40">
                    <Crown size={20} className="text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Become a Campus Leader 👑</h3>
                    <p className="text-[10px] text-secondary">Organize fests, moderate & earn VIP perks!</p>
                  </div>
                </div>
                <button onClick={() => setShowLeaderModal(true)} className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shrink-0 shadow-lg relative z-10 transition">
                  Apply
                </button>
              </div>

              {/* Events Section */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-foreground font-bold text-base flex items-center gap-2">
                    <Calendar size={18} className="text-pink-400" /> Upcoming University Fests
                  </h2>
                  <button className="text-indigo-400 text-xs font-bold hover:underline">See All</button>
                </div>
                
                <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
                  <div className="min-w-[240px] bg-surface-elevated border border-border rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition">
                    <div className="h-28 bg-primary/20 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80" alt="Fest" className="w-full h-full object-cover mix-blend-overlay" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-foreground font-bold">
                        Oct 14 • Auditorium
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-foreground font-bold text-sm mb-1">Tech Symphony &apos;26</h3>
                      <p className="text-muted text-xs">Annual Hackathon &amp; Musical Night</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">S</div>
                          <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">R</div>
                          <div className="w-6 h-6 rounded-full bg-green-500 border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-foreground">+42</div>
                        </div>
                        <span className="text-[11px] text-indigo-400 font-bold">Register Free</span>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-[240px] bg-surface-elevated border border-border rounded-2xl overflow-hidden shadow-lg hover:border-indigo-500/50 transition">
                    <div className="h-28 bg-indigo-500/20 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80" alt="Music" className="w-full h-full object-cover mix-blend-overlay" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-foreground font-bold">
                        Oct 20 • Campus Ground
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-foreground font-bold text-sm mb-1">EDM &amp; Glow Night</h3>
                      <p className="text-muted text-xs">Exclusive student IDs entry only</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex -space-x-2">
                          <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-dark-bg text-[10px] flex items-center justify-center font-bold">K</div>
                          <div className="w-6 h-6 rounded-full bg-error border-2 border-dark-bg flex items-center justify-center text-[8px] font-bold text-foreground">+89</div>
                        </div>
                        <span className="text-[11px] text-pink-400 font-bold">RSVP Now</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Student Communities */}
              <section>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-foreground font-bold text-base flex items-center gap-2">
                    <Users size={18} className="text-blue-400" /> Study &amp; Chill Hangouts
                  </h2>
                  <button 
                    onClick={() => setShowCreateGroup(true)}
                    className="flex items-center gap-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-lg text-[11px] font-bold hover:bg-indigo-500/30 transition"
                  >
                    <Plus size={12} /> New Group
                  </button>
                </div>
                
                <div className="space-y-3">
                  {studyGroups.map((room) => (
                    <div key={room.id} className="bg-surface-elevated border border-border p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-surface-elevated hover:border-indigo-500/30 transition shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-surface-elevated rounded-xl flex items-center justify-center text-2xl border border-border">
                          {room.emoji}
                        </div>
                        <div>
                          <h4 className="text-foreground font-bold text-sm">{room.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-surface-elevated px-2 py-0.5 rounded text-secondary">{room.tag}</span>
                            <span className="text-[11px] text-green-400 font-medium">● {room.active} online</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center hover:bg-indigo-500 hover:text-white text-foreground transition">
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
                  <Heart size={28} className="text-foreground fill-current animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Secret Crush Matcher 💘</h3>
                <p className="text-xs text-secondary leading-relaxed max-w-xs mx-auto">
                  Add up to 3 campus peers privately. <span className="text-pink-400 font-bold">They will never know</span> unless they also add your handle into their box, unlocking a mutual VIP chat!
                </p>

                <form onSubmit={handleAddCrush} className="mt-5 flex gap-2">
                  <input
                    type="text"
                    value={crushHandle}
                    onChange={(e) => setCrushHandle(e.target.value)}
                    placeholder="Enter peer's handle (e.g. Priya_Design24)..."
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-elevated border border-white/20 text-foreground placeholder-gray-500 text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 bg-pink-600 hover:bg-primary font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-pink-600/30 transition"
                  >
                    <UserPlus size={16} /> Add
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted">
                  <span>🔒 100% Anonymous Encryption</span>
                  <span className="text-pink-300 font-bold">{savedCrushes.length}/3 Slots Used</span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="bg-success/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success font-bold shrink-0">
                  🔥 2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-300">2 Students marked YOU as their secret crush!</h4>
                  <p className="text-[11px] text-muted">Keep guessing handles to strike the mutual match!</p>
                </div>
              </div>

              {/* Saved Crushes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted px-1">Your Active Lock Box</h4>
                {savedCrushes.map((handle, index) => (
                  <div key={index} className="bg-surface-elevated border border-border p-3.5 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 border border-pink-500/40 flex items-center justify-center text-pink-300 font-bold text-sm">
                        {handle[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{handle}</p>
                        <p className="text-[10px] text-muted">Status: Waiting for mutual match...</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSavedCrushes(savedCrushes.filter((h) => h !== handle));
                        toast("Removed from secret crushes.", "info");
                      }}
                      className="text-xs font-bold text-muted hover:text-red-400 px-2 py-1 transition"
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
              <form onSubmit={handlePostConfession} className="bg-surface-elevated border border-amber-500/30 rounded-2xl p-4 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-warning flex items-center gap-1.5">
                    <Flame size={15} /> Post Anonymous Confession
                  </span>
                  <select
                    value={confessionTag}
                    onChange={(e) => setConfessionTag(e.target.value)}
                    className="bg-background text-secondary text-[11px] px-2 py-1 rounded border border-white/20 focus:outline-none"
                  >
                    <option value="All / General">All / General</option>
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
                  className="w-full bg-surface-elevated border border-border rounded-xl p-3 text-xs text-foreground placeholder-gray-500 focus:outline-none focus:border-amber-500 resize-none"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-bold rounded-xl text-xs flex items-center justify-center gap-2 text-foreground shadow"
                >
                  <Send size={14} /> Post Confession Anonymously
                </button>
              </form>

              {/* Confessions Feed */}
              <div className="space-y-3">
                {confessions.map((item) => (
                  <div key={item.id} className="bg-surface-elevated border border-border rounded-2xl p-4 space-y-3 hover:bg-white/[0.07] transition">
                    <div className="flex items-center justify-between">
                      <span className="bg-warning/10 border border-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                        📍 {item.tag}
                      </span>
                      <span className="text-[10px] text-muted">{item.time}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed font-medium">{item.text}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <button
                        onClick={() => toggleLike(item.id)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          item.liked ? "bg-error/20 text-red-400 border border-red-500/30" : "bg-surface-elevated text-muted hover:text-foreground"
                        }`}
                      >
                        <Heart size={14} className={item.liked ? "fill-current" : ""} /> {item.likes}
                      </button>
                      <span className="text-[10px] text-muted flex items-center gap-1">
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

      {/* CREATE GROUP MODAL */}
      <AnimatePresence>
        {showCreateGroup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
              <button onClick={() => setShowCreateGroup(false)} className="absolute top-4 right-4 p-1.5 bg-surface-elevated text-muted hover:text-foreground rounded-full transition">
                <X size={16} />
              </button>
              <h3 className="text-base font-black text-foreground mb-4">Create Hangout Group</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-secondary mb-1 block">Group Name</label>
                  <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)} 
                    placeholder="e.g. Design Thinkers" 
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                
                <div className="flex gap-3">
                  <div className="w-1/3">
                    <label className="text-xs font-bold text-secondary mb-1 block">Emoji</label>
                    <input 
                      type="text" 
                      value={newGroupEmoji} 
                      onChange={(e) => setNewGroupEmoji(e.target.value)} 
                      maxLength={2}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-center text-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="w-2/3">
                    <label className="text-xs font-bold text-secondary mb-1 block">Tag / Category</label>
                    <input 
                      type="text" 
                      value={newGroupTag} 
                      onChange={(e) => setNewGroupTag(e.target.value)} 
                      placeholder="e.g. Design"
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if(!newGroupName.trim()) {
                       toast("Group name is required!", "error");
                       return;
                    }
                    const newGroup = {
                      id: Date.now(),
                      name: newGroupName,
                      members: 1,
                      emoji: newGroupEmoji || "✨",
                      active: 1,
                      tag: newGroupTag || "General"
                    };
                    setStudyGroups([newGroup, ...studyGroups]);
                    setNewGroupName("");
                    setNewGroupEmoji("✨");
                    setNewGroupTag("General");
                    setShowCreateGroup(false);
                    toast("✨ Hangout group created successfully!", "success");
                  }}
                  className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs text-white shadow-lg transition"
                >
                  Create & Join
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CAMPUS LEADER MODAL */}
      <AnimatePresence>
        {showLeaderModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface border border-border w-full max-w-sm rounded-3xl p-5 shadow-2xl relative">
              <button onClick={() => setShowLeaderModal(false)} className="absolute top-4 right-4 p-1.5 bg-surface-elevated text-muted hover:text-foreground rounded-full transition">
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-2 mb-4">
                <Crown size={20} className="text-amber-400" />
                <h3 className="text-base font-black text-foreground">Campus Leader Application</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-secondary mb-1 block">Role Interest</label>
                  <select 
                    value={leaderRole}
                    onChange={(e) => setLeaderRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-amber-500"
                  >
                    <option value="Ambassador">Campus Ambassador</option>
                    <option value="Event Organizer">Event Organizer</option>
                    <option value="Community Moderator">Community Moderator</option>
                    <option value="Tech Lead">Tech / Design Lead</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-bold text-secondary mb-1 block">Department / Major</label>
                  <input 
                    type="text" 
                    value={leaderDept} 
                    onChange={(e) => setLeaderDept(e.target.value)} 
                    placeholder="e.g. B.Tech Computer Science" 
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary mb-1 block">Why you?</label>
                  <textarea 
                    value={leaderMotiv} 
                    onChange={(e) => setLeaderMotiv(e.target.value)} 
                    placeholder="I have organized 3 fests and I want to bring a better dating culture..." 
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-elevated border border-border text-foreground text-xs focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>

                <button 
                  onClick={async () => {
                    if(!leaderDept.trim() || !leaderMotiv.trim()) {
                       toast("Please fill all fields!", "error");
                       return;
                    }
                    try {
                      const res = await fetch(`${BACKEND_URL}/api/v1/campus/leader`, {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                          role: leaderRole,
                          department: leaderDept,
                          motivation: leaderMotiv,
                        })
                      });
                      
                      if (res.ok) {
                        toast("👑 Application submitted! Admin will review soon.", "success");
                        setShowLeaderModal(false);
                      } else {
                        toast("Failed to submit application.", "error");
                      }
                    } catch (err) {
                      toast("Network error.", "error");
                    }
                  }}
                  className="w-full py-3 mt-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-2xl font-black text-xs text-white shadow-lg shadow-amber-500/20 transition"
                >
                  Submit Application
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
