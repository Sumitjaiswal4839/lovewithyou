"use client";

import { ArrowLeft, Shield, Lock, Eye, MapPin, Database, Server, Smartphone, Cpu, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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
              Privacy Policy <Shield size={16} className="text-primary" />
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 pb-28 max-w-md mx-auto w-full">
        
        {/* Banner */}
        <div className="p-5 rounded-2xl bg-surface-elevated flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Lock className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Your Privacy Matters</h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              LoveWithYou uses end-to-end device security and zero password authentication to protect your identity and personal conversations.
            </p>
          </div>
        </div>

        {/* Section Template */}
        <div className="space-y-3">
        {[
          {
            icon: Smartphone,
            title: "1. Device Auth",
            content: "We do not collect passwords. We use secure Device IDs to create a frictionless login. Your identity is cryptographically tied to your device.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            icon: MapPin,
            title: "2. Location & SOS",
            content: "We collect temporary location strictly for the Date Safe SOS feature. This data triggers automated alerts and is never sold.",
            color: "text-rose-500",
            bg: "bg-rose-500/10",
          },
          {
            icon: Database,
            title: "3. Media & Photos",
            content: "Profile photos and 5-second disappearing snaps are processed securely. Media is encrypted to prevent unauthorized access.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            icon: Server,
            title: "4. Financial Data",
            content: "We do not store your credit card or UPI details. All fiat transactions are processed securely via external payment gateways.",
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
          {
            icon: Lock,
            title: "5. Strict Access Control",
            content: "Your private messages and matches are locked behind Row Level Security (RLS). Nobody can access your private chats.",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
          },
          {
            icon: Eye,
            title: "6. Data Deletion",
            content: "You can request full account deletion at any time. Upon deletion, your profile, matches, and chat history are permanently purged.",
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
          },
          {
            icon: Cpu,
            title: "7. WebRTC Audio Streaming",
            content: "Voice calls operate on direct peer-to-peer WebRTC connections. Audio streams directly between users and is never recorded.",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            icon: UserCheck,
            title: "8. AI Biometric Privacy",
            content: "During Catfish Selfie Verification, we do not store biometric templates permanently; data is used strictly for one-time verification.",
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
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
            LoveWithYou • Data Protection Safeguards
          </p>
        </div>
      </div>
    </div>
  );
}
