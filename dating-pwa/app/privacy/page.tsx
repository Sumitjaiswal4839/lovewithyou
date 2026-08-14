"use client";

import { ArrowLeft, Shield, Lock, Eye, MapPin, Database, Server, Smartphone, Cpu, UserCheck, Activity } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-[#080512] text-white">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30 shadow-[0_10px_30px_rgba(59,130,246,0.05)]">
        <button onClick={() => router.back()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black tracking-wide flex items-center justify-center gap-2">
            PRIVACY POLICY <Shield size={16} className="text-blue-500" />
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Data Protection Safeguards</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 pb-28 max-w-3xl mx-auto w-full">
        
        {/* Enterprise Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent border border-blue-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-colors" />
          <div className="flex gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Lock className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg tracking-tight">Your Privacy Matters</h3>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                LoveWithYou uses end-to-end device security, zero password authentication, and encrypted PostgreSQL storage to protect your identity and personal conversations.
              </p>
            </div>
          </div>
        </div>

        {/* Section Template */}
        {[
          {
            icon: Smartphone,
            title: "1. Device Identifiers & Hardware Auth",
            content: "We do not collect your passwords. We use secure Device IDs to create a frictionless, anonymous login experience. Your identity is cryptographically tied to your device.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
          },
          {
            icon: MapPin,
            title: "2. Location & Emergency SOS Data",
            content: "We collect temporary location and emergency contact data strictly for the 'Date Safe Check-in' SOS feature. This data triggers automated safety alerts and is never sold for marketing.",
            color: "text-rose-400",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20"
          },
          {
            icon: Database,
            title: "3. Media & Photos",
            content: "Profile photos, student verification cards, and 5-second disappearing snaps are processed via Cloudinary using authenticated uploads to prevent unauthorized access.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
          },
          {
            icon: Server,
            title: "4. Financial Data Privacy",
            content: "We do not store your credit card or UPI details. All fiat transactions are processed securely via Razorpay. We only log your virtual Coin ledger in our secure Supabase backend.",
            color: "text-amber-400",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20"
          },
          {
            icon: Lock,
            title: "5. Strict Access Control (RLS)",
            content: "Your private messages and matches are locked behind enterprise-grade Row Level Security (RLS). Nobody can access your private chats without authorized cryptographic tokens.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20"
          },
          {
            icon: Eye,
            title: "6. Data Rights & Deletion",
            content: "You can request full account deletion at any time. Upon deletion, your profile, matches, and chat history are permanently purged from our active databases in compliance with privacy laws.",
            color: "text-cyan-400",
            bg: "bg-cyan-500/10",
            border: "border-cyan-500/20"
          },
          {
            icon: Cpu,
            title: "7. WebRTC Audio Streaming",
            content: "3-Minute Blind Date voice calls operate on direct peer-to-peer WebRTC connections. Audio streams directly between users and is never recorded, listened to, or stored on our servers.",
            color: "text-orange-400",
            bg: "bg-orange-500/10",
            border: "border-orange-500/20"
          },
          {
            icon: UserCheck,
            title: "8. AI Biometric Privacy",
            content: "During Catfish Selfie Verification, your facial scan generates an instant confidence score. We do not store biometric templates permanently; data is used strictly for one-time verification.",
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
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
            LoveWithYou Data Protection Office • v6.0.0
          </p>
          <p className="text-[10px] text-gray-700 mt-1">
            Compliant with global privacy standards.
          </p>
        </div>
      </div>
    </div>
  );
}
