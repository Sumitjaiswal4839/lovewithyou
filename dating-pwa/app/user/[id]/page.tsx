"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, MapPin, GraduationCap, Heart, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function UserProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
        
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    };

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-white font-bold text-xl mb-4">Profile Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-24 flex flex-col">
      <div className="relative h-[60vh] w-full bg-[#1e1e1e]">
        <button 
          onClick={() => router.back()}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft size={20} />
        </button>
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
        ) : (
          <User size={64} className="text-white/20 absolute inset-0 m-auto" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-4xl font-bold text-white flex items-center gap-3">
            {profile.name}
            {profile.studentVerificationStatus === 'verified' && (
              <CheckCircle2 size={24} className="text-blue-500" />
            )}
          </h1>
          <div className="flex items-center gap-4 mt-3 text-white/80">
            {profile.location && (
              <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            {profile.campus && (
              <span className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                <GraduationCap size={14} /> {profile.campus}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {profile.bio && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">About Me</h3>
            <p className="text-white/90 leading-relaxed text-lg">{profile.bio}</p>
          </div>
        )}

        {(profile.hobbies?.length > 0 || profile.interests?.length > 0) && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.hobbies?.map((hobby: string, i: number) => (
                <span key={i} className="bg-primary-500/20 text-primary-300 border border-primary-500/30 px-4 py-1.5 rounded-full text-sm font-medium">
                  {hobby}
                </span>
              ))}
              {profile.interests?.map((interest: string, i: number) => (
                <span key={i} className="bg-white/10 text-white/90 border border-white/10 px-4 py-1.5 rounded-full text-sm font-medium">
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent pb-4">
        <Button className="w-full flex items-center justify-center gap-2 text-lg py-6" variant="primary">
          <Heart size={24} /> Send Like
        </Button>
      </div>
    </div>
  );
}
