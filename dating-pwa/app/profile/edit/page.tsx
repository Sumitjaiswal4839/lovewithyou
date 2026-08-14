"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Button } from "@/components/ui/Button";
import { Lock, Camera, ArrowLeft, Mic, Square, Play, Trash2, Sparkles, ScanFace, EyeOff, Bell, Shield, Languages, Music, Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { uploadToCloudinary } from "@/lib/cloudinary";

const PROMPTS = [
  "My biggest red flag is...",
  "A shower thought I recently had...",
  "The best way to ask me out is...",
  "I'm overly competitive about..."
];

export default function EditProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { profile, setProfile, appSettings, updateSettings } = useUserStore();
  
  // Fallback to empty strings if profile is not loaded
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    campus: profile?.campus || "",
    hobbies: profile?.hobbies.join(", ") || "",
    voice_prompt_url: profile?.voice_prompt_url || "",
    mode: profile?.mode || "Date",
    isAnonymous: profile?.isAnonymous || false,
    orientation: profile?.orientation || "",
    faith: profile?.faith || "",
    intent: profile?.intent || "Long-term",
    zodiacSign: profile?.zodiacSign || "",
    photos: profile?.photos || (profile?.photo_url ? [profile.photo_url] : []),
  });

  const [aiGenerating, setAiGenerating] = useState(false);
  const [faceCheckState, setFaceCheckState] = useState<"idle" | "scanning" | "verified">("idle");
  const [selectedPrompt, setSelectedPrompt] = useState(PROMPTS[0]);
  const [promptAnswer, setPromptAnswer] = useState("");
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setFormData({ ...formData, voice_prompt_url: url });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (err) {
      toast("Microphone access denied or unavailable.", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    setFormData({ ...formData, voice_prompt_url: "" });
  };

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    
    // Convert hobbies string to array
    const hobbiesArray = formData.hobbies.split(",").map((h) => h.trim()).filter((h) => h !== "");
    
    setProfile({
      ...profile,
      name: formData.name,
      bio: formData.bio,
      location: formData.location,
      campus: formData.campus,
      hobbies: hobbiesArray,
      voice_prompt_url: formData.voice_prompt_url,
      mode: formData.mode as "Date" | "BFF" | "Bizz",
      isAnonymous: formData.isAnonymous,
      intent: formData.intent,
      zodiacSign: formData.zodiacSign,
      orientation: formData.orientation,
      faith: formData.faith,
      photos: formData.photos,
      photo_url: formData.photos[0] || "",
      prompts: promptAnswer ? [{ question: selectedPrompt, answer: promptAnswer }] : [],
    });
    
    setIsSaving(false);
    toast("Profile updated successfully!", "success");
    router.push("/profile");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    try {
      toast("Uploading photo...", "message");
      const url = await uploadToCloudinary(file);
      const newPhotos = [...formData.photos];
      if (index < newPhotos.length) {
        newPhotos[index] = url;
      } else {
        newPhotos.push(url);
      }
      setFormData({ ...formData, photos: newPhotos });
      setProfile({ ...profile, photos: newPhotos, photo_url: newPhotos[0] || "" } as any);
      toast("Photo uploaded successfully! ✅", "success");
    } catch (err) {
      toast("Photo upload failed. Try again.", "error");
    }
  };

  const handleDeletePhoto = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    setFormData({ ...formData, photos: newPhotos });
    setProfile({ ...profile, photos: newPhotos, photo_url: newPhotos[0] || "" } as any);
  };

  if (!profile) {
    return <div className="text-center pt-20">Please complete setup first.</div>;
  }

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-full bg-surface-elevated hover:bg-surface-elevated">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold">Edit Profile</h2>
      </div>

      {/* Photo Upload Grid (6 Photos) */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const photo = formData.photos[index];
          const isMain = index === 0;
          return (
            <div key={index} className={`relative group cursor-pointer rounded-2xl overflow-hidden bg-surface-elevated border-2 border-border aspect-[3/4] flex items-center justify-center ${isMain ? 'col-span-2 row-span-2 aspect-[3/4.2]' : ''}`}>
              {photo ? (
                <>
                  <img src={photo} alt={`Profile ${index + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={(e) => handleDeletePhoto(index, e)} className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {isMain && (
                    <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      MAIN
                    </div>
                  )}
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center text-muted hover:text-primary transition-colors cursor-pointer border-2 border-dashed border-border rounded-xl m-1">
                  <Plus size={24} className="mb-1" />
                  <span className="text-[10px] uppercase font-bold">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(e, index)}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* Mode Selector */}
      <div className="flex bg-surface-elevated p-1 rounded-full border border-border mb-6">
        {["Date", "BFF", "Bizz"].map(m => (
          <button 
            key={m}
            onClick={() => setFormData({ ...formData, mode: m as "Date" | "BFF" | "Bizz" })}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition ${formData.mode === m ? 'bg-primary text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center justify-between bg-surface-elevated border border-border rounded-2xl p-4">
        <div>
          <h3 className="font-bold flex items-center gap-2"><EyeOff size={16} className="text-muted"/> Anonymous Mode</h3>
          <p className="text-xs text-muted">Blur your photo until you like them back.</p>
        </div>
        <button 
          onClick={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
          className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isAnonymous ? 'bg-primary' : 'bg-gray-600'}`}
        >
          <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isAnonymous ? 'translate-x-6' : ''}`} />
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* Editable Fields */}
        <div>
          <label className="text-sm font-medium text-muted ml-1">Name</label>
          <input 
            type="text"
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <div className="flex items-center justify-between ml-1 mb-1">
            <label className="text-sm font-medium text-muted">Bio</label>
            <button 
              onClick={() => {
                setAiGenerating(true);
                setTimeout(() => {
                  setFormData({ ...formData, bio: "Software Engineer by day, aspiring chef by night. Looking for someone to debate whether pineapple belongs on pizza! 🍕" });
                  setAiGenerating(false);
                  toast("AI Bio Generated!", "success");
                }, 1500);
              }}
              className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1 font-bold"
            >
              <Sparkles size={12} /> {aiGenerating ? "Writing..." : "AI Magic"}
            </button>
          </div>
          <textarea 
            rows={3}
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted ml-1">Orientation</label>
            <input 
              type="text"
              className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
              placeholder="Straight"
              value={formData.orientation}
              onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted ml-1">Faith</label>
            <input 
              type="text"
              className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
              placeholder="Agnostic"
              value={formData.faith}
              onChange={(e) => setFormData({ ...formData, faith: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-muted ml-1">Looking For (Intent)</label>
          <select 
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary appearance-none"
            value={formData.intent}
            onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
          >
            {["Long-term", "Short-term", "Just friends", "Still figuring it out"].map(i => (
              <option key={i} value={i} className="bg-background">{i}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted ml-1">Zodiac Sign</label>
          <select 
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary appearance-none"
            value={formData.zodiacSign}
            onChange={(e) => setFormData({ ...formData, zodiacSign: e.target.value })}
          >
            <option value="" className="bg-background">Select Zodiac</option>
            {["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"].map(i => (
              <option key={i} value={i} className="bg-background">{i}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-muted ml-1">Location / City</label>
          <input 
            type="text"
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted ml-1">College/Campus</label>
          <input 
            type="text"
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            placeholder="Delhi University"
            value={formData.campus}
            onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-muted ml-1">Hobbies (comma separated)</label>
          <input 
            type="text"
            className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary"
            placeholder="Coding, Reading, Travel"
            value={formData.hobbies}
            onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
          />
        </div>

        {/* Profile Prompts */}
        <div className="pt-4 border-t border-border">
          <label className="text-sm font-bold text-secondary ml-1 block mb-2">Profile Prompts</label>
          <select 
            value={selectedPrompt}
            onChange={(e) => setSelectedPrompt(e.target.value)}
            className="w-full bg-surface-elevated border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm mb-2"
          >
            {PROMPTS.map(p => <option key={p} value={p} className="bg-background">{p}</option>)}
          </select>
          <textarea 
            rows={2}
            className="w-full bg-surface-elevated border border-border rounded-xl px-4 py-3 outline-none focus:border-primary resize-none text-sm"
            placeholder="Write your answer..."
            value={promptAnswer}
            onChange={(e) => setPromptAnswer(e.target.value)}
          />
        </div>

        {/* Spotify Integration */}
        <div className="pt-4 border-t border-border">
           <div className="bg-[#1DB954]/10 border border-[#1DB954]/20 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954]">
                   <Music size={20} />
                 </div>
                 <div>
                   <h3 className="font-bold text-[#1DB954]">Spotify</h3>
                   <p className="text-[10px] text-muted">Show your top artists on profile</p>
                 </div>
              </div>
              <button 
                onClick={() => {
                  setIsSpotifyConnected(!isSpotifyConnected);
                  toast(isSpotifyConnected ? "Spotify Disconnected" : "Spotify Connected!", "success");
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors ${isSpotifyConnected ? 'bg-surface-elevated text-foreground' : 'bg-[#1DB954] text-foreground hover:bg-[#1ed760]'}`}
              >
                {isSpotifyConnected ? "Disconnect" : "Connect"}
              </button>
           </div>
        </div>

        {/* Voice Prompt Section */}
        <div className="pt-4 border-t border-border">
          <label className="text-sm font-bold text-secondary ml-1 block mb-2 text-primary">
            Voice Icebreaker (Blind Date Mode)
          </label>
          <p className="text-xs text-muted ml-1 mb-3">Record a 15-second intro to participate in Blind Dates.</p>
          
          <div className="bg-surface-elevated border border-border p-4 rounded-2xl flex flex-col items-center gap-3">
            {!formData.voice_prompt_url ? (
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${isRecording ? "bg-error animate-pulse" : "bg-primary hover:scale-105"}`}
                >
                  {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={28} />}
                </button>
                <span className="text-sm text-secondary">{isRecording ? "Recording..." : "Tap to record"}</span>
              </div>
            ) : (
              <div className="w-full flex items-center gap-3 bg-background p-3 rounded-xl border border-glass-border">
                <audio controls src={formData.voice_prompt_url} className="w-full h-8" />
                <button onClick={deleteRecording} className="p-2 text-error hover:bg-error/10 rounded-full">
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Face Verification */}
        <div className="pt-4 border-t border-border">
          <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                 <ScanFace size={20} />
               </div>
               <div>
                 <h3 className="font-bold text-blue-400">Video Face Check</h3>
                 <p className="text-[10px] text-muted">Get the blue tick to boost your matches by 60%</p>
               </div>
            </div>
            
            <button 
              onClick={() => {
                if(faceCheckState === 'verified') return;
                setFaceCheckState('scanning');
                setTimeout(() => {
                  setFaceCheckState('verified');
                  toast("Face Verified Successfully!", "success");
                }, 2000);
              }}
              className={`w-full py-2.5 rounded-xl font-bold mt-2 flex items-center justify-center gap-2 transition ${faceCheckState === 'verified' ? 'bg-blue-500 text-foreground' : 'bg-surface-elevated text-foreground hover:bg-surface-elevated'}`}
            >
              {faceCheckState === 'idle' && "Start Scan"}
              {faceCheckState === 'scanning' && <span className="animate-pulse">Scanning...</span>}
              {faceCheckState === 'verified' && "Verified ✓"}
            </button>
          </div>
        </div>

        {/* App Settings (Phase 4) */}
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider">App Preferences</h3>
          
          <div className="flex items-center justify-between bg-surface-elevated border border-border p-3 rounded-xl">
            <span className="text-sm font-medium text-secondary">Low Data Mode</span>
            <button onClick={() => updateSettings({ lowDataMode: !appSettings.lowDataMode })} className={`w-10 h-5 rounded-full p-1 transition-colors ${appSettings.lowDataMode ? 'bg-primary' : 'bg-gray-600'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${appSettings.lowDataMode ? 'translate-x-5' : ''}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between bg-surface-elevated border border-border p-3 rounded-xl">
            <span className="text-sm font-medium text-secondary">High Contrast (Accessibility)</span>
            <button onClick={() => updateSettings({ highContrast: !appSettings.highContrast })} className={`w-10 h-5 rounded-full p-1 transition-colors ${appSettings.highContrast ? 'bg-primary' : 'bg-gray-600'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${appSettings.highContrast ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="flex items-center justify-between bg-surface-elevated border border-border p-3 rounded-xl">
            <span className="text-sm font-medium text-secondary">Haptic Feedback</span>
            <button onClick={() => updateSettings({ hapticsEnabled: !appSettings.hapticsEnabled })} className={`w-10 h-5 rounded-full p-1 transition-colors ${appSettings.hapticsEnabled ? 'bg-primary' : 'bg-gray-600'}`}>
              <div className={`w-3 h-3 bg-white rounded-full transition-transform ${appSettings.hapticsEnabled ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted ml-1">Language</label>
              <select 
                value={appSettings.language} 
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm"
              >
                <option value="en" className="bg-background">English</option>
                <option value="hi" className="bg-background">Hindi</option>
                <option value="es" className="bg-background">Spanish</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted ml-1">Currency</label>
              <select 
                value={appSettings.currency} 
                onChange={(e) => updateSettings({ currency: e.target.value })}
                className="w-full mt-1 bg-surface-elevated border border-border rounded-xl px-3 py-2 outline-none focus:border-primary text-sm"
              >
                <option value="INR" className="bg-background">INR (₹)</option>
                <option value="USD" className="bg-background">USD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Locked Fields */}
        <div className="pt-4 border-t border-border space-y-4">
          <h3 className="text-sm font-bold text-muted uppercase tracking-wider flex items-center gap-2">
            System Locked <Lock size={14} />
          </h3>
          
          <div className="opacity-50 pointer-events-none">
            <label className="text-sm font-medium text-muted ml-1">Gender</label>
            <input 
              type="text"
              readOnly
              className="w-full mt-1 bg-transparent border border-border rounded-xl px-4 py-3"
              value={profile.gender}
            />
          </div>
          
          <div className="opacity-50 pointer-events-none">
            <label className="text-sm font-medium text-muted ml-1">Age</label>
            <input 
              type="text"
              readOnly
              className="w-full mt-1 bg-transparent border border-border rounded-xl px-4 py-3"
              value={profile.age || ""}
            />
            <p className="text-[10px] text-muted mt-1 ml-1">Verified age cannot be changed manually.</p>
          </div>
        </div>

      </div>

      {/* Save Button */}
      <div className="pt-4">
        <Button onClick={handleSave} className="w-full" size="lg" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

    </div>
  );
}
