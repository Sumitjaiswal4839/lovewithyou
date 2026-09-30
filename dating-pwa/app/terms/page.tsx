"use client";

import { ArrowLeft, ShieldCheck, Scale, Coins, CreditCard, Lock, Radio, UserCheck, AlertTriangle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-surface/95 backdrop-blur-xl sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-1.5 -ml-1 bg-transparent hover:bg-surface-elevated rounded-xl text-foreground transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              Terms of Service <Scale size={16} className="text-primary" />
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-28 max-w-md mx-auto w-full">
        
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-surface-elevated border border-border flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ShieldCheck className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">User Agreement</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Welcome to LoveWithYou. By accessing our platform, you are agreeing to our community rules and terms. Please review them below.
            </p>
          </div>
        </div>

        {/* Section Template */}
        <div className="space-y-3">
        {[
          {
            icon: UserCheck,
            title: "1. Eligibility & Age",
            content: "LoveWithYou is an 18+ platform. Access to premium features requires age verification. Unauthorized underage access will result in a ban.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            icon: Lock,
            title: "2. Device Authentication",
            content: "We utilize device fingerprinting for passwordless authentication. Your account is bound to your physical device to prevent spam.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Coins,
            title: "3. Coin Economy",
            content: "The platform operates on a virtual currency. Coins hold no real-world monetary value and cannot be withdrawn.",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            icon: CreditCard,
            title: "4. Payments & Refunds",
            content: "All transactions are processed securely. Purchases of virtual coins or premium features are non-refundable.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            icon: AlertTriangle,
            title: "5. Code of Conduct",
            content: "We maintain a zero-tolerance policy for harassment. Anti-Screenshot technology protects private chats. Bypassing these will trigger an auto-ban.",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
          {
            icon: Sparkles,
            title: "6. Identity Verification",
            content: "To guarantee authenticity, our platform utilizes AI facial scanning to detect catfishing. Periodic re-verification may be required.",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
          },
          {
            icon: Radio,
            title: "7. Campus Mode Rules",
            content: "Anonymous Campus posts must adhere to our strict anti-harassment policy. Violations will result in an immediate campus ban.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          }
        ].map((section, idx) => (
          <div key={idx} className="bg-surface-elevated border border-border p-4 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${section.bg}`}>
                <section.icon size={16} className={section.color} />
              </div>
              <h2 className="font-bold text-sm text-foreground">{section.title}</h2>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
        </div>

        <div className="text-center pt-6 flex flex-col items-center">
          <p className="text-[10px] font-bold text-muted uppercase tracking-wider">
            LoveWithYou • Last Updated: Sept 2026
          </p>
        </div>
      </div>
    </div>
  );
}
