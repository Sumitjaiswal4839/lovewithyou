import { useState } from "react";

// Fallback if fetchWithAuth is not immediately importable, we can use standard fetch with token logic
// We assume it's available in "@/lib/api" or similar as per user request
// But to prevent breaking, let's use the standard fetch block with authorization header if needed.
// Based on user snippet:
import { fetchWithAuth } from "@/lib/api"; 
import { BaseModal } from "@/components/ui/BaseModal";
import { Flag } from "lucide-react";

export default function ReportUserModal({ offenderId, onClose }: { offenderId: string, onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) return alert("Please provide a reason.");
    setIsSubmitting(true);
    
    try {
      await fetchWithAuth("/api/v1/safety/report", {
        method: "POST",
        body: JSON.stringify({ offender_id: offenderId, reason })
      });
      setSuccess(true);
      setTimeout(onClose, 2000); // Close modal after 2 seconds
    } catch {
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <BaseModal isOpen={true} onClose={onClose} zIndex={80}>
        <div className="p-6 text-center">
          <p className="text-green-500 text-lg font-bold">Report Submitted ✅</p>
          <p className="text-gray-400 text-sm mt-2">Our trust & safety team will review this shortly.</p>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal 
      isOpen={true} 
      onClose={onClose} 
      title="Report User 🚩" 
      icon={<Flag size={20} className="text-red-500" />}
      headerGradient="from-red-900/40 to-surface-elevated"
      zIndex={80}
    >
      <div className="p-6">
        <textarea 
          className="w-full bg-[#0F1014] text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
          rows={4}
          placeholder="Why are you reporting this user? (e.g., Inappropriate behavior, fake profile...)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
