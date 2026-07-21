import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function TermsPage() {
  return (
    <div className="px-4 py-8 max-w-2xl mx-auto space-y-6 min-h-screen">
      <div className="flex items-center gap-4 border-b border-glass-border pb-4">
        <Link href="/setup" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold">Terms & Conditions</h1>
      </div>

      <Card className="!p-6 space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-primary-500 mb-2">1. Strict Identity Verification</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            By using this app, you consent to a mandatory live photo capture during the onboarding process. 
            This photo is used specifically for identity and gender verification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary-500 mb-2">2. Permanent Gender Locking</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Your gender is permanently locked in our system based on your initial live photo verification. 
            <strong> Whatever gender you are identified as during this setup cannot be changed.</strong>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-primary-500 mb-2">3. Name Changes and Impersonation</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            You may change your display name at any time. However, changing your display name to one traditionally associated with another gender will <strong>NOT</strong> alter your system-verified gender. 
            If the initial photo verification locked your profile as "Male", you will permanently be classified and shown to others as "Male", regardless of your display name.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-red-500 mb-2">4. Zero Tolerance for Fake Profiles</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Any attempt to impersonate another gender, bypass the live camera using virtual cameras, or submit misleading photos will result in an immediate, permanent device ban. 
            We maintain a safe environment by prioritizing strict transparency.
          </p>
        </section>
      </Card>
      
      <p className="text-center text-xs text-gray-500 pt-8">
        Last updated: July 2026
      </p>
    </div>
  );
}
