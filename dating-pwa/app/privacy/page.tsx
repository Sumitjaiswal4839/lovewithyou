"use client";

import { ArrowLeft, Shield, Lock, Eye, MapPin, Database, Server, Smartphone, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
            Privacy Policy <Shield size={18} className="text-rose-500" />
          </h1>
          <p className="text-xs text-gray-400">Data Protection &amp; Privacy Safeguards</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed pb-24 max-w-2xl mx-auto w-full">
        
        {/* Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-start gap-3">
          <Lock className="text-blue-400 shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-white text-base">Your Privacy Matters</h3>
            <p className="text-xs text-blue-200/90 mt-1">
              LoveWithYou uses end-to-end device security, zero password authentication, and encrypted PostgreSQL storage to protect your identity and personal conversations.
            </p>
          </div>
        </div>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Smartphone size={18} className="text-rose-400" /> 1. Device Identifiers &amp; Hardware Auth
          </h2>
          <p>
            We do not require or collect your password. Accounts are secured using hardware device fingerprinting (<code className="text-rose-300 font-mono text-xs bg-rose-500/10 px-1 py-0.5 rounded">device_id</code>). This hardware token is used solely to authenticate your session with our Go microservices and Supabase PostgreSQL database.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <MapPin size={18} className="text-rose-400" /> 2. GPS Location Coordinates &amp; Radar Sonar
          </h2>
          <p>
            When location permissions are explicitly granted:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-400 text-xs mt-2">
            <li>We collect your exact <code className="text-rose-300 font-mono">latitude</code> and <code className="text-rose-300 font-mono">longitude</code> coordinates to display active singles on the nearby Radar Map.</li>
            <li>City and town locality names are reverse-geocoded via secure OpenStreetMap APIs.</li>
            <li>You can disable location permissions at any time from your device settings or profile.</li>
          </ul>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Database size={18} className="text-rose-400" /> 3. Media &amp; Cloudinary Storage
          </h2>
          <p>
            Profile photos, student verification cards, and chat media are securely processed and hosted via Cloudinary encrypted media servers. We never sell your photos or share them with third-party advertisers.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Cpu size={18} className="text-rose-400" /> 4. WebRTC Audio Streaming Privacy
          </h2>
          <p>
            3-Minute Blind Date voice calls operate on direct peer-to-peer WebRTC connections with encrypted media channels. Microphone audio streams directly between users during active calls and is <strong>never recorded, listened to, or stored</strong> on our servers.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Server size={18} className="text-rose-400" /> 5. Payment Transaction Privacy (Razorpay)
          </h2>
          <p>
            Razorpay processes all coin purchases securely. LoveWithYou never stores your full Credit Card numbers or UPI PINs. We store only anonymized transaction receipts and coin audit ledger entries in our Supabase backend.
          </p>
        </section>

        <section className="space-y-3 bg-white/[0.02] p-5 rounded-2xl border border-white/5">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <Eye size={18} className="text-rose-400" /> 6. Data Rights &amp; Deletion
          </h2>
          <p>
            You retain 100% ownership of your profile. Tapping &quot;Delete Account&quot; in Settings permanently purges your profile, photos, chat history, and coin records from Supabase PostgreSQL tables instantly.
          </p>
        </section>

        <div className="text-center pt-8 pb-4 text-xs text-gray-500">
          Last Updated: August 2026 • LoveWithYou Data Protection Office
        </div>
      </div>
    </div>
  );
}
