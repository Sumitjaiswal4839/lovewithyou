import { ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerGradient?: string;
  zIndex?: number;
  maxWidth?: string;
}

export function BaseModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon,
  headerGradient = "from-surface-elevated to-surface-elevated",
  zIndex = 70,
  maxWidth = "max-w-sm"
}: BaseModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" 
        style={{ zIndex }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
          onClick={onClose}
        />
        
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`relative w-full ${maxWidth} bg-background border border-white/10 rounded-3xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          {(title || icon) && (
            <div className={`bg-gradient-to-r ${headerGradient} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                    {icon}
                  </div>
                )}
                <div>
                  {title && <h2 className="text-white font-black text-sm">{title}</h2>}
                  {subtitle && <p className="text-white/70 text-[10px]">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <X size={14} className="text-white" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="relative">
            {/* If no header, provide a floating close button */}
            {!title && !icon && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <X size={14} className="text-white" />
              </button>
            )}
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
