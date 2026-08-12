"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Bell, Heart, CheckCircle2, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const notifications = useUserStore((state) => state.notifications);
  const unreadCount = useUserStore((state) => state.unreadNotificationCount);
  const fetchNotifications = useUserStore((state) => state.fetchNotifications);
  const markNotificationRead = useUserStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useUserStore((state) => state.markAllNotificationsRead);

  // Poll for notifications every 15 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return <Heart className="w-5 h-5 text-primary" />;
      case "like": return <Heart className="w-5 h-5 text-purple-500" />;
      case "alert": return <Info className="w-5 h-5 text-accent" />;
      case "system": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative z-50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-surface-elevated transition-colors"
      >
        <Bell className="w-6 h-6 text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-surface-elevated rounded-2xl shadow-xl z-50"
            >
              <div className="sticky top-0 bg-surface/90 backdrop-blur-md p-4 border-b border-surface-elevated flex items-center justify-between z-10">
                <h3 className="font-bold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllNotificationsRead()}
                    className="text-xs text-primary font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="p-2">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-text-secondary">
                    <p className="text-sm">No new notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.is_read && markNotificationRead(notif.id)}
                      className={`flex gap-3 p-3 rounded-xl mb-1 cursor-pointer transition-colors ${notif.is_read ? 'opacity-70 hover:bg-surface-elevated/50' : 'bg-surface-elevated hover:bg-surface-elevated/80'}`}
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text-primary text-sm truncate">{notif.title}</p>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
