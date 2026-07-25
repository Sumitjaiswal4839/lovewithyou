"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How does the coin system work?",
    answer: "You get free coins every day. Actions like unlocking advanced search filters, viewing hidden profiles, and buying super likes cost coins. You can earn more coins by logging in daily, verifying your profile, or buying premium packs."
  },
  {
    question: "Are my photos uploaded to a server?",
    answer: "For your privacy, features like the AI Age Scanner and NSFW Image filter run directly on your device using on-device AI. We only upload the photos you explicitly set as your profile pictures."
  },
  {
    question: "How do I report someone?",
    answer: "Go to their profile, tap the three dots in the top right corner, and select 'Report User'. Our Trust & Safety team will review the report within 24 hours."
  },
  {
    question: "What is Blind Date mode?",
    answer: "Blind Date matches you with someone based solely on shared interests and audio chat. Pictures are blurred initially and slowly reveal themselves as you both interact and build a connection."
  },
  {
    question: "Why is screenshotting blocked?",
    answer: "To ensure maximum privacy and safety for all our users, we strictly forbid screenshotting chats or profiles. This prevents photos from being leaked or misused without consent."
  }
];

export default function FAQPage() {
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-pink-400" /> FAQ
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-4">
          <div className="text-center mb-8 mt-4">
            <h2 className="text-2xl font-bold text-white mb-2">How can we help?</h2>
            <p className="text-gray-400 text-sm">Find answers to the most common questions.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-white/5"
                >
                  <span className="font-semibold text-white text-sm pr-4">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-primary-500 transition-transform duration-300 flex-shrink-0 ${openIndex === index ? 'rotate-180' : ''}`} 
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
                      <div className="p-4 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-primary-500/10 border border-primary-500/20 rounded-3xl text-center">
            <h3 className="text-white font-bold mb-2">Still need help?</h3>
            <p className="text-sm text-gray-400 mb-4">Our support team is available 24/7 to assist you.</p>
            <button 
              onClick={() => router.push('/feedback')}
              className="px-6 py-3 bg-primary-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:scale-105 transition-transform"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
