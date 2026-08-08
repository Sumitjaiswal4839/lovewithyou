"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, HelpCircle, Sparkles, Coins, ShieldCheck, Radio, MapPin, CreditCard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "Security & Auth",
    question: "How does passwordless hardware device authentication work?",
    answer: "LoveWithYou does not use passwords or emails that can be leaked. Your account is bound directly to your physical hardware device fingerprint (device_id). When you open the app, you are instantly authenticated securely!"
  },
  {
    category: "Monetization & Coins",
    question: "How do Coins and the Coin History Ledger work?",
    answer: "Coins are used to unlock secret crushes, send super likes, unblur profiles, and join 3-minute blind audio dates. Every coin earned, spent, or purchased is logged in your transparent Coin Audit Ledger."
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
    category: "Chat Privacy",
    question: "Are private 1-on-1 chats secure?",
    answer: "Yes! Private chats connect directly through isolated WebSocket room IDs (room_id). Only you and your match can send and receive messages within your room."
  },
  {
    category: "Gamification",
    question: "How is the Compatibility Meter calculated?",
    answer: "Instead of random numbers, our Compatibility Meter compares your hobbies and interests with your match. It starts at a base score of 65% and adds 10% for every matching interest (up to 99%)!"
  },
  {
    category: "Safety",
    question: "Why is screenshotting blocked and how does Karma work?",
    answer: "Screenshotting private chats and photos is blocked to prevent harassment. Every user has a dynamic Karma score (default 100). Polite interactions increase Karma, while abusive behavior leads to deductions and device bans."
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-20">
        <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Frequently Asked Questions <HelpCircle size={18} className="text-rose-500" />
          </h1>
          <p className="text-xs text-gray-400">Everything you need to know about LoveWithYou</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          
          {/* Header Banner */}
          <div className="text-center mb-6 mt-2 p-6 rounded-3xl bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-pink-500/10 border border-white/10">
            <Sparkles size={32} className="text-rose-400 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-white mb-1">How can we help?</h2>
            <p className="text-gray-400 text-xs">Clear answers about Coins, Razorpay, WebRTC Audio, and GPS Radar.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden transition-colors hover:border-white/20">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                >
                  <div className="flex items-center gap-3 pr-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {faq.category}
                    </span>
                    <span className="font-semibold text-white text-sm">{faq.question}</span>
                  </div>
                  <ChevronDown 
                    size={18} 
                    className={`text-rose-400 transition-transform duration-300 shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
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
                      <div className="p-4 pt-0 text-xs text-gray-300 leading-relaxed border-t border-white/5 mt-2 bg-white/[0.01]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/30 rounded-3xl text-center">
            <h3 className="text-white font-bold mb-1">Still have questions?</h3>
            <p className="text-xs text-gray-300 mb-4">Our Trust &amp; Safety team is available 24/7.</p>
            <button 
              onClick={() => router.push('/feedback')}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-full font-bold text-xs shadow-lg hover:scale-105 transition-transform"
            >
              Send Support Message 💬
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
