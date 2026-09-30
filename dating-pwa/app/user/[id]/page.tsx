"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, GraduationCap, Heart, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/useUserStore";

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const localDeviceId = useUserStore.getState().deviceId;
  const isOwnProfile = id === "me" || id === localDeviceId;
  const [previewMode, setPreviewMode] = useState<'standard' | 'random_chat' | 'campus' | 'blind_date'>('standard');

  useEffect(() => {
    const fetchProfile = async () => {
      // If previewing own profile, use local state so changes reflect instantly
      if (isOwnProfile) {
        setProfile(useUserStore.getState().profile);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("public_profiles")
        .select("*")
        .or(`device_id.eq.${id},id.eq.${id}`)
        .single();
        
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    if (id) fetchProfile();
  }, [id, isOwnProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-foreground font-bold text-xl mb-4">Profile Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const isAnonymous = previewMode === 'random_chat';
  const isBlindDate = previewMode === 'blind_date';
  const isCampus = previewMode === 'campus';

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col relative">
      {/* Preview Mode Selector (Only for own profile) */}
      {isOwnProfile && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4">
          <div className="bg-background/90 backdrop-blur-md border border-border rounded-2xl p-2 flex gap-2 overflow-x-auto no-scrollbar shadow-xl">
            <button 
              onClick={() => setPreviewMode('standard')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewMode === 'standard' ? 'bg-primary text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              Standard
            </button>
            <button 
              onClick={() => setPreviewMode('random_chat')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewMode === 'random_chat' ? 'bg-blue-600 text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              Random Chat
            </button>
            <button 
              onClick={() => setPreviewMode('campus')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewMode === 'campus' ? 'bg-purple-600 text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              Campus Hub
            </button>
            <button 
              onClick={() => setPreviewMode('blind_date')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${previewMode === 'blind_date' ? 'bg-rose-600 text-white shadow-md' : 'text-muted hover:text-foreground'}`}
            >
              Blind Date
            </button>
          </div>
        </div>
      )}

      <div className={`relative h-[60vh] w-full ${isCampus ? 'bg-[#2a1b38]' : 'bg-[#1e1e1e]'}`}>
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-foreground"
        >
          <ArrowLeft size={20} />
        </button>
        
        {/* Photo Logic based on mode */}
        {profile.photo_url && !isAnonymous ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img 
            src={profile.photo_url} 
            alt={profile.name} 
            className={`w-full h-full object-cover transition-all duration-500 ${isBlindDate ? 'blur-2xl grayscale brightness-50' : ''}`} 
          />
        ) : (
          <User size={64} className="text-foreground/20 absolute inset-0 m-auto" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6">
          {isAnonymous ? (
             <h1 className="text-4xl font-black text-foreground mb-2">Anonymous Stranger</h1>
          ) : (
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              {isBlindDate ? "????" : profile.name}
              {!isBlindDate && profile.studentVerificationStatus === 'verified' && (
                <CheckCircle2 size={24} className="text-blue-500" />
              )}
            </h1>
          )}
          
          <div className="flex flex-wrap items-center gap-2 mt-3 text-foreground/80">
            {!isAnonymous && !isBlindDate && profile.location && (
              <span className="flex items-center gap-1 text-xs font-bold bg-surface-elevated px-3 py-1.5 rounded-full backdrop-blur-md">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            
            {/* Campus Mode highlights campus */}
            {!isAnonymous && profile.campus && (
              <span className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md ${isCampus ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-surface-elevated'}`}>
                <GraduationCap size={14} /> {profile.campus}
              </span>
            )}
            
            {isAnonymous && (
              <span className="flex items-center gap-1 text-xs font-bold bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full backdrop-blur-md">
                Looking for a quick chat
              </span>
            )}
            
            {isBlindDate && (
              <span className="flex items-center gap-1 text-xs font-bold bg-rose-600/20 text-rose-400 px-3 py-1.5 rounded-full backdrop-blur-md">
                Personality &gt; Looks
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {(!isAnonymous || profile.bio) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-wider">{isAnonymous ? "Vibe" : "About Me"}</h3>
            <p className={`text-foreground/90 leading-relaxed text-lg ${isAnonymous ? 'italic text-muted' : ''}`}>
              {isAnonymous ? "This user prefers to stay mysterious." : (profile.bio || "No bio provided.")}
            </p>
          </div>
        )}

        {!isAnonymous && (profile.hobbies?.length > 0 || profile.interests?.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-foreground/50 uppercase tracking-wider">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies?.map((hobby: string, i: number) => (
                <span key={i} className="bg-primary/20 text-primary-300 border border-primary/30 px-4 py-1.5 rounded-full text-sm font-medium">
                  {hobby}
                </span>
              ))}
              {profile.interests?.map((interest: string, i: number) => (
                <span key={i} className="bg-surface-elevated text-foreground/90 border border-border px-4 py-1.5 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent pb-4 z-50">
        <Button 
          className={`w-full flex items-center justify-center gap-2 text-lg py-6 shadow-xl ${
            isAnonymous ? 'bg-blue-600 hover:bg-blue-700 text-white' : 
            isCampus ? 'bg-purple-600 hover:bg-purple-700 text-white' : 
            isBlindDate ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''
          }`} 
          variant={isAnonymous || isCampus || isBlindDate ? 'secondary' : 'primary'}
          style={isAnonymous || isCampus || isBlindDate ? { border: 'none' } : {}}
        >
          {isAnonymous ? "Start Anonymous Chat 💬" : 
           isCampus ? "Send Campus Request 🎓" : 
           isBlindDate ? "Match Blindly 🎭" : 
           <><Heart size={24} /> Send Like</>}
        </Button>
      </div>
    </div>
  );
}
