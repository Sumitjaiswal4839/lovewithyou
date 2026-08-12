"use client";

import { useUserStore } from "@/store/useUserStore";
import { Heart, CheckCircle2, MessageSquare, Info, Check, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const notifications = useUserStore((state) => state.notifications);
  const unreadCount = useUserStore((state) => state.unreadNotificationCount);
  const fetchNotifications = useUserStore((state) => state.fetchNotifications);
  const markNotificationRead = useUserStore((state) => state.markNotificationRead);
  const markAllNotificationsRead = useUserStore((state) => state.markAllNotificationsRead);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case "match": return <Heart className="w-6 h-6 text-primary" fill="currentColor" />;
      case "like": return <Heart className="w-6 h-6 text-purple-500" />;
      case "alert": return <Info className="w-6 h-6 text-accent" />;
      case "system": return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default: return <MessageSquare className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 pt-20">
      <div className="max-w-md mx-auto w-full px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-surface-elevated transition-colors">
              <ArrowLeft size={24} className="text-text-primary" />
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-text-primary">Notifications</h1>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-full transition-colors"
            >
              <Check size={14} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center bg-surface rounded-3xl border border-border">
              <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mb-4">
                <Info size={28} className="text-muted" />
              </div>
              <h3 className="text-lg font-bold text-foreground">All caught up!</h3>
              <p className="text-sm text-muted mt-1 max-w-[200px]">
                You have no new notifications right now. Check back later.
              </p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={notif.id}
                onClick={() => !notif.is_read && markNotificationRead(notif.id)}
                className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                  notif.is_read 
                    ? 'bg-surface border-border opacity-70 hover:bg-surface-elevated' 
                    : 'bg-surface-elevated border-primary/20 shadow-sm hover:shadow-md hover:border-primary/40'
                }`}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notif.is_read ? 'bg-background' : 'bg-background shadow-sm border border-border'}`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className={`text-base font-bold truncate ${notif.is_read ? 'text-text-primary' : 'text-foreground'}`}>
                    {notif.title}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5 line-clamp-2">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <div className="flex-shrink-0 self-center">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
