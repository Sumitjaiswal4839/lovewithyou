"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Heart, Users, Award, ShieldCheck, Share2, ScanFace, Gift, Copy, X, GraduationCap, Edit3, Settings, ChevronRight } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { StudentVerificationModal } from "@/components/StudentVerificationModal";
import { GetVerifiedModal } from "@/components/GetVerifiedModal";
import AdvancedDatingWidget from "@/components/profile/AdvancedDatingWidget";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { FEATURE_FLAGS } from "@/config/features";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const coins = useUserStore((state) => state.coins);
  const spendCoins = useUserStore((state) => state.spendCoins);
  const deviceId = useUserStore((state) => state.deviceId);
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  const { toast } = useToast();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background space-y-4">
        <p className="text-muted font-bold">Please complete setup to access your profile.</p>
        <button onClick={() => router.push("/setup")} className="px-6 py-3 bg-primary rounded-2xl text-white font-black shadow-lg">
          Go to Setup
        </button>
      </div>
    );
  }

  const analytics = profile.analytics || { views: 342, likes: 89, matches: 12 };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-28 text-foreground font-sans">
      
      {/* Top Header */}
      <div className="flex items-center justify-between h-14 px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border pt-safe">
        <div className="w-8" /> {/* Spacer */}
        <h1 className="text-base font-black tracking-tight">Profile</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push("/profile/edit")} className="p-2 text-foreground hover:bg-surface-elevated rounded-full transition">
            <Edit3 size={18} />
          </button>
          <button onClick={() => router.push("/settings")} className="p-2 text-foreground hover:bg-surface-elevated rounded-full transition">
            <Settings size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* Profile Info (Centered) */}
        <div className="flex flex-col items-center pt-8 pb-6 px-4 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-10 w-48 h-48 rounded-full bg-primary/20 blur-3xl -z-10" />
          
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full border-[3px] border-surface-elevated p-1 shadow-2xl relative z-10 bg-background">
              <div className="w-full h-full rounded-full overflow-hidden bg-surface-elevated">
                { }
                {profile.photo_url ? (
                   <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full flex items-center justify-center text-primary font-black text-3xl">
                     {profile?.name?.[0] || "?"}
                   </div>
                )}

              </div>
            </div>
            
            {/* Badges Floating */}
            {profile.verified && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full border-2 border-background flex items-center justify-center shadow-lg z-20">
                <ShieldCheck size={16} className="text-white" />
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-black flex items-center gap-2">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-sm font-medium text-muted mt-1 text-center max-w-[250px] truncate">
            {profile.campus || profile.location || "Looking for connections"}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <KarmaBadge score={profile.karma} />
            {profile.studentVerificationStatus === 'verified' && (
              <span className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <GraduationCap size={12} /> Campus Verified
              </span>
            )}
          </div>
          
          <button 
            onClick={() => router.push(`/user/${deviceId || 'me'}`)}
            className="mt-5 flex items-center justify-center gap-2 px-6 py-2.5 bg-surface-elevated border border-border hover:border-primary/50 text-foreground rounded-full font-black text-xs transition active:scale-95 shadow-sm group"
          >
            <Eye size={16} className="text-primary group-hover:scale-110 transition-transform" /> Preview Public Profile
          </button>
        </div>

        {/* Floating Stats Row */}
        <div className="px-4 mb-8">
          <div className="flex bg-surface-elevated border border-border rounded-3xl p-1 shadow-lg divide-x divide-border">
            <div className="flex-1 py-3 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-foreground">{analytics.views}</span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1"><Eye size={10} /> Views</span>
            </div>
            <div className="flex-1 py-3 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-foreground">{analytics.likes}</span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1"><Heart size={10} /> Likes</span>
            </div>
            <div className="flex-1 py-3 flex flex-col items-center justify-center">
              <span className="text-lg font-black text-foreground">{analytics.matches}</span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1"><Users size={10} /> Matches</span>
            </div>
          </div>
        </div>

        {/* Main Content Sections */}
        <div className="px-4 space-y-8">
          
          {/* Action Hub */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">Power Ups</h3>
            
            <button 
              onClick={() => {
                if (isBoosted) return toast("Profile boost already running!", "message");
                if (coins < 30) return toast("Need 30 coins to activate 30-min discovery boost!", "error");
                spendCoins(30);
                setIsBoosted(true);
                toast("🚀 Radar Boost Active for 30 minutes! You are #1 on map!", "success");
              }}
              className="w-full bg-surface-elevated border border-border p-4 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition shadow-md relative overflow-hidden"
            >
              {isBoosted && <div className="absolute inset-0 bg-primary/5 animate-pulse" />}
              <div className="flex items-center gap-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isBoosted ? 'bg-primary/20 text-primary' : 'bg-gradient-to-br from-primary to-rose-500 text-white shadow-lg shadow-primary/30'}`}>
                  <TrendingUp size={20} className={isBoosted ? "animate-pulse" : ""} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-sm text-foreground">{isBoosted ? "Radar Boost Active" : "Boost Discovery"}</h4>
                  <p className="text-xs text-secondary mt-0.5">{isBoosted ? "You are #1 on the map right now" : "Get 10x more profile views (-30 🪙)"}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted relative z-10" />
            </button>

            <button onClick={() => router.push('/premium')} className="w-full bg-surface-elevated border border-border p-4 rounded-[2rem] flex items-center justify-between group active:scale-[0.98] transition shadow-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Award size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-sm text-foreground">Coin Wallet</h4>
                  <p className="text-xs text-secondary mt-0.5">Balance: <span className="font-bold text-amber-500">{coins} Coins</span></p>
                </div>
              </div>
              <ChevronRight size={20} className="text-muted" />
            </button>
          </div>

          {/* Quick Tools Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground px-1">Earn & Verify</h3>
            <div className="grid grid-cols-2 gap-3">
              {!profile.verified && (
                <button onClick={() => setShowVerifyModal(true)} className="bg-surface-elevated border border-border rounded-[1.5rem] p-4 flex flex-col items-start gap-3 hover:bg-surface-elevated/80 transition text-left shadow-sm active:scale-95">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <ScanFace size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[13px] text-foreground">Get Verified</h4>
                    <p className="text-muted text-[10px] mt-0.5">Free AI Selfie Scan</p>
                  </div>
                </button>
              )}
              
              <button onClick={() => setShowReferralModal(true)} className="bg-surface-elevated border border-border rounded-[1.5rem] p-4 flex flex-col items-start gap-3 hover:bg-surface-elevated/80 transition text-left shadow-sm active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                  <Gift size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-foreground">Invite & Earn</h4>
                  <p className="text-muted text-[10px] mt-0.5">+200 Coins Reward</p>
                </div>
              </button>
              
              <button 
                onClick={() => {
                  if (FEATURE_FLAGS.MAINTENANCE_WATCH_AD) {
                    toast("Coming soon! 🚧 Due to ad credentials setup, this is under maintenance.", "message");
                    return;
                  }
                  setShowAdModal(true);
                }} 
                className={`bg-surface-elevated border border-border rounded-[1.5rem] p-4 flex flex-col items-start gap-3 transition text-left shadow-sm ${FEATURE_FLAGS.MAINTENANCE_WATCH_AD ? 'opacity-70 cursor-not-allowed' : 'hover:bg-surface-elevated/80 active:scale-95'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-foreground flex items-center gap-2">
                    Watch Ad
                    {FEATURE_FLAGS.MAINTENANCE_WATCH_AD && <span className="bg-rose-500/10 text-rose-500 text-[9px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-black">Maintenance</span>}
                  </h4>
                  <p className="text-muted text-[10px] mt-0.5">{FEATURE_FLAGS.MAINTENANCE_WATCH_AD ? "Temporarily Disabled" : "+50 Free Coins"}</p>
                </div>
              </button>

              <button onClick={() => setShowStudentModal(true)} className="bg-surface-elevated border border-border rounded-[1.5rem] p-4 flex flex-col items-start gap-3 hover:bg-surface-elevated/80 transition text-left shadow-sm active:scale-95">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-foreground">Student Club</h4>
                  <p className="text-muted text-[10px] mt-0.5">Verify Campus ID</p>
                </div>
              </button>
            </div>
          </div>

          {/* Advanced Dating Widget */}
          <div className="space-y-3 pb-6">
             <h3 className="text-sm font-bold text-foreground px-1">Match & Safety Suite</h3>
             <AdvancedDatingWidget />
          </div>

        </div>
      </div>

      {/* MODALS */}

      {/* Get Verified Modal — Full AI Pipeline */}
      {showVerifyModal && <GetVerifiedModal onClose={() => setShowVerifyModal(false)} />}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border w-full max-w-sm rounded-[2rem] p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Gift size={24} />
              </div>
              <button onClick={() => setShowReferralModal(false)} className="p-2 text-muted hover:text-foreground"><X size={20} /></button>
            </div>
            <h3 className="text-lg font-black text-foreground mb-1">Invite & Earn 200 Coins</h3>
            <p className="text-sm text-secondary mb-6 leading-relaxed">Share your invite code with friends. You both receive <span className="text-amber-500 font-bold">200 Free Coins</span> when they join!</p>
            
            <div className="flex items-center gap-3 p-4 bg-background border border-border rounded-2xl mb-6">
              <span className="flex-1 font-mono text-xs text-foreground truncate">lovewithyou.app/invite/{profile?.name?.toLowerCase() || 'user'}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(`https://lovewithyou.app/invite/${profile?.name?.toLowerCase() || 'user'}`); toast("Link Copied!", "success"); }}
                className="p-2.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-xl text-foreground font-bold transition"
              >
                <Copy size={16} />
              </button>
            </div>
            
            <button 
              onClick={async () => {
                const inviteLink = `https://lovewithyou.app/invite/${profile?.name?.toLowerCase() || 'user'}`;
                if (navigator.share) {
                  try {
                    await navigator.share({
                      title: 'Join LoveWithYou',
                      text: 'Join me on LoveWithYou and get 200 free coins!',
                      url: inviteLink,
                    });
                  } catch (err) {
                    console.error("Error sharing:", err);
                  }
                } else {
                  navigator.clipboard.writeText(inviteLink);
                  toast("Link Copied!", "success");
                }
                setShowReferralModal(false);
              }} 
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              <Share2 size={18} /> Share Direct Link
            </button>
          </div>
        </div>
      )}

      {/* Watch Ad Modal */}
      {showAdModal && (
        <div className="fixed inset-0 z-50 bg-background/90 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border w-full max-w-sm rounded-[2rem] p-6 text-center shadow-2xl">
             <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
               <TrendingUp size={28} />
             </div>
             <h3 className="text-lg font-black text-foreground mb-1">Watch Short Video Ad</h3>
             <p className="text-sm text-secondary mb-6 leading-relaxed">Support LoveWithYou and receive <span className="text-amber-500 font-bold">+50 Coins</span> instantly for your wallet!</p>
             
             {isWatchingAd ? (
               <div className="w-full h-40 bg-background rounded-2xl border border-border flex flex-col items-center justify-center mb-4 relative overflow-hidden">
                 <div className="w-full h-1 bg-surface-elevated absolute top-0 left-0">
                    <div className="h-full bg-amber-500 animate-[progress_3s_linear_forwards]"></div>
                 </div>
                 <p className="text-foreground font-extrabold text-sm mb-1">Playing Sponsor Video...</p>
                 <p className="text-muted text-xs">Please wait 3 seconds...</p>
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
                 className="w-full py-4 rounded-2xl bg-amber-500 text-white font-black text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition"
               >
                 Watch Video Now (3s)
               </button>
             )}
             {!isWatchingAd && (
               <button onClick={() => setShowAdModal(false)} className="w-full mt-4 py-2 text-sm text-muted font-bold hover:text-foreground transition">Cancel</button>
             )}
          </div>
        </div>
      )}

      {/* Student Verification Modal */}
      {showStudentModal && <StudentVerificationModal onClose={() => setShowStudentModal(false)} />}
    </div>
  );
}
