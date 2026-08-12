"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Bell } from "lucide-react";
import Link from "next/link";

export function NotificationBell() {
  const unreadCount = useUserStore((state) => state.unreadNotificationCount);
  const fetchNotifications = useUserStore((state) => state.fetchNotifications);

  // Poll for notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <Link 
      href="/notifications"
      className="relative p-2 rounded-full hover:bg-surface-elevated transition-colors"
    >
      <Bell className="w-6 h-6 text-text-secondary" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
