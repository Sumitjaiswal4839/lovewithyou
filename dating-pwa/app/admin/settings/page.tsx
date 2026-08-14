"use client";
import { useState } from "react";
import { fetchWithAuth } from "@/lib/api";

export default function AdminSettingsPage() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleMaintenance = async () => {
    if (!confirm(`Turn ${!isMaintenance ? "ON" : "OFF"} Maintenance Mode? Users will be blocked if ON.`)) return;
    
    setIsLoading(true);
    try {
      await fetchWithAuth("/api/v1/admin/maintenance", {
        method: "POST",
        body: JSON.stringify({ enable: !isMaintenance })
      });
      setIsMaintenance(!isMaintenance);
    } catch (error) {
      alert("Failed to change status.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-[#0F1014] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">App Controls</h1>
      
      <div className="bg-[#1A1C23] p-6 rounded-xl border border-gray-800 max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold">Maintenance Mode</h2>
            <p className="text-gray-400 text-sm mt-1">Blocks all regular users from using the app.</p>
          </div>
          
          <button 
            onClick={toggleMaintenance}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-bold transition ${
              isMaintenance ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isLoading ? "Wait..." : (isMaintenance ? "Turn OFF" : "Turn ON")}
          </button>
        </div>
        
        {isMaintenance && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg text-sm mt-4">
            ⚠️ Maintenance Mode is currently ACTIVE. Normal users cannot access the app.
          </div>
        )}
      </div>
    </div>
  );
}
