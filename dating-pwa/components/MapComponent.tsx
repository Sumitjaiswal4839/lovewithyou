"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";
import { API } from "@/lib/api";
import { Radio, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const isProd = process.env.NODE_ENV === "production";
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");

// Custom icon for clusters
const createClusterIcon = (count: number) => {
  return L.divIcon({
    html: `<div style="background-color: #ef4444; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">${count}+</div>`,
    className: "custom-cluster-icon",
    iconSize: [40, 40],
  });
};

interface Cluster {
  area_name: string;
  count: number;
  lat: number;
  lng: number;
}

export default function MapComponent() {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  const { profile, setProfile, deviceId } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    // Fix leaflet marker icon issues in Next.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation([lat, lng]);

          if (profile) {
             setProfile({ ...profile, latitude: lat, longitude: lng });
          }

          const token = useUserStore.getState().authToken;
          const headers = token ? { 'Authorization': `Bearer ${token}` } : undefined;

          fetch(`${BACKEND_URL}/users/nearby?lat=${lat}&lng=${lng}`, { headers })
            .then(res => res.json())
            .then(data => setClusters(data || []))
            .catch(err => console.error(err));
        },
        () => {
          toast("Location access denied. Showing default view.", "error");
          setTimeout(() => setUserLocation([28.6139, 77.2090]), 0); // Delhi fallback
          const token = useUserStore.getState().authToken;
          fetch(`${BACKEND_URL}/users/nearby?lat=28.6139&lng=77.2090`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
          })
            .then(res => res.json())
            .then(data => setClusters(data || []));
        }
      );
    } else {
        setTimeout(() => setUserLocation([28.6139, 77.2090]), 0);
        const token = useUserStore.getState().authToken;
        fetch(`${BACKEND_URL}/users/nearby?lat=28.6139&lng=77.2090`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        })
          .then(res => res.json())
          .then(data => setClusters(data || []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerPulse = async () => {
    if (!deviceId || !userLocation) {
      toast("Location or Device ID missing!", "error");
      return;
    }
    setIsPulsing(true);
    
    // Call the API
    await API.broadcastPheromonePulse(deviceId, userLocation[0], userLocation[1]);

    toast("📡 Pheromone Pulse Active! Alerted users within 3km radius.", "success");
    
    setTimeout(() => {
      setIsPulsing(false);
    }, 4000);
  };

  if (!userLocation) return <div className="h-full w-full bg-[#1e1e1e] flex items-center justify-center text-foreground">Loading Map...</div>;

  return (
    <div className="relative h-full w-full z-10">
      <MapContainer 
        center={userLocation} 
        zoom={5} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="dark-map-tiles"
        />

        <CircleMarker center={userLocation} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.7 }} radius={8}>
          <Popup>You are here!</Popup>
        </CircleMarker>

        {clusters.map((cluster, idx) => (
          <Marker 
            key={idx} 
            position={[cluster.lat, cluster.lng]} 
            icon={createClusterIcon(cluster.count)}
          >
            <Popup>
              <div className="text-black font-bold">
                {cluster.count}+ users in {cluster.area_name}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                Exact identities are hidden for privacy.
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Radar Pulse Button */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="relative">
          <AnimatePresence>
            {isPulsing && (
              <>
                <motion.div 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-pink-500/50"
                />
                <motion.div 
                  initial={{ opacity: 0.8, scale: 1 }}
                  animate={{ opacity: 0, scale: 4 }}
                  transition={{ duration: 1.5, delay: 0.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-pink-500/30"
                />
              </>
            )}
          </AnimatePresence>
          <button
            onClick={triggerPulse}
            disabled={isPulsing}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-full font-black text-white shadow-2xl transition-all ${
              isPulsing 
                ? "bg-pink-600 scale-95" 
                : "bg-gradient-to-r from-pink-600 to-purple-600 hover:scale-105 shadow-[0_0_20px_rgba(219,39,119,0.6)]"
            }`}
          >
            {isPulsing ? (
              <>
                <Radio size={20} className="animate-ping" /> Broadcasting...
              </>
            ) : (
              <>
                <Zap size={20} className="text-yellow-300" /> Boost Radar (3km)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

