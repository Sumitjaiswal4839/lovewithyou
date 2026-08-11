"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, HelpCircle, Sparkles, Coins, ShieldCheck, Radio, MapPin, CreditCard, X, Lock } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

const faqs = [
  {
    category: "Security & Auth",
    question: "How does the login work without an email or password?",
    answer: "We use advanced Device Fingerprinting. Your phone or browser acts as your unique key. Just open the app, and you are securely logged in."
  },
  {
    category: "Chat Privacy",
    question: "Are my private chats and disappearing snaps really safe?",
    answer: "Yes! We use strict database security rules. Private chats are restricted only to the two matched users. Disappearing snaps self-destruct after 10 seconds and cannot be recovered."
  },
  {
    category: "Safety",
    question: "How does the SOS \"Date Safe Check-in\" work?",
    answer: "Before going on a date, you set a timer (e.g., 2 hours) and provide a friend's email address. If you don't return to the app and confirm you are safe before the timer runs out, our server automatically emails your friend with your last known location."
  },
  {
    category: "Safety",
    question: "Why did my Karma score drop?",
    answer: "Karma points drop if you are reported for bad behavior, ghosting, or if you attempt to take screenshots in private chat rooms. Keep your Karma high to unlock the VIP Golden Halo!"
  },
  {
    category: "Monetization & Coins",
    question: "How do I get more Coins?",
    answer: "You can earn free coins through the Daily Cupid's Slot Machine, by inviting friends, or you can purchase Coin Packs securely via UPI/Cards in our Premium Store."
  },
  {
    category: "Payments",
    question: "How do Razorpay purchases and 50% Student Discounts work?",
    answer: "You can buy Coin Packs using Razorpay (UPI Apps like Google Pay/PhonePe, Credit/Debit Cards). Verified college students automatically receive a 50% student discount on all packages!"
  },
  {
    category: "Voice Dates",
    question: "How do 3-Minute Blind Audio Dates work?",
    answer: "Blind Date pairs you for a live 3-minute voice conversation using peer-to-peer WebRTC audio streaming. Profile photos and true names remain blurred until both participants tap YES for a mutual reveal!"
  },
  {
    category: "Radar & GPS",
    question: "How does the Nearby Sonar Radar Map work?",
    answer: "When location permissions are granted, your exact GPS latitude and longitude coordinates are saved to our Supabase database to show active singles near your campus or city on an interactive radar grid."
  },
  {
    category: "Gamification",
    question: "How is the Compatibility Meter calculated?",
    answer: "Instead of random numbers, our Compatibility Meter compares your hobbies and interests with your match. It starts at a base score of 65% and adds 10% for every matching interest (up to 99%)!"
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { toast } = useToast();
  
  // Hidden Trigger State
  const [tapCount, setTapCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Secret 7-Tap Logic
  const handleSecretTap = () => {
    setTapCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 7) {
        setShowAdminModal(true);
        return 0;
      }
      return newCount;
    });

    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => setTapCount(0), 2000);
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast("Access Granted. Welcome Master.", "success");
        setShowAdminModal(false);
        router.push("/admin"); 
      } else {
        toast(data.error || "Access Denied.", "error");
      }
    } catch (err) {
      toast("Connection error.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface-elevated backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-surface-elevated hover:bg-surface-elevated rounded-full text-foreground transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Frequently Asked Questions 
            <HelpCircle 
              size={18} 
              className="text-primary cursor-pointer select-none" 
              onClick={handleSecretTap}
            />
          </h1>
          <p className="text-xs text-muted">Everything you need to know about LoveWithYou</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          
          {/* Header Banner */}
          <div className="text-center mb-6 mt-2 p-6 rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border border-border">
            <Sparkles size={32} className="text-primary mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-foreground mb-1">How can we help?</h2>
            <p className="text-muted text-xs">Clear answers about Coins, Razorpay, WebRTC Audio, and GPS Radar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/[0.02] border border-border rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                      {faq.category}
                    </span>
                    <span className="font-semibold text-foreground text-sm">{faq.question}</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-primary transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-xs text-secondary leading-relaxed border-t border-border mt-2 bg-white/[0.01]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/20 to-pink-500/20 border border-primary/30 rounded-3xl text-center">
            <h3 className="text-foreground font-bold mb-1">Still have questions?</h3>
            <p className="text-xs text-secondary mb-4">Our Trust &amp; Safety team is available 24/7.</p>
            <button 
              onClick={() => router.push('/feedback')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-pink-600 text-white rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-transform"
            >
              Send Support Message 💬
            </button>
          </div>
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-black/90 border border-white/20 w-full max-w-sm rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-3">
                <Lock size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Restricted Area</h2>
              <p className="text-xs text-gray-400">Master override protocol.</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Ident (Optional for Master)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              />
              <input
                type="password"
                placeholder="Passphrase"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl font-bold text-sm text-white shadow-lg disabled:opacity-50"
              >
                {isLoading ? "Authenticating..." : "Authorize"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
