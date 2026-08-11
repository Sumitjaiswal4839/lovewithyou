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
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "General" ? "bg-primary border-primary text-white shadow-lg" : "bg-surface-elevated border-border text-white/60"}`}
            >
              <HelpCircle size={16} /> General
            </button>
            <button
              type="button"
              onClick={() => setCategory("Razorpay")}
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "Razorpay" ? "bg-primary-hover border-primary text-white shadow-lg" : "bg-surface-elevated border-border text-white/60"}`}
            >
              <CreditCard size={16} /> Razorpay
            </button>
            <button
              type="button"
              onClick={() => setCategory("Safety")}
              className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${category === "Safety" ? "bg-amber-600 border-amber-500 text-foreground shadow-lg" : "bg-surface-elevated border-border text-muted"}`}
            >
              <ShieldAlert size={16} /> Safety
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
              className="w-full bg-black/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary text-xs text-foreground mb-3"
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
            className="w-full bg-black/50 border border-border rounded-2xl px-4 py-4 outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm text-foreground mb-6"
          />
          
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold transition shadow-[0_0_15px_rgba(236,72,153,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Sending..." : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}
