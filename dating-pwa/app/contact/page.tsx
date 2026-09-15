"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Send, ShieldAlert } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-surface-elevated transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-black">Contact & Support</h1>
      </div>

      <div className="p-5 space-y-6">
        {/* Intro */}
        <div className="space-y-2">
          <h2 className="text-2xl font-black leading-tight text-primary">We&apos;re here to help!</h2>
          <p className="text-sm text-muted font-medium">Got a problem, safety concern, or need live support? Reach out to us directly through the official channels below.</p>
        </div>

        {/* Contact Cards */}
        <div className="space-y-4">
          
          {/* Telegram Card */}
          <div className="p-5 rounded-3xl flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-[#0088cc]/10 to-transparent border border-[#0088cc]/20 shadow-lg">
            <div className="w-14 h-14 bg-[#0088cc]/20 text-[#0088cc] rounded-full flex items-center justify-center">
              <Send size={28} className="-ml-1" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Telegram Live Support</h3>
              <p className="text-xs text-muted mb-4 px-4">Fastest way to get help. Chat directly with our live support agents for immediate resolution.</p>
              <Button onClick={handleTelegramClick} className="w-full bg-[#0088cc] hover:bg-[#0077b3] text-white shadow-lg shadow-[#0088cc]/30 font-black rounded-2xl">
                Chat on Telegram
              </Button>
            </div>
          </div>

          {/* Email Card */}
          <div className="p-5 rounded-3xl flex flex-col items-center text-center space-y-4 bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 shadow-lg">
            <div className="w-14 h-14 bg-pink-500/20 text-pink-400 rounded-full flex items-center justify-center">
              <Mail size={28} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Email Support</h3>
              <p className="text-xs text-muted mb-4 px-4">Best for detailed queries, business inquiries, appeals, or sending attachments.</p>
              <Button onClick={handleEmailClick} className="w-full bg-surface-elevated hover:bg-white/10 text-foreground border border-border font-bold rounded-2xl shadow">
                sumit005001@gmail.com
              </Button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 shadow-inner">
          <h4 className="font-bold text-sm flex items-center gap-2 mb-2 text-amber-500">
            <ShieldAlert size={16} /> Why no WhatsApp?
          </h4>
          <p className="text-xs text-amber-500/80 leading-relaxed font-medium">
            To ensure the privacy and safety of our support staff and to prevent spam messaging, we exclusively use Telegram and Email for official support. Both provide secure, private, and efficient ways to resolve your issues.
          </p>
        </div>
      </div>
    </div>
  );
}
