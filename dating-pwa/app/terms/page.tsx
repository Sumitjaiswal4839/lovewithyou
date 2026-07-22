"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 bg-white/10 rounded-full text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-300 text-sm leading-relaxed pb-24">
        <section>
          <h2 className="text-white font-bold text-lg mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the LoveWith You application ("App"), you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, then you may not access the App.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">2. Eligibility</h2>
          <p>
            You must be at least 18 years of age to create an account on LoveWith You and use the Service. By creating an account, you represent and warrant that you are legally capable of entering into a binding contract.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">3. User Conduct & Safety</h2>
          <p>
            You agree to use LoveWith You for its intended purposes (Date, BFF, or Bizz) in a respectful manner. You agree NOT to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Post any content that is hate speech, threatening, sexually explicit or pornographic.</li>
            <li>Use the Service for any illegal or unauthorized purpose.</li>
            <li>Spam, solicit money from, or defraud any members.</li>
            <li>Impersonate any person or entity without permission.</li>
          </ul>
          <p className="mt-2">
            Users reported for violating these guidelines may suffer a drop in their "Karma Score" or face permanent account termination.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">4. Virtual Currency (Coins) & Features</h2>
          <p>
            The App utilizes a virtual currency system ("Coins"). Coins can be earned through app engagement (like referrals) or purchased. Coins are used to unlock premium features, such as unlocking daily likes and matches (e.g., spending 50 coins to unblur connections).
          </p>
          <p className="mt-2">
            All purchases of Coins are final and non-refundable. Coins have no real-world monetary value and cannot be exchanged for cash. LoveWith You reserves the right to modify the cost of features at any time.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">5. Account Termination</h2>
          <p>
            You can delete your account at any time via the Settings menu. LoveWith You reserves the right to suspend or terminate your account without notice if we believe you have violated these Terms. Upon deletion, all your data, matches, and accumulated coins will be permanently removed.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Your continued use of the App following any changes constitutes acceptance of those changes.
          </p>
        </section>

        <div className="text-center pt-8 pb-4 text-xs text-gray-500">
          Last Updated: July 2026
        </div>
      </div>
    </div>
  );
}
