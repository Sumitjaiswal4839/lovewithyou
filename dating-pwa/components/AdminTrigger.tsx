"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock } from "lucide-react";
import { Button } from "./ui/Button";
import { useToast } from "./ui/ToastProvider";

export function AdminTrigger() {
  const [keys, setKeys] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      setKeys((prev) => {
        const newKeys = [...prev, key].slice(-3); // Keep last 3 keys
        if (newKeys.join("") === "ilu") {
          setShowModal(true);
          return []; // Reset after trigger
        }
        return newKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      
      if (data.success && data.role === "master") {
        setShowModal(false);
        setPassword("");
        toast("Admin access granted", "success");
        router.push("/admin");
      } else {
        toast("Invalid admin password", "error");
        setPassword("");
      }
    } catch (err) {
      toast("Authentication error", "error");
      setPassword("");
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-dark-bg border border-white/10 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
        <button 
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-white"
        >
          <X size={20} />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">System Access</h2>
          <p className="text-xs text-gray-400 mt-1">Restricted area</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter passphrase"
            autoComplete="new-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center tracking-widest outline-none focus:border-red-500 text-white"
          />
          <Button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white">
            Authenticate
          </Button>
        </form>
      </div>
    </div>
  );
}
