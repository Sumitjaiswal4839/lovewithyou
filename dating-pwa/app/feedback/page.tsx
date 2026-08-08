"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart, ArrowLeft, ShieldAlert, CreditCard, HelpCircle, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export default function FeedbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const deviceId = useUserStore((state) => state.deviceId);
  
  const [category, setCategory] = useState<"General" | "Razorpay" | "Safety">("General");
  const [feedbackText, setFeedbackText] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast("Please enter your feedback.", "error");
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.from('feedbacks').insert([{ 
      message: feedbackText,
      category: category,
      device_id: deviceId || "anonymous",
      transaction_id: transactionId || null,
      created_at: new Date().toISOString()
    }]);
    
    if (error) {
      toast(`Failed to send feedback: ${error.message}`, "error");
    } else {
      toast("Feedback sent successfully! Thank you.", "success");
      setFeedbackText("");
      setTransactionId("");
      setTimeout(() => router.back(), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Send Feedback &amp; Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary-500/20 rounded-full animate-bounce">
              <MessageSquareHeart size={40} className="text-primary-500" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-white mb-1">We&apos;d love to hear from you!</h2>
          <p className="text-center text-gray-400 text-xs mb-6">
            Tell us what you love about LoveWithYou, report a Razorpay payment issue, or report a safety incident.
          </p>

          {/* Category Selector Chips */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCategory("General")}
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "General" ? "bg-primary-500 border-primary-500 text-white shadow-lg" : "bg-white/5 border-white/10 text-gray-400"}`}
            >
              <HelpCircle size={16} /> General
            </button>
            <button
              type="button"
              onClick={() => setCategory("Razorpay")}
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "Razorpay" ? "bg-rose-600 border-rose-500 text-white shadow-lg" : "bg-white/5 border-white/10 text-gray-400"}`}
            >
              <CreditCard size={16} /> Razorpay
            </button>
            <button
              type="button"
              onClick={() => setCategory("Safety")}
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "Safety" ? "bg-amber-600 border-amber-500 text-white shadow-lg" : "bg-white/5 border-white/10 text-gray-400"}`}
            >
              <ShieldAlert size={16} /> Safety
            </button>
          </div>

          {/* Auto-filled Device ID indicator */}
          <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Smartphone size={14} className="text-primary-400" /> Device ID:
            </span>
            <span className="font-mono text-rose-300 font-bold truncate max-w-[180px]">
              {deviceId || "Loading..."}
            </span>
          </div>

          {category === "Razorpay" && (
            <input 
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Razorpay Payment ID (e.g. pay_N12345)"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary-500 text-xs text-white mb-3"
            />
          )}

          <textarea 
            rows={5}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder={
              category === "Razorpay" 
                ? "Describe your coin payment issue..." 
                : category === "Safety" 
                ? "Report harassment or catfish incident..." 
                : "Write your feedback or suggestions here..."
            }
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-4 py-4 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none text-sm text-white mb-6"
          />
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold transition shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
