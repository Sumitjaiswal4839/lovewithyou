import React, { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

interface AIIcebreakerProps {
  matchName: string;
  matchHobbies: string[];
  onGenerate: (opener: string) => void;
}

export function AIIcebreaker({ matchName, matchHobbies, onGenerate }: AIIcebreakerProps) {
  const profile = useUserStore((state) => state.profile);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI Generation delay (Since we don't have real Gemini API key yet)
    setTimeout(() => {
      const myHobbies = profile?.hobbies.join(", ") || "hanging out";
      const theirHobbies = matchHobbies.join(", ") || "exploring";
      
      const prompt = `Hey ${matchName}! Gemini AI told me we both vibe with stuff like ${theirHobbies}. I'm super into ${myHobbies}. What's your favorite thing to do lately? ✨`;
      
      onGenerate(prompt);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 mt-8 space-y-4 bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-3xl backdrop-blur-md text-center max-w-sm mx-auto">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-purple-500 flex items-center justify-center shadow-[0_0_20px_rgba(236,72,153,0.4)]">
        <Sparkles size={28} className="text-foreground" />
      </div>
      
      <div>
        <h3 className="text-foreground font-bold text-lg mb-1">Stuck on what to say?</h3>
        <p className="text-muted text-sm leading-relaxed">
          Let Gemini AI analyze your hobbies and {matchName}'s profile to craft the perfect opening message.
        </p>
      </div>

      <button 
        onClick={handleGenerate}
        disabled={isGenerating}
        className="relative w-full py-3 rounded-xl bg-white text-dark-bg font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors disabled:opacity-80"
      >
        {isGenerating ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            <span className="text-primary-hover">Generating Magic...</span>
          </>
        ) : (
          <>
            <Sparkles size={18} className="text-primary" />
            <span>Generate Icebreaker</span>
          </>
        )}
      </button>
    </div>
  );
}
