"use client";

import { useEffect, useState, useRef } from "react";
import * as nsfwjs from "nsfwjs";
import { EyeOff, Eye } from "lucide-react";
import { motion } from "framer-motion";

// Cache the model globally so we don't load it multiple times per image
let nsfwModel: nsfwjs.NSFWJS | null = null;

export default function SecureImage({ 
  src, 
  alt, 
  className = "" 
}: { 
  src: string; 
  alt: string; 
  className?: string;
}) {
  const [isNsfw, setIsNsfw] = useState<boolean>(false);
  const [isBlurred, setIsBlurred] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const checkImage = async () => {
      if (!imgRef.current) return;
      
      try {
        if (!nsfwModel) {
          // Load the model (can take a moment on first load)
          nsfwModel = await nsfwjs.load();
        }

        const predictions = await nsfwModel.classify(imgRef.current);
        
        // nsfwjs categories: Neutral, Drawing, Sexy, Porn, Hentai
        // We flag if Porn, Hentai, or Sexy probability is high
        let isFlagged = false;
        for (const p of predictions) {
          if ((p.className === "Porn" || p.className === "Hentai" || p.className === "Sexy") && p.probability > 0.6) {
            isFlagged = true;
            break;
          }
        }

        setIsNsfw(isFlagged);
        setIsBlurred(isFlagged);
      } catch (err) {
        console.error("Failed to analyze image for NSFW content", err);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // We must wait for the image to be fully loaded to analyze it
    const img = imgRef.current;
    if (img) {
      if (img.complete) {
        checkImage();
      } else {
        img.addEventListener('load', checkImage);
        return () => img.removeEventListener('load', checkImage);
      }
    }
  }, [src]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous" // required for tfjs to read image data from other domains
        className={`w-full h-full object-cover transition-all duration-300 ${
          isBlurred ? "blur-xl scale-110 grayscale" : ""
        }`}
      />

      {isAnalyzing && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-elevated backdrop-blur-sm">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {isNsfw && isBlurred && !isAnalyzing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface-elevated p-4 text-center cursor-pointer"
          onClick={() => setIsBlurred(false)}
        >
          <div className="bg-surface-elevated p-3 rounded-full mb-3 backdrop-blur-md">
            <EyeOff className="w-8 h-8 text-foreground" />
          </div>
          <span className="text-foreground font-semibold text-sm">Sensitive Content</span>
          <span className="text-foreground/60 text-xs mt-1">Tap to reveal</span>
        </motion.div>
      )}

      {isNsfw && !isBlurred && (
        <button 
          onClick={() => setIsBlurred(true)}
          className="absolute top-2 right-2 bg-surface-elevated backdrop-blur-md p-2 rounded-full z-10"
        >
          <Eye className="w-4 h-4 text-foreground" />
        </button>
      )}
    </div>
  );
}
