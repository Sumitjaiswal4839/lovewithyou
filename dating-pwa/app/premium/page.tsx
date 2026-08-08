"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crown, CheckCircle2, Zap, Shield, PlayCircle, Coins, Gift, Sparkles, Filter, Check, EyeOff, GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useUserStore } from "@/store/useUserStore";

export default function PremiumPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const coins = useUserStore((state) => state.coins);
  const cashbackVault = useUserStore((state) => state.cashbackVault);
  const claimCashback = useUserStore((state) => state.claimCashback);
  const spendCoins = useUserStore((state) => state.spendCoins);
  const addCoins = useUserStore((state) => state.addCoins);
  const profile = useUserStore((state) => state.profile);
  const adFreeEnabled = useUserStore((state) => state.adFreeEnabled);
  const toggleAdFree = useUserStore((state) => state.toggleAdFree);
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const updateMatchPreferences = useUserStore((state) => state.updateMatchPreferences);

  const isStudent = profile?.isStudent || profile?.studentVerificationStatus === 'verified';
  const [selectedTier, setSelectedTier] = useState<string>("Gold");
  const [showAdsModal, setShowAdsModal] = useState(false);

  const TIERS = [
    {
      name: "Plus",
      fullPrice: "₹149/mo",
      studentPrice: "₹75/mo",
      color: "bg-blue-500",
      shadow: "shadow-[0_0_20px_rgba(59,130,246,0.3)]",
      features: ["Unlimited Swipes", "See Who Liked You", "Ad-Free VIP Pass", "10% Coins Cashback"]
    },
    {
      name: "Gold",
      fullPrice: "₹399/mo",
      studentPrice: "₹199/mo",
      color: "bg-yellow-500",
      shadow: "shadow-[0_0_20px_rgba(234,179,8,0.4)]",
      features: ["Everything in Plus", "5 Super Likes/week", "1 Profile Boost/month", "Verified Only Filter 🛡️"]
    },
    {
      name: "Platinum",
      fullPrice: "₹799/mo",
      studentPrice: "₹399/mo",
      color: "bg-gradient-to-r from-rose-500 to-purple-600 text-white",
      shadow: "shadow-[0_0_30px_rgba(244,63,94,0.4)]",
      features: ["Everything in Gold", "Priority Messages", "Blue Diamond Verification Shield ✓", "Zodiac Match Filter 🔮"]
    }
  ];

  const handleClaimCashback = () => {
    const claimed = claimCashback();
    if (claimed > 0) {
      toast(`🎁 Claimed ${claimed} Cashback Coins back into your main wallet!`, "success");
    } else {
      toast("No cashback available right now. Spend coins to earn 10% cashback!", "error");
    }
  };

  const handleRedeemPerk = (cost: number, perkName: string) => {
    if (coins < cost) {
      toast(`Need ${cost} Coins to redeem ${perkName}. Watch ads or earn coins first!`, "error");
      return;
    }
    spendCoins(cost);
    toast(`🎉 Successfully redeemed perk: ${perkName}! (-${cost} Coins)`, "success");
  };

  const handleRazorpayBuyCoins = (coinAmount: number, priceINR: number, packName: string) => {
    const finalPrice = isStudent ? Math.floor(priceINR / 2) : priceINR;
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    // Safety check: prevent accidental charges or broken flows if live keys aren't set
    if (!razorpayKey || razorpayKey.includes("test_LoveWithYouKey")) {
      toast(`⚠️ Pre-Launch Mode: Live Razorpay key not added in Vercel. Adding ${coinAmount} test coins to your account for preview!`, "info");
      addCoins(coinAmount, `Pre-Launch Preview Pack (${packName})`);
      return;
    }

    toast(`Processing ₹${finalPrice} Razorpay checkout for ${packName}...`, "info");

    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if ((window as any).Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        toast("Razorpay SDK failed to load. Check network connection.", "error");
        return;
      }

      const options = {
        key: razorpayKey,
        amount: finalPrice * 100, // amount in paise
        currency: "INR",
        name: "LoveWithYou Dating",
        description: `Purchase ${packName} (${coinAmount} Coins)`,
        image: "/favicon.png",
        handler: async function (response: any) {
          toast(`🎉 Payment Successful! Razorpay Tx ID: ${response.razorpay_payment_id || 'rzp_paid'}`, "success");
          await addCoins(coinAmount, `Bought ${packName} (₹${finalPrice}) via Razorpay`);
        },
        prefill: {
          name: profile?.name || "Single User",
          email: "user@lovewithyou.app",
        },
        theme: {
          color: "#f43f5e",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    });
  };

  return (
    <div className="flex flex-col h-screen bg-[#07050e] text-white overflow-y-auto font-sans pb-24">
      {/* Header */}
      <div className="p-4 pt-6 flex items-center justify-between sticky top-0 bg-[#07050e]/90 backdrop-blur-xl border-b border-white/10 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-xl hover:bg-white/10 text-white transition">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
              VIP &amp; Coin Marketplace <Crown size={20} className="text-amber-400 animate-pulse" />
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">Dynamic perks, cashback &amp; verified filters</p>
          </div>
        </div>

        {/* Dynamic Student Status Badge */}
        {isStudent && (
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1.5 rounded-full border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
            <GraduationCap size={14} className="text-emerald-400" /> 50% STUDENT DISCOUNT
          </span>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* RAZORPAY INSTANT COIN PACKAGES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Coins size={18} className="text-amber-400" /> Buy Coins (Razorpay UPI / Cards)
            </h3>
            <span className="text-xs text-amber-300 font-bold">
              Balance: <span className="font-black text-white">{coins} 🪙</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { amount: 100, price: 99, name: "Starter Pack" },
              { amount: 300, price: 249, name: "Popular Pack" },
              { amount: 800, price: 499, name: "VIP Value Pack" },
              { amount: 2000, price: 999, name: "Ultra Royal Pack" },
            ].map((pack) => {
              const finalP = isStudent ? Math.floor(pack.price / 2) : pack.price;
              return (
                <div
                  key={pack.name}
                  className="bg-white/[0.03] border border-amber-500/30 hover:border-amber-400 rounded-3xl p-4 text-center transition shadow-lg relative overflow-hidden"
                >
                  <div className="text-2xl font-black text-amber-400 mb-1">
                    🪙 {pack.amount}
                  </div>
                  <h4 className="font-bold text-xs text-white">{pack.name}</h4>
                  <div className="text-base font-black text-emerald-400 my-2">
                    ₹{finalP} {isStudent && <span className="text-[10px] text-gray-500 line-through font-normal">₹{pack.price}</span>}
                  </div>
                  <button
                    onClick={() => handleRazorpayBuyCoins(pack.amount, pack.price, pack.name)}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 font-black text-xs text-black transition shadow-md active:scale-95 flex items-center justify-center gap-1"
                  >
                    Buy via Razorpay
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {/* 1. CASHBACK COINS REFUND SYSTEM BANNER */}
        <div className="bg-gradient-to-r from-pink-500/15 via-rose-500/10 to-purple-500/15 border border-rose-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 inline-flex items-center gap-1">
              <Gift size={12} /> 10% Partial Refund System
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              💰 Cashback Coins Vault
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              Earn 10% automatic coin cashback on every purchase or coin action! Accumulated: <span className="text-amber-300 font-black">{cashbackVault} Coins 🪙</span>
            </p>
          </div>

          <button
            onClick={handleClaimCashback}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs shadow-md active:scale-95 transition shrink-0"
          >
            CLAIM CASHBACK ({cashbackVault} 🪙)
          </button>
        </div>

        {/* 2. DYNAMIC PRICING SUBSCRIPTION TIERS (50% OFF FOR STUDENTS) */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Crown size={16} className="text-amber-400" /> Subscription Tiers
            </h3>
            {isStudent && <span className="text-[10px] text-emerald-400 font-bold">50% Student Pricing Applied</span>}
          </div>

          <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar pb-2">
            {TIERS.map(tier => (
              <div
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                className={`min-w-[270px] snap-center rounded-3xl p-5 border-2 transition-all cursor-pointer relative bg-white/[0.03] ${selectedTier === tier.name ? `border-rose-500 ${tier.shadow}` : 'border-white/10 opacity-80 scale-98'}`}
              >
                {isStudent && (
                  <span className="absolute top-4 right-4 text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase">
                    50% Off Student
                  </span>
                )}
                
                <div className={`w-10 h-10 rounded-2xl mb-3 flex items-center justify-center ${tier.color}`}>
                  <Crown size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-black text-white">{tier.name}</h3>
                
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-black text-white">{isStudent ? tier.studentPrice : tier.fullPrice}</span>
                  {isStudent && <span className="text-xs text-gray-500 line-through font-bold">{tier.fullPrice}</span>}
                </div>

                <ul className="space-y-2.5 mb-2">
                  {tier.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                      <CheckCircle2 size={14} className="text-rose-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Button 
            onClick={() => toast(`Upgraded to ${selectedTier} VIP Membership!`, "success")} 
            className="w-full mt-3 text-sm py-4 rounded-2xl font-black bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 text-white shadow-lg shadow-rose-500/25 active:scale-95 transition"
          >
            Upgrade to {selectedTier} ({isStudent ? TIERS.find(t => t.name === selectedTier)?.studentPrice : TIERS.find(t => t.name === selectedTier)?.fullPrice})
          </Button>
        </div>

        {/* 3. COIN MARKETPLACE (TRADE COINS FOR PERKS) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Coins size={16} className="text-amber-400" /> Coin Perks Marketplace
            </h3>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              Wallet: <span className="font-black text-white">{coins} 🪙</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/[0.03] border border-white/10 hover:border-rose-500/40 rounded-3xl p-4 text-center transition shadow-md">
              <Sparkles size={24} className="text-rose-400 mx-auto mb-2 animate-pulse" />
              <h4 className="font-black text-sm text-white">5 Super Likes</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Stand out in swipe decks</p>
              <button 
                onClick={() => handleRedeemPerk(25, "5 Super Likes")}
                className="w-full mt-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-amber-300 border border-white/10"
              >
                Trade 25 🪙
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-purple-500/40 rounded-3xl p-4 text-center transition shadow-md">
              <Zap size={24} className="text-purple-400 mx-auto mb-2 animate-pulse" />
              <h4 className="font-black text-sm text-white">Radar Boost</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Top profile for 30 mins</p>
              <button 
                onClick={() => handleRedeemPerk(40, "30-Min Radar Boost")}
                className="w-full mt-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-amber-300 border border-white/10"
              >
                Trade 40 🪙
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 rounded-3xl p-4 text-center transition shadow-md">
              <Shield size={24} className="text-cyan-400 mx-auto mb-2" />
              <h4 className="font-black text-sm text-white">Blue Diamond Badge</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Trust Shield Pass</p>
              <button 
                onClick={() => handleRedeemPerk(60, "Blue Diamond Verification Shield")}
                className="w-full mt-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-amber-300 border border-white/10"
              >
                Trade 60 🪙
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 rounded-3xl p-4 text-center transition shadow-md">
              <EyeOff size={24} className="text-emerald-400 mx-auto mb-2" />
              <h4 className="font-black text-sm text-white">24H Ad-Free Pass</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Silence all ads</p>
              <button 
                onClick={() => {
                  if (coins >= 80) {
                    spendCoins(80);
                    if (!adFreeEnabled) toggleAdFree();
                    toast("🚫 24-Hour Ad-Free VIP Pass Activated!", "success");
                  } else {
                    toast("Need 80 Coins for Ad-Free Pass!", "error");
                  }
                }}
                className="w-full mt-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-black text-amber-300 border border-white/10"
              >
                Trade 80 🪙
              </button>
            </div>
          </div>
        </div>

        {/* 4. AD-FREE SUBSCRIPTION TIER TOGGLE */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              🚫 Ad-Free Experience Tier
            </h4>
            <p className="text-xs text-gray-400">Silence video ad popups and banner ads across all screens</p>
          </div>
          <button
            onClick={() => {
              toggleAdFree();
              toast(adFreeEnabled ? "Ad-Free Mode Disabled" : "🚫 Ad-Free VIP Mode Activated!", "success");
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition border ${
              adFreeEnabled
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-white/10 text-gray-400 border-white/10"
            }`}
          >
            {adFreeEnabled ? "ACTIVE ✅" : "ENABLE"}
          </button>
        </div>

        {/* 5. PREMIUM FILTERS (VERIFIED ONLY, STUDENTS ONLY, ZODIAC) */}
        <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5 space-y-4 shadow-md">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Filter size={16} className="text-rose-400" /> Premium Matching Filters
            </h4>
            <span className="text-[10px] text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">VIP Feature</span>
          </div>

          <div className="space-y-2.5">
            <button
              onClick={() => {
                updateMatchPreferences({ verifiedOnly: !matchPreferences.verifiedOnly });
                toast(`Verified-Only Filter: ${!matchPreferences.verifiedOnly ? "ON 🛡️" : "OFF"}`, "info");
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition border ${
                matchPreferences.verifiedOnly ? "bg-rose-500/15 border-rose-500/40 text-rose-300" : "bg-black/40 border-white/10 text-gray-400"
              }`}
            >
              <span className="flex items-center gap-2">🛡️ Show Verified Blue Diamond Profiles Only</span>
              {matchPreferences.verifiedOnly && <Check size={16} className="text-rose-400" />}
            </button>

            <button
              onClick={() => {
                updateMatchPreferences({ studentsOnly: !matchPreferences.studentsOnly });
                toast(`Students-Only Filter: ${!matchPreferences.studentsOnly ? "ON 🎓" : "OFF"}`, "info");
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition border ${
                matchPreferences.studentsOnly ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" : "bg-black/40 border-white/10 text-gray-400"
              }`}
            >
              <span className="flex items-center gap-2">🎓 Show Verified College Students Only</span>
              {matchPreferences.studentsOnly && <Check size={16} className="text-emerald-400" />}
            </button>

            <button
              onClick={() => {
                updateMatchPreferences({ zodiacMatchOnly: !matchPreferences.zodiacMatchOnly });
                toast(`Astrology Filter: ${!matchPreferences.zodiacMatchOnly ? "ON 🔮" : "OFF"}`, "info");
              }}
              className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition border ${
                matchPreferences.zodiacMatchOnly ? "bg-purple-500/15 border-purple-500/40 text-purple-300" : "bg-black/40 border-white/10 text-gray-400"
              }`}
            >
              <span className="flex items-center gap-2">🔮 Highest Astrology Zodiac Compatibility First</span>
              {matchPreferences.zodiacMatchOnly && <Check size={16} className="text-purple-400" />}
            </button>
          </div>
        </div>

        {/* Free Ads Reward Section */}
        {!adFreeEnabled && (
          <div
            onClick={() => setShowAdsModal(true)}
            className="bg-white/[0.03] border border-white/10 hover:border-amber-500/30 rounded-3xl p-4 flex items-center justify-between cursor-pointer transition shadow-md"
          >
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <PlayCircle size={18} className="text-amber-400" /> Watch Sponsored Ad
              </h4>
              <p className="text-xs text-gray-400 mt-0.5">Watch a 15s video to claim 5 Free Coins</p>
            </div>
            <div className="badge-gold px-3 py-1.5 rounded-full text-xs font-black">
              Claim 5 🪙
            </div>
          </div>
        )}
      </div>

      {/* Video Ad Modal */}
      {showAdsModal && (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col justify-center items-center p-4">
          <div className="w-full max-w-sm aspect-video bg-black rounded-3xl flex items-center justify-center border border-white/20 mb-6 shadow-2xl relative overflow-hidden">
            <span className="text-rose-300 font-bold text-xs animate-pulse">Playing Rewarded Video Ad... (15s)</span>
          </div>
          <button
            onClick={() => {
              addCoins(5);
              toast("🎉 You claimed 5 Free Coins + 10% Cashback Bonus!", "success");
              setShowAdsModal(false);
            }}
            className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl font-black text-xs text-white shadow-lg shadow-rose-500/30"
          >
            Claim Rewards &amp; Close Ad
          </button>
        </div>
      )}
    </div>
  );
}
