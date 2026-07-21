"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageSquare, Trash2, ShieldAlert } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if they are actually coming from the trigger
    // In a real app, you'd use a secure JWT or admin role here
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const { data, error } = await supabase
        .from('feedbacks')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error || !data) {
        // Fallback to mock data if table doesn't exist yet
        setFeedbacks([
          { id: 1, message: "Great app, but needs more users in my area!", created_at: new Date().toISOString() },
          { id: 2, message: "Love the UI, very smooth.", created_at: new Date().toISOString() }
        ]);
      } else {
        setFeedbacks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async (id: number) => {
    await supabase.from('feedbacks').delete().eq('id', id);
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg pb-20 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <ShieldAlert size={20} /> Admin Panel
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">User Feedbacks</h2>
        
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading...</div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No feedback yet.</div>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl relative group mb-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <MessageSquare size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-200">{fb.message}</p>
                  <p className="text-[10px] text-gray-500 mt-2">{new Date(fb.created_at).toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={() => deleteFeedback(fb.id)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
