"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "coin";

interface ToastMessage {
  id: string;
  title: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (title: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((title: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setMessages((prev) => [...prev, { id, title, type }]);
    
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }, 3000); // Auto remove after 3s
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 left-0 right-0 z-50 flex flex-col items-center gap-2 pointer-events-none px-4">
        <AnimatePresence>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={cn(
                "glass flex items-center gap-3 px-4 py-3 rounded-full shadow-lg border",
                m.type === "coin" ? "border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400" :
                m.type === "error" ? "border-red-400/50 bg-red-500/10 text-red-600 dark:text-red-400" :
                "border-primary-500/50 bg-primary-500/10 text-primary-600 dark:text-primary-400"
              )}
            >
              {m.type === "coin" && <Coins size={18} className="text-amber-500" />}
              {m.type === "success" && <CheckCircle2 size={18} />}
              {m.type === "error" && <AlertCircle size={18} />}
              <span className="font-medium text-sm">{m.title}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
