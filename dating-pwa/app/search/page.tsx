"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Sparkles } from "lucide-react";
import { useState } from "react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 h-14 px-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border pt-safe">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-foreground hover:bg-surface-elevated rounded-full transition">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-base font-black tracking-tight flex-1">Search Matches</h1>
      </div>

      <div className="p-4">
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, campus, or interests..."
            className="w-full bg-surface-elevated border border-border rounded-2xl py-3 pl-11 pr-4 text-sm font-medium focus:outline-none focus:border-primary transition text-foreground placeholder:text-muted"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        
        <div className="flex flex-col items-center justify-center pt-20 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2 shadow-lg shadow-primary/20">
                <Sparkles size={32} />
            </div>
            <h2 className="text-xl font-black text-foreground">Global Search</h2>
            <p className="text-sm text-secondary max-w-[250px] leading-relaxed">
               Search across all universities and cities will be unlocked in the next update. Stay tuned!
            </p>
        </div>
      </div>
    </div>
  );
}
