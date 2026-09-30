"use client";
import { useState, useEffect } from "react";

export default function AdminSettingsPage() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken");
    if (!token) return; // Wait for login

    const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");
    fetch(`${backendUrl}/api/v1/admin/settings/features`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setFlags(data || {});
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load flags", err);
        setIsLoading(false);
      });
  }, []);

  const toggleFlag = async (key: string) => {
    const newFlags = { ...flags, [key]: !flags[key] };
    setFlags(newFlags);
    
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080").replace(/\/+$/, "");
      await fetch(`${backendUrl}/api/v1/admin/settings/features`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("adminToken")}` 
        },
        body: JSON.stringify(newFlags)
      });
    } catch {
      alert("Failed to update feature.");
      setFlags(flags); // Revert on failure
    }
  };

  if (isLoading) return <div className="p-6 text-white">Loading Settings...</div>;

  return (
    <div className="p-6 bg-[#0F1014] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6">App Controls & Toggles</h1>
      
      <div className="bg-[#1A1C23] p-6 rounded-xl border border-gray-800 max-w-3xl">
        <h2 className="text-xl font-semibold mb-2">Granular Maintenance Mode</h2>
        <p className="text-gray-400 text-sm mb-6">Instantly turn specific features ON or OFF for all users without redeploying code.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(flags).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center p-4 bg-black/30 rounded-lg border border-gray-700/50">
              <span className="font-medium text-gray-200 capitalize">{key.replace(/_/g, ' ')}</span>
              <button 
                onClick={() => toggleFlag(key)}
                className={`w-12 h-6 rounded-full relative transition-colors ${value ? 'bg-red-500' : 'bg-green-500'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
