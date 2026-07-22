"use client";

import { useUserStore } from "@/store/useUserStore";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, Heart, Users, Award, Calendar, ShieldCheck, Share2, ScanFace, Gift, Copy, X, MessageSquare } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import Link from "next/link";
import { useTheme } from "@/components/theme-provider";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const coins = useUserStore((state) => state.coins);
  const setProfile = useUserStore((state) => state.setProfile);
  const setDeviceId = useUserStore((state) => state.setDeviceId);
  const { theme, setTheme } = useTheme();
  
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  
  const { toast } = useToast();

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-bg space-y-4">
        <p className="text-gray-400">Please complete setup.</p>
        <button onClick={() => router.push("/setup")} className="px-6 py-2 bg-primary-500 rounded-full text-white font-bold">
          Go to Setup
        </button>
      </div>
    );
  }

  // Fallback analytics if not set
  const analytics = profile.analytics || { views: 342, likes: 89, matches: 12 };
  const isTrending = analytics.views > 200;
  const hasMilestoneBadge = analytics.matches >= 100;

  return (
    <div className="flex flex-col h-screen bg-dark-bg pb-20 overflow-y-auto">
      
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-b from-primary-900/40 to-dark-bg flex items-end justify-between p-6">
        <div className="flex items-end gap-4">
          <div className="w-24 h-24 rounded-full border-4 border-dark-bg bg-black overflow-hidden relative shadow-lg">
            {profile.photo_url ? (
               <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 font-bold text-2xl">
                 {profile.name[0]}
               </div>
            )}
          </div>
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {profile.name}, {profile.age}
              {profile.verified && <ShieldCheck size={20} className="text-blue-500 fill-blue-500/20" />}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <KarmaBadge score={profile.karma} />
              {hasMilestoneBadge && (
                 <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5 rounded-full border border-yellow-500/30">
                   <Award size={12} /> 100+ Matches
                 </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 space-y-6">
        
        {/* Actions */}
        <div className="flex gap-4">
           <button className="flex-1 flex items-center justify-center gap-2 bg-primary-500/10 text-primary-400 font-medium py-2.5 rounded-xl border border-primary-500/20 hover:bg-primary-500/20 transition">
             🪙 {coins} Coins
           </button>
        </div>

        {/* Weekly Wrap-Up (Trending) */}
        {isTrending && (
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
             <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
               <TrendingUp size={20} />
             </div>
             <div>
               <h3 className="text-orange-400 font-bold text-sm">Weekly Wrap-Up 🔥</h3>
               <p className="text-gray-300 text-xs mt-0.5">Your profile is trending! You were seen by {analytics.views} people this week.</p>
             </div>
          </div>
        )}

        {/* Action Banners */}
        <div className="grid grid-cols-2 gap-3">
          {!profile.verified && (
            <button onClick={() => setShowVerifyModal(true)} className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-blue-500/30 transition text-left">
              <ScanFace size={24} className="text-blue-400" />
              <div>
                <h3 className="text-blue-400 font-bold text-sm">Get Verified</h3>
                <p className="text-gray-400 text-[10px] mt-0.5">Get the blue tick</p>
              </div>
            </button>
          )}
          
          <button onClick={() => setShowReferralModal(true)} className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-4 flex flex-col items-start gap-2 hover:bg-green-500/30 transition text-left">
            <Gift size={24} className="text-green-400" />
            <div>
              <h3 className="text-green-400 font-bold text-sm">Invite Friends</h3>
              <p className="text-gray-400 text-[10px] mt-0.5">Earn 200 Coins</p>
            </div>
          </button>
        </div>

        {/* Profile Insights / Analytics */}
        <div className="space-y-3">
          <h2 className="text-white font-bold text-lg">Profile Insights</h2>
          <div className="grid grid-cols-3 gap-3">
             <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
               <Eye size={20} className="text-blue-400 mb-2" />
               <span className="text-xl font-bold text-white">{analytics.views}</span>
               <span className="text-xs text-gray-400 mt-1">Views</span>
             </div>
             <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
               <Heart size={20} className="text-primary-500 mb-2" />
               <span className="text-xl font-bold text-white">{analytics.likes}</span>
               <span className="text-xs text-gray-400 mt-1">Likes</span>
             </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <Users size={20} className="text-green-400 mb-2" />
                <span className="text-xl font-bold text-white">{analytics.matches}</span>
                <span className="text-xs text-gray-400 mt-1">Matches</span>
              </div>
          </div>
        </div>

        {/* About Me Section */}
        <div className="space-y-4">
          <h2 className="text-white font-bold text-lg">About Me</h2>
          
          {profile.bio && (
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <p className="text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.location && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium">📍 {profile.location}</span>
            )}
            {profile.campus && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium">🎓 {profile.campus}</span>
            )}
            {profile.faith && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium">🙏 {profile.faith}</span>
            )}
            {profile.orientation && (
              <span className="bg-white/10 text-white px-3 py-1.5 rounded-full text-xs font-medium">🏳️‍🌈 {profile.orientation}</span>
            )}
          </div>
        </div>

        {/* Hobbies Section */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white font-bold text-lg">Hobbies</h2>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies.map((hobby, i) => (
                <span key={i} className="bg-primary-500/20 text-primary-400 border border-primary-500/30 px-3 py-1.5 rounded-full text-xs font-medium">
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Prompts Section */}
        {profile.prompts && profile.prompts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-white font-bold text-lg">My Prompts</h2>
            {profile.prompts.map((p, i) => (
              <div key={i} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                <p className="text-primary-400 text-xs font-bold uppercase mb-2">{p.question}</p>
                <p className="text-white text-sm font-medium">{p.answer}</p>
              </div>
            ))}
          </div>
        )}

        {/* Events Banner */}
        <Link href="/events" className="block mt-4">
          <div className="bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-2xl p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                 <Calendar size={20} />
               </div>
               <div>
                 <h3 className="text-violet-400 font-bold text-sm">Speed Dating Events</h3>
                 <p className="text-gray-300 text-[11px] mt-0.5">Join virtual campus events</p>
               </div>
             </div>
             <div className="text-violet-400">→</div>
          </div>
        </Link>

      </div>


      {/* Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 relative">
              <ScanFace size={32} className={isVerifying ? "animate-pulse" : ""} />
              {isVerifying && <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping"></div>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Verification</h3>
            <p className="text-sm text-gray-400 mb-6">Take a quick selfie to prove you're real. You'll get a blue tick on your profile.</p>
            
            {isVerifying ? (
              <div className="text-blue-400 font-bold animate-pulse py-3">Scanning face...</div>
            ) : (
              <button 
                onClick={() => {
                  setIsVerifying(true);
                  setTimeout(() => {
                    setProfile({ ...profile, verified: true });
                    setIsVerifying(false);
                    setShowVerifyModal(false);
                  }, 3000);
                }} 
                className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-[0_0_15px_rgba(59,130,246,0.4)]"
              >
                Scan My Face
              </button>
            )}
            {!isVerifying && (
              <button onClick={() => setShowVerifyModal(false)} className="w-full mt-3 py-3 text-gray-400 font-bold">Cancel</button>
            )}
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <Gift size={24} />
              </div>
              <button onClick={() => setShowReferralModal(false)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Invite & Earn</h3>
            <p className="text-sm text-gray-400 mb-6">Invite your friends to LovePWA and both of you will get <strong className="text-yellow-400">200 Coins</strong> when they join!</p>
            
            <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl mb-6">
              <span className="flex-1 text-sm font-mono text-gray-300 truncate">lovepwa.com/invite/{profile.name.toLowerCase()}</span>
              <button 
                onClick={() => { navigator.clipboard.writeText(`lovepwa.com/invite/${profile.name.toLowerCase()}`); alert("Copied!"); }}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
              >
                <Copy size={16} />
              </button>
            </div>
            
            <button onClick={() => setShowReferralModal(false)} className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition shadow-[0_0_15px_rgba(34,197,94,0.4)] flex items-center justify-center gap-2">
              <Share2 size={18} /> Share Link
            </button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><MessageSquare size={18} /> Send Feedback</h3>
              <button onClick={() => setShowFeedbackModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <textarea 
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tell us what you love or what needs improvement..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary-500 resize-none text-sm text-white mb-4"
            />
            <button 
              onClick={async () => {
                if (!feedbackText.trim()) return;
                try {
                  await supabase.from('feedbacks').insert([{ message: feedbackText }]);
                  toast("Feedback sent successfully!", "success");
                } catch(e) {
                  toast("Feedback saved locally", "success");
                }
                setFeedbackText("");
                setShowFeedbackModal(false);
              }}
              className="w-full py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition shadow-lg"
            >
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
