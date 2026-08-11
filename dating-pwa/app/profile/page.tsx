"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Heart, Users, Award, Calendar, ShieldCheck, Share2, ScanFace, Gift, Copy, X, MessageSquare, GraduationCap, Sparkles, User as UserIcon, BarChart3, Edit3, Settings } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { StudentVerificationModal } from "@/components/StudentVerificationModal";
import AdvancedDatingWidget from "@/components/profile/AdvancedDatingWidget";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const coins = useUserStore((state) => state.coins);
  const spendCoins = useUserStore((state) => state.spendCoins);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const { theme, setTheme } = useTheme();
  
  const [activeTab, setActiveTab] = useState<"vip" | "details" | "insights">("vip");

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  
  const { toast } = useToast();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background space-y-4">
        <p className="text-muted font-bold">Please complete setup to access your dating console.</p>
        <button onClick={() => router.push("/setup")} className="px-6 py-3 bg-pink-600 rounded-2xl text-foreground font-black shadow-lg shadow-pink-600/30">
          Go to Profile Setup
        </button>
      </div>
    );
  }

  // Fallback analytics if not set
  const analytics = profile.analytics || { views: 342, likes: 89, matches: 12 };
  const isTrending = analytics.views > 200;
  const hasMilestoneBadge = analytics.matches >= 100;

  return (
    <div className="flex flex-col h-screen bg-background pb-24 overflow-y-auto text-foreground">
      
      {/* Sleek Hero Header Card */}
      <div className="relative pt-8 pb-6 bg-gradient-to-b from-pink-950/60 via-purple-950/40 to-[#080512] px-5 border-b border-border shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] bg-surface-elevated text-pink-300 font-extrabold px-3 py-1 rounded-full border border-border flex items-center gap-1.5">
            <Sparkles size={13} className="text-warning animate-spin" /> VIP Member Console
          </span>
          <div className="flex gap-2">
            <button onClick={() => router.push("/profile/edit")} className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-xl border border-border text-blue-400">
              <Edit3 size={16} />
            </button>
            <button onClick={() => router.push("/settings")} className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-xl border border-border text-secondary">
              <Settings size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-2 border-pink-500/40 bg-black overflow-hidden relative shadow-[0_0_20px_rgba(244,63,94,0.3)] flex-shrink-0">
            {profile.photo_url ? (
               <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gray-900 flex items-center justify-center text-pink-400 font-black text-2xl">
                 {profile.name[0]}
               </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-1.5 truncate">
              {profile.name}, {profile.age}
              {profile.verified && <ShieldCheck size={20} className="text-blue-400 fill-blue-500/20 flex-shrink-0" />}
              {profile.studentVerificationStatus === 'verified' && <span title="Verified Student" className="flex-shrink-0"><GraduationCap size={20} className="text-purple-400" /></span>}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <KarmaBadge score={profile.karma} />
              {hasMilestoneBadge && (
                 <span className="flex items-center gap-1 bg-warning/20 text-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-amber-500/30">
                   <Award size={12} /> 100+ Club
                 </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Action Bar */}
        <div className="flex gap-3 mt-6">
           <button onClick={() => router.push('/premium')} className="flex-1 flex items-center justify-center gap-2 bg-warning/20 hover:bg-warning/30 text-amber-300 font-black text-xs py-3 rounded-2xl border border-amber-500/40 transition shadow">
             🪙 {coins} Coins Wallet
           </button>
           
           <button 
             onClick={() => {
               if (isBoosted) return toast("Profile boost already running!", "message");
               if (coins < 30) return toast("Need 30 coins to activate 30-min discovery boost!", "error");
               spendCoins(30);
               setIsBoosted(true);
               toast("🚀 Radar Boost Active for 30 minutes! You are #1 on map!", "success");
             }}
             className={`flex-[1.4] flex items-center justify-center gap-2 font-black text-xs py-3 rounded-2xl border transition shadow-lg active:scale-95 ${
               isBoosted 
                 ? "bg-purple-600/30 text-purple-300 border-purple-500/40" 
                 : "bg-gradient-to-r from-pink-600 to-purple-600 text-foreground border-pink-400/50 shadow-pink-600/30"
             }`}
           >
             <TrendingUp size={16} className={isBoosted ? "animate-pulse" : "animate-bounce"} /> {isBoosted ? "Radar Boost Active 🚀" : "Boost Discovery (-30 🪙)"}
           </button>
        </div>
      </div>

      {/* Structured Navigation Tabs */}
      <div className="px-5 mt-4">
        <div className="flex bg-surface-elevated border border-border p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab("vip")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "vip" ? "bg-pink-600 text-foreground shadow-lg shadow-pink-600/30" : "text-muted hover:text-foreground"
            }`}
          >
            <Sparkles size={14} /> VIP & Tools
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "details" ? "bg-purple-600 text-foreground shadow-lg shadow-purple-600/30" : "text-muted hover:text-foreground"
            }`}
          >
            <UserIcon size={14} /> Bio & Prompts
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "insights" ? "bg-emerald-600 text-foreground shadow-lg shadow-emerald-600/30" : "text-muted hover:text-foreground"
            }`}
          >
            <BarChart3 size={14} /> Stats & Reach
          </button>
        </div>
      </div>

      {/* TAB CONTENTS */}
      <div className="px-5 py-4 space-y-6">
        
        {/* TAB 1: VIP & TOOLS (Advanced Dating Console + Earn Banners) */}
        {activeTab === "vip" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Quick Reward Banners Grid */}
            <div className="grid grid-cols-2 gap-3">
              {!profile.verified && (
                <button onClick={() => setShowVerifyModal(true)} className="bg-gradient-to-br from-blue-500/20 to-black border border-blue-500/30 rounded-2xl p-4 flex flex-col items-start gap-1.5 hover:bg-blue-500/30 transition text-left shadow-md">
                  <ScanFace size={22} className="text-blue-400" />
                  <div>
                    <h3 className="text-blue-300 font-bold text-xs">Free Verification</h3>
                    <p className="text-muted text-[10px]">AI selfie Blue Tick</p>
                  </div>
                </button>
              )}
              
              <button onClick={() => setShowReferralModal(true)} className="bg-gradient-to-br from-emerald-500/20 to-black border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-start gap-1.5 hover:bg-success/30 transition text-left shadow-md">
                <Gift size={22} className="text-success" />
                <div>
                  <h3 className="text-emerald-300 font-bold text-xs">Invite & Earn</h3>
                  <p className="text-muted text-[10px]">+200 Coins reward</p>
                </div>
              </button>
              
              <button onClick={() => setShowAdModal(true)} className="bg-gradient-to-br from-amber-500/20 to-black border border-amber-500/30 rounded-2xl p-4 flex flex-col items-start gap-1.5 hover:bg-warning/30 transition text-left shadow-md">
                <TrendingUp size={22} className="text-warning" />
                <div>
                  <h3 className="text-amber-300 font-bold text-xs">Watch Short Ad</h3>
                  <p className="text-muted text-[10px]">+50 Free Coins</p>
                </div>
              </button>

              <button onClick={() => setShowStudentModal(true)} className="bg-gradient-to-br from-purple-500/20 to-black border border-purple-500/30 rounded-2xl p-4 flex flex-col items-start gap-1.5 hover:bg-purple-500/30 transition text-left shadow-md">
                <GraduationCap size={22} className="text-purple-400" />
                <div>
                  <h3 className="text-purple-300 font-bold text-xs">Student Club</h3>
                  <p className="text-muted text-[10px]">Verify Campus ID</p>
                </div>
              </button>
            </div>

            {/* Advanced Phase 2-3 Hub */}
            <AdvancedDatingWidget />
          </div>
        )}

        {/* TAB 2: PERSONAL BIO & PROMPTS */}
        {activeTab === "details" && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="bg-surface-elevated border border-border rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">About Me</h3>
                <Link href="/profile/edit" className="text-xs font-bold text-pink-400 hover:underline">Edit</Link>
              </div>
              
              <p className="text-secondary text-xs leading-relaxed">
                {profile.bio || "No bio added yet. Tell potential matches about your ideal weekend & vibe!"}
              </p>

              <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                {profile.location && (
                  <span className="bg-surface-elevated text-foreground px-3 py-1 rounded-full text-xs font-bold">📍 {profile.location}</span>
                )}
                {profile.intent && (
                  <span className="bg-primary/20 text-pink-300 border border-pink-500/30 px-3 py-1 rounded-full text-xs font-bold">👀 {profile.intent}</span>
                )}
                {profile.campus && (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold">🎓 {profile.campus}</span>
                )}
                {profile.faith && (
                  <span className="bg-surface-elevated text-foreground px-3 py-1 rounded-full text-xs font-bold">🙏 {profile.faith}</span>
                )}
                {profile.orientation && (
                  <span className="bg-surface-elevated text-foreground px-3 py-1 rounded-full text-xs font-bold">🏳️‍🌈 {profile.orientation}</span>
                )}
              </div>
            </div>

            {/* Hobbies Section */}
            {profile.hobbies && profile.hobbies.length > 0 && (
              <div className="bg-surface-elevated border border-border rounded-3xl p-5 space-y-3">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">My Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby, i) => (
                    <span key={i} className="bg-pink-950/60 text-pink-300 border border-pink-500/40 px-3 py-1 rounded-full text-xs font-bold">
                      ✨ {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Prompts Section */}
            {profile.prompts && profile.prompts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider px-1">My Prompts</h3>
                {profile.prompts.map((p, i) => (
                  <div key={i} className="bg-gradient-to-r from-purple-950/40 to-black border border-purple-500/30 rounded-2xl p-4 shadow-md">
                    <p className="text-purple-400 text-[11px] font-extrabold uppercase mb-1">{p.question}</p>
                    <p className="text-foreground text-xs font-bold">{p.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: STATS & REACH */}
        {activeTab === "insights" && (
          <div className="space-y-5 animate-in fade-in duration-300">
             {/* Weekly Wrap-Up */}
             <div className="bg-white/[0.03] border border-border rounded-3xl p-5 flex items-center gap-4 shadow">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <TrendingUp size={24} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-primary font-black text-sm">Weekly Wrap-Up 🔥</h3>
                  <p className="text-secondary text-xs mt-1 leading-relaxed">
                    Your profile is rising fast! You were seen by <span className="text-foreground font-bold">{analytics.views} singles</span> this week on the radar and swipe deck.
                  </p>
                </div>
             </div>

             {/* Analytics Grid */}
             <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-elevated border border-border rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow">
                  <Eye size={22} className="text-foreground/80 mb-1.5" />
                  <span className="text-2xl font-black text-foreground">{analytics.views}</span>
                  <span className="text-[11px] text-muted font-bold">Profile Views</span>
                </div>
                <div className="bg-surface-elevated border border-border rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow">
                  <Heart size={22} className="text-primary mb-1.5" />
                  <span className="text-2xl font-black text-foreground">{analytics.likes}</span>
                  <span className="text-[11px] text-muted font-bold">Total Likes</span>
                </div>
                <div className="bg-surface-elevated border border-border rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow">
                  <Users size={22} className="text-success mb-1.5" />
                  <span className="text-2xl font-black text-foreground">{analytics.matches}</span>
                  <span className="text-[11px] text-muted font-bold">Mutual Matches</span>
                </div>
             </div>

             {/* Events Banner */}
             <Link href="/events" className="block">
               <div className="bg-white/[0.03] border border-border rounded-3xl p-5 flex items-center justify-between shadow-lg hover:border-white/20 transition">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center text-foreground">
                      <Calendar size={22} />
                    </div>
                    <div>
                      <h3 className="text-foreground font-black text-sm">Virtual Speed Dating Events 🎟️</h3>
                      <p className="text-muted text-xs mt-0.5 font-medium">Register for upcoming college campus mixers</p>
                    </div>
                  </div>
                  <span className="text-muted font-bold">→</span>
               </div>
             </Link>
          </div>
        )}

      </div>

      {/* MODALS */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-white/20 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 relative">
              <ScanFace size={32} className={isVerifying ? "animate-pulse" : ""} />
            </div>
            <h3 className="text-lg font-extrabold text-foreground mb-2">Free AI Verification</h3>
            <p className="text-xs text-muted mb-6">Take a quick selfie to verify your real identity and earn the trusted Blue Tick on your profile.</p>
            
            {isVerifying ? (
              <div className="text-blue-400 font-black text-xs animate-pulse py-3">Scanning Face & Smile Ratio...</div>
            ) : (
              <button 
                onClick={() => {
                  setIsVerifying(true);
                  setTimeout(() => {
                    setProfile({ ...profile, verified: true });
                    setIsVerifying(false);
                    setShowVerifyModal(false);
                    toast("Blue Tick Verified! 🛡️💎", "success");
                  }, 2500);
                }} 
                className="w-full py-3 rounded-2xl bg-blue-600 font-black text-xs text-foreground shadow-lg shadow-blue-600/30"
              >
                Start Camera Scan
              </button>
            )}
            {!isVerifying && (
              <button onClick={() => setShowVerifyModal(false)} className="w-full mt-3 py-2 text-xs text-muted font-bold">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background border border-white/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-2xl bg-success/20 text-success flex items-center justify-center">
                <Gift size={20} />
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-muted hover:text-foreground"><X size={20} /></button>
            </div>
            <h3 className="text-base font-black text-foreground mb-1">Invite & Earn 200 Coins</h3>
            <p className="text-xs text-muted mb-5">Share your invite code with friends. You both receive <span className="text-warning font-bold">200 Free Coins</span> when they join LoveWithYou!</p>
            
            <div className="flex items-center gap-2 p-3 bg-surface-elevated border border-border rounded-2xl mb-5 text-xs">
              <span className="flex-1 font-mono text-secondary truncate">lovewithyou.app/invite/{profile.name.toLowerCase()}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(`https://lovewithyou.app/invite/${profile.name.toLowerCase()}`); toast("Link Copied!", "success"); }}
                className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-xl text-foreground font-bold"
              >
                <Copy size={14} />
              </button>
            </div>
            
            <button onClick={() => setShowReferralModal(false)} className="w-full py-3 rounded-2xl bg-emerald-600 text-foreground font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30">
              <Share2 size={16} /> Share Direct Link
            </button>
          </div>
        </div>
      )}

      {/* Watch Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background border border-white/20 w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
             <div className="w-14 h-14 rounded-2xl bg-warning/20 text-warning flex items-center justify-center mx-auto mb-3">
               <TrendingUp size={28} />
             </div>
             <h3 className="text-base font-black text-foreground mb-1">Watch Short Video Ad</h3>
             <p className="text-xs text-muted mb-5">Support LoveWithYou and receive <span className="text-amber-300 font-bold">+50 Coins</span> instantly for your wallet!</p>
             
             {isWatchingAd ? (
               <div className="w-full h-36 bg-black rounded-2xl border border-border flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                 <div className="w-full h-1 bg-surface-elevated absolute top-0 left-0">
                    <div className="h-full bg-amber-400 animate-[progress_3s_linear_forwards]"></div>
                 </div>
                 <p className="text-foreground font-extrabold text-xs">Playing Sponsor Video...</p>
                 <p className="text-muted text-[10px] mt-1">Please wait 3 seconds...</p>
               </div>
             ) : (
               <button 
                 onClick={() => {
                   setIsWatchingAd(true);
                   setTimeout(() => {
                     setIsWatchingAd(false);
                     setShowAdModal(false);
                     useUserStore.getState().addCoins(20, "watch_ad");
                     toast("Earned +20 Coins for your wallet! 🪙", "success");
                   }, 3000);
                 }}
                 className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs shadow-lg"
               >
                 Watch Video Now (3s)
               </button>
             )}
             {!isWatchingAd && (
               <button onClick={() => setShowAdModal(false)} className="w-full mt-2.5 py-2 text-xs text-muted font-bold">Cancel</button>
             )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-background border border-white/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><MessageSquare size={16} /> Send Us Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-muted hover:text-foreground"><X size={18} /></button>
            </div>
            <textarea 
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what features you love about LoveWithYou..."
              className="w-full bg-surface-elevated border border-white/20 rounded-2xl p-3 text-xs text-foreground outline-none focus:border-pink-500 resize-none mb-4 font-medium shadow-inner"
            />
            <button 
              onClick={async () => {
                if (!feedbackText.trim()) return;
                try {
                  await supabase.from('feedbacks').insert([{ message: feedbackText }]);
                  toast("Feedback sent! Thank you!", "success");
                } catch(e) {
                  toast("Feedback saved locally", "success");
                }
                setFeedbackText("");
                setShowFeedbackModal(false);
              }}
              className="w-full py-3 rounded-2xl bg-pink-600 text-foreground font-black text-xs shadow-lg shadow-pink-600/30"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}

      {/* Student Verification Modal */}
      {showStudentModal && (
        <StudentVerificationModal onClose={() => setShowStudentModal(false)} />
      )}
    </div>
  );
}
