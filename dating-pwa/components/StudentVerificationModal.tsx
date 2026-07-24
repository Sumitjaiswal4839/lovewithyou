import { useState } from "react";
import { GraduationCap, Camera, Upload, X, CheckCircle } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";

interface StudentVerificationModalProps {
  onClose: () => void;
}

export function StudentVerificationModal({ onClose }: StudentVerificationModalProps) {
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const { toast } = useToast();
  
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  if (!profile) return null;

  const handleUpload = () => {
    if (!preview) return;
    setIsUploading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setProfile({ 
        ...profile, 
        studentVerificationStatus: 'pending',
        studentIdUrl: preview // In real app, this would be a Supabase Storage URL
      });
      setIsUploading(false);
      toast("Student ID uploaded! Pending admin approval.", "success");
      onClose();
    }, 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-start mb-4">
           <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
             <GraduationCap size={24} />
           </div>
           <button onClick={onClose} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 text-left">Student Verification</h3>
        <p className="text-sm text-gray-400 mb-6 text-left">
          Upload your valid College/University ID card to unlock exclusive student perks like <strong className="text-yellow-400">Double Coins</strong>, <strong className="text-pink-400">Half-Price Boosts</strong>, and Campus Communities.
        </p>

        {profile.studentVerificationStatus === 'pending' ? (
           <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl mb-4">
             <CheckCircle className="text-yellow-500 mx-auto mb-2" size={32} />
             <h4 className="text-yellow-400 font-bold">Verification Pending</h4>
             <p className="text-xs text-yellow-500/70 mt-1">Our admins are reviewing your ID. This usually takes 24 hours.</p>
           </div>
        ) : profile.studentVerificationStatus === 'verified' ? (
           <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl mb-4">
             <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
             <h4 className="text-green-400 font-bold">You are Verified!</h4>
             <p className="text-xs text-green-500/70 mt-1">Enjoy your student perks on LovePWA.</p>
           </div>
        ) : (
          <>
            {/* Upload Area */}
            <div className="w-full h-40 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center hover:bg-white/10 transition group cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <img src={preview} alt="ID Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera size={32} className="text-gray-500 mb-2 group-hover:text-indigo-400 transition" />
                  <p className="text-gray-400 text-sm font-medium">Tap to scan or upload ID</p>
                </>
              )}
            </div>

            <button 
              onClick={handleUpload}
              disabled={!preview || isUploading}
              className="w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-white/10 disabled:text-gray-500 text-white font-bold transition shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2"
            >
              {isUploading ? "Uploading..." : <><Upload size={18} /> Submit for Review</>}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
