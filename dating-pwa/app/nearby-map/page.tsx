"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { X, MapPin } from "lucide-react";
import { useUserStore } from "@/store/useUserStore";

// Dynamically import map component because Leaflet needs window object (cannot SSR)
const MapComponent = dynamic(() => import("@/components/MapComponent"), { 
  ssr: false, 
  loading: () => <div className="h-full w-full flex items-center justify-center bg-[#1e1e1e] text-white">Loading Map Engine...</div> 
});

export default function NearbyMapPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-dark-bg absolute top-0 w-full z-[101]">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MapPin className="text-green-500" />
          Nearby Radar
        </h2>
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 h-full w-full pt-16">
        <MapComponent />
      </div>
    </div>
  );
}
