"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertCircle, MessageCircle, X } from "lucide-react";

type ToastType = "success" | "error" | "message" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextProps {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-dismissal exactly on 4000ms expiration timer
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success": return <CheckCircle className="text-green-500" size={20} />;
      case "error": return <AlertCircle className="text-error" size={20} />;
      case "message": return <MessageCircle className="text-violet-500" size={20} />;
      default: return <AlertCircle className="text-blue-500" size={20} />;
    }
  };

  const getBgClass = (type: ToastType) => {
    switch (type) {
      case "success": return "bg-green-500/10 border-green-500/20";
      case "error": return "bg-error/10 border-red-500/20";
      case "message": return "bg-violet-500/10 border-violet-500/20";
      default: return "bg-blue-500/10 border-blue-500/20";
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Isolated Absolute Overlay Layer */}
      <div 
        aria-live="polite" 
        className="fixed top-safe left-0 right-0 z-[9999] flex flex-col items-center pointer-events-none p-4 space-y-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg transform transition-all duration-300 animate-in slide-in-from-top-5 fade-in ${getBgClass(t.type)}`}
          >
            {getIcon(t.type)}
            <p className="text-sm font-medium text-foreground">{t.message}</p>
            <button 
              onClick={() => setToasts((prev) => prev.filter(item => item.id !== t.id))}
              className="ml-4 text-muted hover:text-foreground"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};
