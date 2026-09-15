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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border bg-surface-elevated backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-surface-elevated rounded-full text-foreground hover:bg-surface-elevated transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Send Feedback &amp; Support</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center pb-24">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/20 rounded-full animate-bounce">
              <MessageSquareHeart size={40} className="text-primary" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center text-foreground mb-1">We&apos;d love to hear from you!</h2>
          <p className="text-center text-muted text-xs mb-6">
            Tell us what you love about LoveWithYou, report a Razorpay payment issue, or report a safety incident.
          </p>

          {/* Category Selector Chips */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setCategory("General")}
              className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${category === "General" ? "bg-gradient-to-b from-pink-500 to-pink-600 border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.3)] scale-105" : "bg-surface-elevated border-border text-muted hover:text-foreground"}`}
            >
              <HelpCircle size={18} className={category === "General" ? "text-white" : "text-secondary"} /> General
            </button>
            <button
              type="button"
              onClick={() => setCategory("Razorpay")}
              className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${category === "Razorpay" ? "bg-gradient-to-b from-blue-500 to-blue-600 border-blue-500 text-white shadow-[0_4px_12px_rgba(59,130,246,0.3)] scale-105" : "bg-surface-elevated border-border text-muted hover:text-foreground"}`}
            >
              <CreditCard size={18} className={category === "Razorpay" ? "text-white" : "text-secondary"} /> Razorpay
            </button>
            <button
              type="button"
              onClick={() => setCategory("Safety")}
              className={`p-2.5 rounded-2xl border text-xs font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${category === "Safety" ? "bg-gradient-to-b from-amber-500 to-amber-600 border-amber-500 text-white shadow-[0_4px_12px_rgba(245,158,11,0.3)] scale-105" : "bg-surface-elevated border-border text-muted hover:text-foreground"}`}
            >
              <ShieldAlert size={18} className={category === "Safety" ? "text-white" : "text-secondary"} /> Safety
            </button>
          </div>

          {/* Auto-filled Device ID indicator */}
          <div className="mb-4 p-2.5 rounded-xl bg-surface-elevated border border-border flex items-center justify-between text-xs text-muted">
            <span className="flex items-center gap-1.5 font-mono text-[10px]">
              <Smartphone size={14} className="text-primary" /> Device ID:
            </span>
            <span className="font-mono text-primary font-bold truncate max-w-[180px]">
              {deviceId || "Loading..."}
            </span>
          </div>

          {category === "Razorpay" && (
            <input 
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Razorpay Payment ID (e.g. pay_N12345)"
              className="w-full bg-surface-elevated border border-border rounded-2xl px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm text-foreground mb-3 font-medium placeholder:text-muted shadow-inner transition-all"
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
            className={`w-full bg-surface-elevated border border-border rounded-2xl px-4 py-4 outline-none focus:ring-1 resize-none text-sm text-foreground mb-6 font-medium placeholder:text-muted shadow-inner transition-all ${
              category === "Razorpay" ? "focus:border-blue-500 focus:ring-blue-500" :
              category === "Safety" ? "focus:border-amber-500 focus:ring-amber-500" :
              "focus:border-pink-500 focus:ring-pink-500"
            }`}
          />
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl text-white font-extrabold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              category === "Razorpay" ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]" :
              category === "Safety" ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]" :
              "bg-gradient-to-r from-pink-500 to-pink-600 shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]"
            }`}
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
