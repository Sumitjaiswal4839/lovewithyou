"use client";

import { ArrowLeft, ShieldCheck, Scale, Coins, CreditCard, Lock, Radio, UserCheck, AlertTriangle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#080512] text-white">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30 shadow-[0_10px_30px_rgba(226,54,112,0.05)]">
        <button onClick={() => router.back()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black tracking-wide flex items-center justify-center gap-2">
            TERMS OF SERVICE <Scale size={16} className="text-rose-500" />
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Enterprise Agreement</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-28 max-w-3xl mx-auto w-full">
        
        {/* Enterprise Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-rose-500/10 via-purple-500/5 to-transparent border border-rose-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/30 transition-colors" />
          <div className="flex gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/25 shrink-0">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">Legal Agreement</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                Welcome to the LoveWithYou Enterprise Network. By accessing our platform, you are entering into a legally binding contract. Please review our strict compliance policies below.
              </p>
            </div>
          </div>
        </div>

        {/* Section Template */}
        {[
          {
            icon: UserCheck,
            title: "1. Eligibility & Age Verification",
            content: "LoveWithYou is an elite 18+ platform. Access to premium features including the After-Dark Lounge and Midnight Roulette requires strict age verification. Unauthorized underage access will result in an irrevocable hardware ban.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
          },
          {
            icon: Lock,
            title: "2. Zero-Trust Hardware Authentication",
            content: "We utilize advanced device fingerprinting for passwordless, zero-trust authentication. Your account is cryptographically bound to your physical device. Account sharing is strictly prohibited.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
          },
          {
            icon: Coins,
            title: "3. Enterprise Coin Economy",
            content: "The platform operates on a proprietary virtual currency ledger. Coins hold no fiat value. All transactions are immutably logged in our secure Supabase Audit Ledger to prevent fraud.",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
          },
          {
            icon: CreditCard,
            title: "4. Payments & Financial Policy",
            content: "All fiat-to-coin transactions are processed via Razorpay's enterprise gateway. Purchases are strictly non-refundable. Fraudulent chargebacks will result in immediate legal reporting and account termination.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
          },
          {
            icon: AlertTriangle,
            title: "5. Code of Conduct & Anti-Screenshot",
            content: "We maintain a zero-tolerance policy for harassment. Our proprietary Anti-Screenshot technology protects private chats. Bypassing these security measures will trigger an automatic SOS ban.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
          },
          {
            icon: Sparkles,
            title: "6. AI Identity Verification",
            content: "To guarantee 100% authenticity, our platform utilizes military-grade AI facial scanning to detect catfishing and deepfakes. Periodic re-verification may be required to maintain active status.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20"
          }
        ].map((section, idx) => (
          <div key={idx} className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-3xl hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-xl ${section.bg} ${section.border} border`}>
                <section.icon size={18} className={section.color} />
              </div>
              <h2 className="font-bold text-sm tracking-wide">{section.title}</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pl-12">
              {section.content}
            </p>
          </div>
        ))}

        <div className="text-center pt-8 flex flex-col items-center">
          <div className="w-12 h-1 bg-white/10 rounded-full mb-4" />
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            LoveWithYou Enterprise Edition • v6.0.0
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            Protected by advanced cryptographic security.
          </p>
        </div>
      </div>
    </div>
  );
}
