"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, CheckCircle2, Zap, Shield, PlayCircle } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";

const TIERS = [
  {
    name: "Plus",
    price: "₹149/mo",
    color: "bg-blue-500",
    shadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    features: ["Unlimited Swipes", "See who liked you", "Hide Ads"]
  },
  {
    name: "Gold",
    price: "₹399/mo",
    color: "bg-yellow-500",
    shadow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]",
    features: ["Everything in Plus", "5 Super Likes/week", "1 Boost/month", "Unlimited Filters"]
  },
  {
    name: "Platinum",
    price: "₹799/mo",
    color: "bg-gray-200 text-black",
    shadow: "shadow-[0_0_30px_rgba(255,255,255,0.4)]",
    features: ["Everything in Gold", "Priority Messages", "Paid Verification Badge ✓", "See Read Receipts"]
  }
];

export default function PremiumPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>("Gold");
  const [showAdsModal, setShowAdsModal] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-dark-bg overflow-y-auto">
      <div className="p-4 pt-6 flex items-center gap-4 sticky top-0 bg-dark-bg/80 backdrop-blur-md z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Premium <Crown size={20} className="text-yellow-500" />
        </h2>
      </div>

      <div className="px-4 space-y-6 pb-24">
        
        {/* Dynamic Pricing Tiers */}
        <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-4 -mx-4 px-4">
          {TIERS.map(tier => (
            <div 
              key={tier.name}
              onClick={() => setSelectedTier(tier.name)}
              className={`min-w-[280px] snap-center rounded-3xl p-6 border-2 transition-all cursor-pointer ${selectedTier === tier.name ? `border-white ${tier.shadow}` : 'border-white/10 opacity-70 scale-95'} glass`}
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${tier.color}`}>
                <Crown size={24} className={tier.name === 'Platinum' ? 'text-black' : 'text-white'} />
              </div>
              <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
              <p className="text-xl text-white/80 font-medium mb-6">{tier.price}</p>
              
              <ul className="space-y-3">
                {tier.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300 font-medium">
                    <CheckCircle2 size={16} className={tier.name === 'Platinum' ? 'text-white' : 'text-primary-500'} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Button onClick={() => toast(`Upgraded to ${selectedTier}!`, "success")} className="w-full text-lg py-6 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
          Upgrade to {selectedTier}
        </Button>

        {/* Micro Transactions (Boosts & Super Likes) */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center cursor-pointer hover:border-purple-500/50 transition">
            <Zap size={28} className="text-purple-500 mx-auto mb-2" />
            <h4 className="font-bold text-white">Boost Profile</h4>
            <p className="text-[10px] text-gray-400">Be top profile for 30m</p>
            <div className="mt-2 text-sm font-bold bg-white/10 py-1 rounded-full">₹99</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center cursor-pointer hover:border-blue-500/50 transition">
            <Shield size={28} className="text-blue-500 mx-auto mb-2" />
            <h4 className="font-bold text-white">Verified Badge</h4>
            <p className="text-[10px] text-gray-400">Stand out with trust</p>
            <div className="mt-2 text-sm font-bold bg-white/10 py-1 rounded-full">₹249/mo</div>
          </div>
        </div>

        {/* Rewarded Ads for Coins */}
        <div 
          onClick={() => setShowAdsModal(true)}
          className="bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div>
            <h4 className="font-bold text-white flex items-center gap-2"><PlayCircle size={18} className="text-orange-400"/> Watch & Earn</h4>
            <p className="text-xs text-gray-400 mt-1">Watch a short ad to earn 5 Coins</p>
          </div>
          <div className="bg-orange-500 text-white font-bold px-3 py-1.5 rounded-full text-xs">
            Free Coins
          </div>
        </div>

      </div>

      {/* Video Ad Modal */}
      {showAdsModal && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-4">
          <div className="w-full aspect-video bg-gray-900 rounded-xl flex items-center justify-center border border-white/20 mb-8">
            <span className="text-gray-500 animate-pulse">Playing Ad Video... (15s)</span>
          </div>
          <button 
            onClick={() => {
              toast("You earned 5 Coins!", "success");
              setShowAdsModal(false);
            }} 
            className="px-8 py-3 bg-white/20 backdrop-blur-md rounded-full font-bold text-white hover:bg-white/30 transition"
          >
            Skip & Claim Rewards
          </button>
        </div>
      )}

    </div>
  );
}
