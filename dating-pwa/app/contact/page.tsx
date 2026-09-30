"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Send, ShieldAlert, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const router = useRouter();

  const handleTelegramClick = () => {
    window.open("https://t.me/sumicetn", "_blank");
  };

  const handleEmailClick = () => {
    window.location.href = "mailto:sumit005001@gmail.com";
  };

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
              Contact & Support
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 max-w-md mx-auto w-full">
        
        {/* Intro */}
        <div className="text-center mb-6 mt-2">
          <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">We're here to help!</h2>
          <p className="text-xs font-medium max-w-[280px] mx-auto leading-relaxed text-muted">
            Got a problem or safety concern? Reach out to us directly through the official channels below.
          </p>
        </div>

        {/* Contact Links */}
        <div className="space-y-4">
          
          <button onClick={handleTelegramClick} className="w-full bg-surface-elevated border border-border p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0088cc]/10 flex items-center justify-center shrink-0">
                <Send size={18} className="text-[#0088cc] -ml-0.5" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-foreground">Telegram Live Support</h3>
                <p className="text-xs text-secondary mt-0.5">Fastest way to get live help</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>

          <button onClick={handleEmailClick} className="w-full bg-surface-elevated border border-border p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center shrink-0">
                <Mail size={18} className="text-pink-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-sm text-foreground">Email Support</h3>
                <p className="text-xs text-secondary mt-0.5">sumit005001@gmail.com</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted" />
          </button>
          
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20">
          <h4 className="font-bold text-sm flex items-center gap-2 mb-2 text-amber-500">
            <ShieldAlert size={16} /> Why no WhatsApp?
          </h4>
          <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
            To ensure the privacy and safety of our support staff and to prevent spam messaging, we exclusively use Telegram and Email for official support.
          </p>
        </div>
      </div>
    </div>
  );
}
