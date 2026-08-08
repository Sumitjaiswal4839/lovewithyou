"use client";

import { ArrowLeft, ShieldCheck, Scale, Coins, CreditCard, Lock, Radio, UserCheck, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Terms &amp; Conditions <Scale size={18} className="text-rose-500" />
          </h1>
          <p className="text-xs text-gray-400">LoveWithYou Platform Agreement</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed pb-24 max-w-2xl mx-auto w-full">
        
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 flex items-start gap-3">
          <ShieldCheck className="text-rose-400 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-white text-base">Legal Agreement</h3>
            <p className="text-xs text-rose-200/90 mt-1">
              Please read these terms carefully before accessing LoveWithYou (&quot;Platform&quot;). By creating an account or swiping on the platform, you agree to all terms outlined below.
            </p>
          </div>
        </div>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <UserCheck size={18} className="text-rose-400" /> 1. Eligibility &amp; Age Limit
          </h2>
          <p>
            You must be at least 18 years of age to access or use LoveWithYou. By accessing the platform, you warrant that you are legally authorized under Indian law and local jurisdiction to enter into binding agreements. Accounts suspected of underage usage will be permanently terminated with zero refund.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Lock size={18} className="text-rose-400" /> 2. Hardware Device Fingerprint Authentication
          </h2>
          <p>
            LoveWithYou utilizes passwordless hardware device fingerprinting (<code className="text-rose-300 font-mono text-xs bg-rose-500/10 px-1 py-0.5 rounded">device_id</code>) for seamless authentication. Your account is bound to your physical device fingerprint. You are solely responsible for maintaining physical control over your device to prevent unauthorized access to your coin wallet or private chats.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Coins size={18} className="text-rose-400" /> 3. Virtual Coins &amp; Transaction Audit Ledger
          </h2>
          <p>
            LoveWithYou operates on a virtual currency model (&quot;Coins&quot;). Coins are used to unlock premium flirt features, secret crushes, 3-minute blind voice calls, and direct matches.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs mt-2">
            <li>Coins have no real-world monetary value and cannot be exchanged for fiat currency.</li>
            <li>All coin earnings and expenditures are permanently logged in our Supabase Transaction Audit Ledger.</li>
            <li>Verified college students with approved Student IDs enjoy an automatic 50% discount on all coin store packages.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <CreditCard size={18} className="text-rose-400" /> 4. Razorpay Payment Gateway &amp; Refund Policy
          </h2>
          <p>
            Coin purchases processed via Razorpay (UPI, NetBanking, Credit/Debit Cards) are processed immediately. All payment sales are final and non-refundable once coins are credited to your device account. In the event of a failed transaction where money was debited without coins being credited, please contact support with your Razorpay Payment ID for instant manual verification.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Radio size={18} className="text-rose-400" /> 5. WebRTC Live Voice Calls &amp; Conduct
          </h2>
          <p>
            During 3-minute Blind Audio Dates and P2P voice sessions, peer-to-peer WebRTC connections stream live microphone audio between users.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-400 text-xs mt-2">
            <li>Harassment, abusive language, non-consensual sexual speech, or recording call audio is strictly prohibited.</li>
            <li>Mutual &quot;YES&quot; votes are required before profile avatars and real names are unblurred.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" /> 6. Code of Conduct &amp; Karma System
          </h2>
          <p>
            Every user maintains a dynamic Karma Score (default 100). Harassment, screenshotting private media, fake profiles, or spamming will result in immediate Karma deductions, temporary bans, or permanent device bans without refund.
          </p>
        </section>

        <div className="text-center pt-8 pb-4 text-xs text-gray-500">
          Last Updated: August 2026 • LoveWithYou Legal Compliance
        </div>
      </div>
    </div>
  );
}
