"use client";

import { ArrowLeft, ShieldCheck, Scale, Coins, CreditCard, Lock, Radio, UserCheck, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface-elevated backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-full text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Terms &amp; Conditions <Scale size={18} className="text-primary" />
          </h1>
          <p className="text-xs text-muted">LoveWithYou Platform Agreement</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-secondary text-sm leading-relaxed pb-24 max-w-2xl mx-auto w-full">
        
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 flex items-start gap-3">
          <ShieldCheck className="text-primary shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-foreground text-base">Legal Agreement</h3>
            <p className="text-xs text-rose-200/90 mt-1">
              Please read these terms carefully before accessing LoveWithYou (&quot;Platform&quot;). By creating an account or swiping on the platform, you agree to all terms outlined below.
            </p>
          </div>
        </div>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <UserCheck size={18} className="text-primary" /> 1. Eligibility &amp; Age Limit
          </h2>
          <p>
            Age Restriction: LoveWithYou (including the After-Dark Lounge and Midnight Roulette) is strictly for adults aged 18 and older. By accessing the platform, you warrant that you are legally authorized under Indian law and local jurisdiction to enter into binding agreements. Any user found violating this will face an immediate, permanent device ban with zero refund.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <Lock size={18} className="text-primary" /> 2. Hardware Device Fingerprint Authentication
          </h2>
          <p>
            LoveWithYou utilizes passwordless hardware device fingerprinting (<code className="text-primary font-mono text-xs bg-primary/10 px-1 py-0.5 rounded">device_id</code>) for seamless authentication. Your account is bound to your physical device fingerprint. You are solely responsible for maintaining physical control over your device to prevent unauthorized access to your coin wallet or private chats.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <Coins size={18} className="text-primary" /> 3. Virtual Coins &amp; Transaction Audit Ledger
          </h2>
          <p>
            LoveWithYou operates on a virtual currency model (&quot;Coins&quot;). Coins are a virtual currency used for features like Super Likes, VIP Halos, and Radar Pings.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-muted text-xs mt-2">
            <li>Coins hold no real-world monetary value and cannot be exchanged for fiat currency or cashed out.</li>
            <li>All coin earnings and expenditures are permanently logged in our Supabase Transaction Audit Ledger.</li>
            <li>Verified college students with approved Student IDs enjoy an automatic 50% discount on all coin store packages.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <CreditCard size={18} className="text-primary" /> 4. Razorpay Payment Gateway &amp; Refund Policy
          </h2>
          <p>
            Coin purchases processed via Razorpay (UPI, NetBanking, Credit/Debit Cards) are processed immediately. All purchases of Coin Packs via Razorpay are final and non-refundable, except where required by law. In the event of a failed transaction where money was debited without coins being credited, please contact support with your Razorpay Payment ID for instant manual verification.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <Radio size={18} className="text-primary" /> 5. WebRTC Live Voice Calls &amp; Conduct
          </h2>
          <p>
            During 3-minute Blind Audio Dates and P2P voice sessions, peer-to-peer WebRTC connections stream live microphone audio between users.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-muted text-xs mt-2">
            <li>Mutual &quot;YES&quot; votes are required before profile avatars and real names are unblurred.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" /> 6. Code of Conduct, Anti-Screenshot &amp; Karma System
          </h2>
          <p>
            Every user maintains a dynamic Karma Score (default 100). Zero-Tolerance Policy: Harassment, hate speech, deepfakes, or unsolicited explicit content will result in an instant ban and Karma deduction. 
          </p>
          <p className="mt-2">
            Anti-Screenshot Rule: We employ anti-screenshot mechanisms in private chats. Attempting to bypass this to leak private conversations violates our terms and will result in heavy Karma penalties or account termination.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-border">
          <h2 className="text-foreground font-bold text-base flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" /> 7. SOS Feature Disclaimer
          </h2>
          <p>
            Best-Effort Safety Tool: The &quot;Date Safe Check-in&quot; SOS timer is a supplementary safety tool, not a replacement for emergency services (Police/Ambulance). We do not guarantee 100% delivery of email alerts due to external network factors. Always exercise personal caution when meeting someone offline.
          </p>
        </section>

        <div className="text-center pt-8 pb-4 text-xs text-muted">
          Last Updated: August 2026 • LoveWithYou Legal Compliance
        </div>
      </div>
    </div>
  );
}
