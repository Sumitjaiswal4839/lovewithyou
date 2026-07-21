import { ButtonHTMLAttributes, forwardRef } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & 
  HTMLMotionProps<"button"> & {
  variant?: "primary" | "secondary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600",
      secondary: "bg-white text-primary-600 border-2 border-primary-100 hover:bg-primary-50 dark:bg-dark-bg dark:text-white dark:border-primary-900",
      glass: "glass text-foreground hover:bg-white/20",
      ghost: "text-foreground hover:bg-primary-50 dark:hover:bg-primary-900/50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-base font-medium",
      lg: "px-8 py-4 text-lg font-bold rounded-2xl",
      icon: "p-3 rounded-full flex items-center justify-center",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
