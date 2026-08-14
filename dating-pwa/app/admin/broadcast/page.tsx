"use client";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const sendBroadcast = async () => {
    if (!title || !message) {
      alert("Please enter both title and message.");
      return;
    }
    
    if (!confirm("🚨 WARNING: This will send a push notification to EVERY user. Are you sure?")) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const data = await fetchWithAuth("/api/v1/admin/push/broadcast", {
        method: "POST",
        body: JSON.stringify({ title, message })
      });
      setResult(data);
      setTitle("");
      setMessage("");
    } catch (err) {
      alert("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F1014] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-pink-500">Global Broadcast 📢</h1>

      <div className="bg-[#1A1C23] p-6 rounded-xl border border-gray-800 max-w-2xl">
        <p className="text-gray-400 mb-6">
          Send a global push notification to all subscribed users. Use this for major announcements or events.
        </p>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-300 mb-2">Notification Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., Friday Night Flirt is LIVE! 💖"
            className="w-full bg-[#0F1014] p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-2">Notification Message</label>
          <textarea 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="e.g., Hop on right now to find your weekend date."
            rows={4}
            className="w-full bg-[#0F1014] p-3 rounded-lg border border-gray-700 text-white focus:outline-none focus:border-pink-500"
          />
        </div>

        <button 
          onClick={sendBroadcast} 
          disabled={loading || !title || !message}
          className="w-full py-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Sending Broadcast..." : "Send Global Broadcast"}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
            <p className="font-bold mb-1">Broadcast Sent Successfully! ✅</p>
            <p className="text-sm">Delivered to: {result.sentCount} out of {result.totalSubscribers} subscribers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
