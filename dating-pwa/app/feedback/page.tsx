"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareHeart, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { supabase } from "@/lib/supabase";

export default function FeedbackPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast("Please enter your feedback.", "error");
      return;
    }
    
    setIsSubmitting(true);
    const { error } = await supabase.from('feedbacks').insert([{ message: feedbackText }]);
    
    if (error) {
      toast(`Failed to send feedback: ${error.message}`, "error");
    } else {
      toast("Feedback sent successfully! Thank you.", "success");
      setFeedbackText("");
      setTimeout(() => router.back(), 1000);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Send Feedback</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-500/20 rounded-full animate-bounce">
              <MessageSquareHeart size={48} className="text-primary-500" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">We'd love to hear from you!</h2>
          <p className="text-center text-gray-400 text-sm mb-8">
            Tell us what you love about LoveWithYou, or what we can improve. Your feedback helps us grow.
          </p>

          <textarea 
            rows={6}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Write your feedback here..."
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
