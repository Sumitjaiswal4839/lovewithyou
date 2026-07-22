"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed pb-24">
        <section>
          <h2 className="text-white font-bold text-lg mb-2">1. Introduction</h2>
          <p>
            At LoveWith You, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your personal data when you use our Progressive Web Application (PWA) and services.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Profile Information:</strong> Name, age, gender, sexual orientation, faith, hobbies, and bio provided during setup.</li>
            <li><strong>Photos & Voice:</strong> Images uploaded for your profile, voice prompts, and photos used temporarily for AI Face Verification.</li>
            <li><strong>Location Data:</strong> When permitted, we collect your location to facilitate location-based matching (e.g., matching you with users in your State or City). We use third-party APIs (like OpenStreetMap) for reverse geocoding, but we do not track your live GPS continuously.</li>
            <li><strong>Usage Data:</strong> Likes, matches, Karma score, and app settings (like theme and language preferences).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">3. How We Use Your Data</h2>
          <p>We use your information strictly to operate and improve the LoveWith You experience:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To run our matching algorithm and show you relevant profiles based on your preferences.</li>
            <li>To manage virtual currency (Coins) and daily unlock limits.</li>
            <li>To send Push Notifications regarding matches or messages.</li>
            <li>To verify your identity (Blue Tick verification) to keep the community safe.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">4. Data Sharing & Security</h2>
          <p>
            We <strong>do not</strong> sell your personal data to third-party data brokers. We may share limited data with trusted service providers (like Supabase for database hosting and Render for backend services) solely for operating the App. All data is transmitted securely via HTTPS.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">5. User Control & Deletion</h2>
          <p>
            You have full control over your data. You can edit your profile details or change your location preferences at any time. You may also permanently delete your account, matches, and data via the Settings menu. Upon deletion, your profile will immediately be removed from our systems.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how your data is handled, you can use the "Send Feedback" option within the App settings.
          </p>
        </section>

        <div className="text-center pt-8 pb-4 text-xs text-gray-500">
          Last Updated: July 2026
        </div>
      </div>
    </div>
  );
}
