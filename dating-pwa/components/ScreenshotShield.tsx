"use client";

import { useEffect, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

export default function ScreenshotShield({ children }: { children: ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false);

  useEffect(() => {
    // Blur when page is hidden (e.g., opening app switcher on mobile to take a screenshot)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true);
      } else {
        setIsBlurred(false);
      }
    };

    // Keyboard screenshot prevention (PrintScreen, Meta+Shift+S, etc.)
    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen key
      if (e.key === "PrintScreen") {
        e.preventDefault();
        navigator.clipboard.writeText("Screenshots are disabled for privacy reasons.");
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
      }
      // Mac shortcuts (Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+S)
      if (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setIsBlurred(true);
        setTimeout(() => setIsBlurred(false), 2000);
      }
    };

    // Prevent context menu (right click) and drag
    const handleContextMenu = (e: MouseEvent) => {
      // Allow context menu on input fields so people can paste
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      e.preventDefault();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    // Prevent drag and drop on images
    document.addEventListener("dragstart", handleContextMenu);
    
    // Attempt to prevent text/image selection to stop long-press save
    // (This is mostly handled by CSS user-select: none on the wrapper)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleContextMenu);
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* The Actual Content */}
      <div
        className={`w-full h-full transition-all duration-100 ${
          isBlurred ? "blur-xl grayscale pointer-events-none select-none" : ""
        }`}
        style={{
          userSelect: "none", // global text selection disable
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none" // disable iOS long press image menu
        }}
      >
        {children}
      </div>

      {/* The Shield Overlay (shows only when blurred) */}
      <AnimatePresence>
        {isBlurred && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/60 flex flex-col items-center justify-center p-6 text-center pointer-events-none backdrop-blur-md"
          >
            <div className="bg-red-500/20 p-6 rounded-full mb-6">
              <ShieldAlert className="w-16 h-16 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Privacy Protected</h2>
            <p className="text-gray-300 max-w-sm">
              For the safety and privacy of our users, taking screenshots or recording the screen is strictly prohibited.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
