"use client";

import { Calendar, Clock, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EventsPage() {
  const router = useRouter();
  
  const events = [
    { id: 1, title: "Delhi Campus Speed Dating", time: "Tonight, 9:00 PM", participants: 142, type: "Virtual" },
    { id: 2, title: "Tech Bro Mixer", time: "Tomorrow, 8:00 PM", participants: 89, type: "Voice Only" },
    { id: 3, title: "Anime Lovers Hangout", time: "Friday, 10:00 PM", participants: 215, type: "Video" },
  ];

  return (
    <div className="flex flex-col h-screen bg-dark-bg p-6 pt-12 pb-20">
      <div className="flex items-center gap-3 mb-6">
         <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
            <Calendar size={24} />
         </div>
         <div>
            <h1 className="text-2xl font-bold text-white">Event Calendar</h1>
            <p className="text-sm text-gray-400">Join exclusive themed matching events.</p>
         </div>
      </div>

      <div className="space-y-4">
        {events.map(ev => (
          <div key={ev.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition cursor-pointer relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-bl-full -mr-4 -mt-4 blur-xl"></div>
             <h3 className="text-white font-bold text-lg">{ev.title}</h3>
             
             <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Clock size={14} className="text-primary-400" /> {ev.time}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <Video size={14} className="text-blue-400" /> {ev.type}
                </div>
             </div>
             
             <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-medium text-white/60">{ev.participants} attending</span>
                <button className="px-4 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-bold rounded-full transition">
                  RSVP
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
