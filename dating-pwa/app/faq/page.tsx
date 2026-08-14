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
  },
  {
    category: "Verification",
    question: "How does the AI Catfish Selfie Verification work?",
    answer: "Our advanced AI system scans your real-time selfie and compares it against your profile photos to generate a confidence score. This guarantees that you are interacting with 100% genuine, verified users."
  },
  {
    category: "Features",
    question: "What are Secret Match Arenas?",
    answer: "Secret Match Arenas include exciting gamified discovery modes like the 18+ After-Dark Lounge, Midnight 2v2 Squads, Random Live Chat, and 3-Minute Blind Audio Dates. They offer thrilling new ways to connect beyond the standard swipe!"
  },
  {
    category: "App Navigation",
    question: "Where can I find my matches and likes?",
    answer: "You can seamlessly access all your interactions through the new 'My Connections' sub-nav in the sidebar. Plus, our dedicated Notifications center keeps you instantly updated on all your latest matches and messages."
  },
  {
    category: "Account & Settings",
    question: "What's new in version 5.30.97?",
    answer: "Version 5.30.97 introduces a clean and de-duplicated Settings Suite, a real-time Coin Wallet in the top bar, Campus Hub, transparent Coin Ledger history, and major stability enhancements!"
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
    <div className="flex flex-col min-h-screen bg-[#080512] text-white">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-30 shadow-[0_10px_30px_rgba(168,85,247,0.05)]">
        <button onClick={() => router.back()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all hover:scale-105 active:scale-95">
          <ArrowLeft size={20} className="text-gray-300" />
        </button>
        <div className="text-center" onClick={handleSecretTap}>
          <h1 className="text-lg font-black tracking-wide flex items-center justify-center gap-2">
            HELP CENTER <HelpCircle size={16} className="text-purple-500" />
          </h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Frequently Asked Questions</p>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          
          {/* Header Banner */}
          <div className="text-center mb-6 mt-2 p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-transparent border border-purple-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/30 transition-colors" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25 mb-4">
                <Sparkles size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">How can we assist you?</h2>
              <p className="text-gray-400 text-xs">Clear answers about Coins, Razorpay, WebRTC Audio, and GPS Radar.</p>
            </div>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden transition-colors hover:border-white/10 hover:bg-white/[0.04]">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <div className="flex items-center gap-4 pr-2">
                    <span className="text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded bg-white/5 text-purple-300 border border-purple-500/20 shrink-0">
                      {faq.category}
                    </span>
                    <span className="font-bold text-white text-sm">{faq.question}</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-gray-400 transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
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
                      <div className="p-5 pt-0 text-xs text-gray-400 leading-relaxed border-t border-white/5 mt-2 bg-black/20">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          {/* Support Banner */}
          <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-3xl text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <h3 className="text-white font-black text-lg mb-2 relative z-10">Still have questions?</h3>
            <p className="text-xs text-gray-400 mb-6 relative z-10">Our Enterprise Trust & Safety team is available 24/7.</p>
            <button 
              onClick={() => router.push('/feedback')}
              className="px-8 py-3.5 bg-white text-black hover:bg-gray-200 rounded-full font-black text-xs shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all relative z-10"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="bg-[#080512] border border-white/10 w-full max-w-sm rounded-3xl p-8 relative shadow-2xl">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-5 right-5 text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-4 border border-rose-500/20">
                <Lock size={28} />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight">Restricted Area</h2>
              <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mt-1">Master Override Protocol</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password" /* Hide username as password for security */
                placeholder="Ident"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none focus:border-rose-500 transition-colors"
              />
              <input
                type="password"
                placeholder="Passphrase"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none focus:border-rose-500 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-red-600 rounded-xl font-black text-sm text-white shadow-lg disabled:opacity-50 hover:shadow-rose-500/25 transition-all mt-2"
              >
                {isLoading ? "AUTHENTICATING..." : "AUTHORIZE"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
