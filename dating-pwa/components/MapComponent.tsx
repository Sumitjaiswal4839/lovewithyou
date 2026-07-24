"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useUserStore } from "@/store/useUserStore";
import { useToast } from "@/components/ui/ToastProvider";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

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
  const { profile, setProfile } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    // Fix leaflet marker icon issues in Next.js
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

          fetch(`${BACKEND_URL}/users/nearby?lat=${lat}&lng=${lng}`)
            .then(res => res.json())
            .then(data => setClusters(data || []))
            .catch(err => console.error(err));
        },
        (err) => {
          toast("Location access denied. Showing default view.", "error");
          setUserLocation([28.6139, 77.2090]); // Delhi fallback
          fetch(`${BACKEND_URL}/users/nearby?lat=28.6139&lng=77.2090`)
            .then(res => res.json())
            .then(data => setClusters(data || []));
        }
      );
    } else {
        setUserLocation([28.6139, 77.2090]);
        fetch(`${BACKEND_URL}/users/nearby?lat=28.6139&lng=77.2090`)
          .then(res => res.json())
          .then(data => setClusters(data || []));
    }
  }, []);

  if (!userLocation) return <div className="h-full w-full bg-[#1e1e1e] flex items-center justify-center text-white">Loading Map...</div>;

  return (
    <MapContainer 
      center={userLocation} 
      zoom={5} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", zIndex: 10 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
  );
}
