"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, HelpCircle, Sparkles, X, Lock, ShieldAlert, MapPin, Coins, Volume2 as Volume2Icon, Map as MapIcon, Heart, Camera, Flame, Users, Settings as SettingsIcon, GraduationCap } from "lucide-react";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

const faqs = [
  {
    tab: "Safety",
    icon: "ShieldAlert",
    question: "How does the login work without an email or password?",
    answer: "We use advanced Device Fingerprinting. Your phone or browser acts as your unique key. Just open the app, and you are securely logged in."
  },
  {
    tab: "Safety",
    icon: "Lock",
    question: "Are my private chats and disappearing snaps really safe?",
    answer: "Yes! We use strict database security rules. Private chats are restricted only to the two matched users. Disappearing snaps self-destruct after 10 seconds and cannot be recovered."
  },
  {
    tab: "Safety",
    icon: "MapPin",
    question: "How does the SOS \"Date Safe Check-in\" work?",
    answer: "Before going on a date, you set a timer (e.g., 2 hours) and provide a friend's email address. If you don't return to the app and confirm you are safe before the timer runs out, our server automatically emails your friend with your last known location."
  },
  {
    tab: "General",
    icon: "HelpCircle",
    question: "Why did my Karma score drop?",
    answer: "Karma points drop if you are reported for bad behavior, ghosting, or if you attempt to take screenshots in private chat rooms. Keep your Karma high to unlock the VIP Golden Halo!"
  },
  {
    tab: "Premium",
    icon: "Coins",
    question: "How do I get more Coins?",
    answer: "You can earn free coins through the Daily Cupid's Slot Machine, by inviting friends, or you can purchase Coin Packs securely via UPI/Cards in our Premium Store."
  },
  {
    tab: "Premium",
    icon: "Sparkles",
    question: "How do Razorpay purchases and 50% Student Discounts work?",
    answer: "You can buy Coin Packs using Razorpay (UPI Apps like Google Pay/PhonePe, Credit/Debit Cards). Verified college students automatically receive a 50% student discount on all packages!"
  },
  {
    tab: "Features",
    icon: "Volume2",
    question: "How do 3-Minute Blind Audio Dates work?",
    answer: "Blind Date pairs you for a live 3-minute voice conversation using peer-to-peer WebRTC audio streaming. Profile photos and true names remain blurred until both participants tap YES for a mutual reveal!"
  },
  {
    tab: "Features",
    icon: "Map",
    question: "How does the Nearby Sonar Radar Map work?",
    answer: "When location permissions are granted, your exact GPS latitude and longitude coordinates are saved to our Supabase database to show active singles near your campus or city on an interactive radar grid."
  },
  {
    tab: "Features",
    icon: "Heart",
    question: "How is the Compatibility Meter calculated?",
    answer: "Instead of random numbers, our Compatibility Meter compares your hobbies and interests with your match. It starts at a base score of 65% and adds 10% for every matching interest (up to 99%)!"
  },
  {
    tab: "Safety",
    icon: "Camera",
    question: "How does the AI Catfish Selfie Verification work?",
    answer: "Our advanced AI system scans your real-time selfie and compares it against your profile photos to generate a confidence score. This guarantees that you are interacting with 100% genuine, verified users."
  },
  {
    tab: "Features",
    icon: "Flame",
    question: "What are Secret Match Arenas?",
    answer: "Secret Match Arenas include exciting gamified discovery modes like the 18+ After-Dark Lounge, Midnight 2v2 Squads, Random Live Chat, and 3-Minute Blind Audio Dates. They offer thrilling new ways to connect beyond the standard swipe!"
  },
  {
    tab: "General",
    icon: "Users",
    question: "Where can I find my matches and likes?",
    answer: "You can seamlessly access all your interactions through the new 'My Connections' sub-nav in the sidebar. Plus, our dedicated Notifications center keeps you instantly updated on all your latest matches and messages."
  },
  {
    tab: "General",
    icon: "Settings",
    question: "What's new in version 1.0.0 ?",
    answer: "Version 5.30.97 introduces a clean and de-duplicated Settings Suite, a real-time Coin Wallet in the top bar, Campus Hub, transparent Coin Ledger history, and major stability enhancements!"
  },
  {
    tab: "Features",
    icon: "GraduationCap",
    question: "What is Campus Mode and how does the Student Verification work?",
    answer: "Campus Mode is an exclusive feature for verified college students. By verifying your student status, you unlock Campus Hub, Anonymous Confessions, Secret Crushes, and an automatic 50% discount on all Coin Store packages."
  }
];


// Helper to map string to icon component
const IconMap: Record<string, React.ElementType> = {
  ShieldAlert, Lock, MapPin, HelpCircle, Coins, Sparkles, 
  Volume2: Volume2Icon, Map: MapIcon, Heart, Camera, Flame, Users, Settings: SettingsIcon, GraduationCap
};

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<string>("General");
  const { toast } = useToast();

  const tabs = ["General", "Safety", "Premium", "Features"];
  const filteredFaqs = faqs.filter(faq => faq.tab === activeTab);

  // Hidden Trigger State
  const tapCountRef = useRef(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Secret 7-Tap Logic
  const handleSecretTap = () => {
    tapCountRef.current += 1;
    if (tapCountRef.current >= 7) {
      setShowAdminModal(true);
      tapCountRef.current = 0;
    }
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    tapTimeoutRef.current = setTimeout(() => { tapCountRef.current = 0; }, 2000);
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
    } catch {
      toast("Connection error.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen text-foreground font-sans bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-surface/95 backdrop-blur-xl sticky top-0 z-30 pt-safe">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()} 
            className="p-1.5 -ml-1 bg-transparent hover:bg-surface-elevated rounded-xl text-foreground transition active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div onClick={handleSecretTap}>
            <h1 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
              FAQ
            </h1>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28 w-full max-w-md mx-auto">
        
        <div className="text-center mb-6 mt-2">
          <h2 className="text-xl font-bold mb-1 tracking-tight text-foreground">Got questions?</h2>
          <p className="text-xs font-medium max-w-[280px] mx-auto leading-relaxed text-muted">
            Can&apos;t find what you&apos;re looking for? <br/> <a href="/contact" className="underline underline-offset-4 transition-colors font-bold mt-1 inline-block text-primary">Chat to our friendly team!</a>
          </p>
        </div>

        {/* Tabs - Mobile Scrollable */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 pb-2 -mx-4 px-4 snap-x">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setOpenIndex(null); }}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all snap-start ${
                activeTab === tab
                  ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                  : 'bg-surface-elevated text-secondary hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="flex flex-col gap-3">
          {filteredFaqs.map((faq, index) => {
            const IconComp = IconMap[faq.icon] || HelpCircle;
            const isOpen = openIndex === index;
            return (
              <div key={index} className="bg-surface-elevated border border-border rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left p-4 gap-3"
                >
                  <div className="flex gap-3 w-full items-center">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconComp size={16} className="text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-snug text-foreground">{faq.question}</h3>
                    </div>
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-300 shrink-0 text-muted ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 ml-[3.25rem]">
                        <p className="text-xs leading-relaxed text-secondary">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          
          {filteredFaqs.length === 0 && (
            <div className="py-10 text-center font-bold text-xs text-muted">
              No FAQs found for this category.
            </div>
          )}
        </div>
      </div>

      {showAdminModal && (
        <div className="fixed inset-0 bg-background/90 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface-elevated border border-border w-full max-w-sm rounded-[2rem] p-8 relative shadow-2xl">
            <button onClick={() => setShowAdminModal(false)} className="absolute top-5 right-5 transition-colors hover:opacity-70 text-muted">
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-4">
                <Lock size={28} className="text-rose-500" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Restricted Area</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest mt-1 text-muted">Master Override Protocol</p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Ident"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-5 py-3.5 text-sm outline-none transition-colors focus:border-primary text-foreground"
              />
              <input
                type="password"
                placeholder="Passphrase"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-5 py-3.5 text-sm outline-none transition-colors focus:border-primary text-foreground"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl font-black text-sm text-white disabled:opacity-50 transition-all mt-2 bg-rose-500 hover:bg-rose-600"
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
