"use client";

import { useState, Suspense } from "react";
import Image from "next/image";
import { useUserStore } from "@/store/useUserStore";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Search, Lock, HeartPulse, Heart, Users, Check, X, Clock } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { motion } from "framer-motion";

function ChatListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as "matches" | "likes" | "friends" || "matches";
  const [activeTab, setActiveTab] = useState<"matches" | "likes" | "friends">(initialTab);
  
  const matches = useUserStore((state) => state.matches);
  const likes = useUserStore((state) => state.likes);
  const friends = useUserStore((state) => state.friends);
  const friendRequests = useUserStore((state) => state.friendRequests);
  const dailyUnlockDate = useUserStore((state) => state.dailyUnlockDate);
  const unlockDailyBlur = useUserStore((state) => state.unlockDailyBlur);
  const coins = useUserStore((state) => state.coins);
  
  const { toast } = useToast();

  const isUnlockedToday = dailyUnlockDate === new Date().toISOString().split('T')[0];

  const handleUnlock = () => {
    if (coins < 50) {
      toast("Not enough coins! You need 50 Coins to unlock.", "error");
      return;
    }
    const success = unlockDailyBlur();
    if (success) {
      toast("Unlocked all blurred profiles for today! 🔓", "success");
    }
  };

  const renderList = (list: typeof matches, isLikes: boolean) => {
    // Empty State matching the sleek look of the image
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center pt-28 pb-10 text-center">
          <div className="mb-4">
            {isLikes ? (
              <HeartPulse size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} strokeWidth={1.5} />
            ) : (
              <MessageCircle size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} strokeWidth={1.5} />
            )}
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>
            {isLikes ? "No likes yet." : "No matches yet."}
          </h3>
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Start swiping to find someone!
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 relative">
        {list.map((item, index) => {
          const isBlurred = index >= 5 && !isUnlockedToday;
          
          return (
            <div 
              key={`${item.id}-${index}`}
              onClick={() => {
                if (isBlurred) {
                  toast("Unlock to view this profile!", "error");
                  return;
                }
                if (!isLikes) {
                  router.push(`/chat/${item.id}`);
                } else {
                  toast("Match with them first to chat!", "success");
                }
              }}
              className={`flex items-center gap-4 p-3 border rounded-2xl transition-all ${isBlurred ? 'filter blur-md opacity-70 pointer-events-none' : 'cursor-pointer hover:opacity-80'}`}
              style={{ 
                backgroundColor: 'var(--color-surface-elevated)',
                borderColor: 'var(--color-border)'
              }}
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                <Image src={item.img} alt={item.name} fill sizes="56px" className="object-cover" />
                {!isBlurred && <div className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full" style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-surface-elevated)' }}></div>}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold truncate" style={{ color: 'var(--color-foreground)' }}>{item.name}</h3>
                  {!isBlurred && <span className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>{isLikes ? "Liked You!" : "New Match!"}</span>}
                </div>
                {!isBlurred && (
                  <div className="flex items-center gap-2">
                     {item.campus && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>🎓 {item.campus}</span>}
                     <KarmaBadge score={item.karma} showText={false} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Paywall Overlay */}
        {list.length > 5 && !isUnlockedToday && (
          <div className="absolute bottom-0 left-0 w-full h-48 flex flex-col items-center justify-end pb-8 z-10 pointer-events-auto" style={{ background: 'linear-gradient(to top, var(--color-background) 20%, transparent)' }}>
            <div className="backdrop-blur-xl p-5 rounded-3xl border shadow-2xl flex flex-col items-center text-center max-w-[280px]" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}>
                <Lock size={24} />
              </div>
              <h3 className="font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>See All {isLikes ? "Likes" : "Matches"}</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>You can only see 5 profiles for free per day. Unlock the rest now!</p>
              <button 
                onClick={handleUnlock}
                className="btn-signature-gradient w-full py-3 rounded-xl font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                Unlock All Today (50 Coins)
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFriendsTab = () => {
    const incomingReqs = friendRequests.filter(r => r.status === "incoming");
    const outgoingReqs = friendRequests.filter(r => r.status === "outgoing");

    return (
      <div className="space-y-6">
        {/* Incoming Requests */}
        {incomingReqs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>Friend Requests ({incomingReqs.length})</h3>
            {incomingReqs.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 border rounded-2xl" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <img src={req.img} alt={req.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{req.name}</h4>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Wants to be friends</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => useUserStore.getState().acceptFriendRequest(req.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'var(--color-success)', color: '#fff', opacity: 0.9 }}
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => useUserStore.getState().declineFriendRequest(req.id)}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'var(--color-error)', color: '#fff', opacity: 0.9 }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Outgoing Requests */}
        {outgoingReqs.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>Sent Requests ({outgoingReqs.length})</h3>
            {outgoingReqs.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 border rounded-2xl opacity-70" style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src={req.img} alt={req.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate" style={{ color: 'var(--color-foreground)' }}>{req.name}</h4>
                  <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--color-warning)' }}><Clock size={10} /> Pending Approval</p>
                </div>
                <button 
                  onClick={() => router.push(`/chat/${req.id}`)}
                  className="px-3 py-1.5 text-xs rounded-full font-medium"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-foreground)' }}
                >
                  View Chat
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-muted)' }}>My Friends ({friends.length})</h3>
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center pt-10 pb-10 text-center">
              <Users size={48} style={{ color: 'var(--color-text-muted)', opacity: 0.4 }} strokeWidth={1.5} className="mb-4" />
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--color-foreground)' }}>No friends yet.</h3>
              <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Send friend requests to connect!</p>
            </div>
          ) : (
            friends.map(friend => (
              <div 
                key={friend.id}
                onClick={() => router.push(`/chat/${friend.id}`)}
                className="flex items-center gap-4 p-3 border rounded-2xl cursor-pointer hover:opacity-80 transition-all"
                style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 relative">
                  <img src={friend.img} alt={friend.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-2 rounded-full" style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-surface-elevated)' }}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate" style={{ color: 'var(--color-foreground)' }}>{friend.name}</h4>
                  <p className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>Friend</p>
                </div>
                <MessageCircle size={18} style={{ color: 'var(--color-text-muted)' }} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "matches", label: "My Matches", count: matches.length },
    { id: "likes", label: "Who Liked Me", count: likes.length },
    { id: "friends", label: "Friends", count: friends.length + friendRequests.filter(r => r.status === 'incoming').length },
  ];

  return (
    <div className="flex flex-col h-screen pb-20 font-sans" style={{ backgroundColor: 'var(--color-background)' }}>
      
      {/* Header */}
      <div className="px-5 pt-12 pb-0 glass border-b" style={{ borderColor: 'var(--color-glass-border)' }}>
        <h1 className="text-2xl font-black mb-5 tracking-tight" style={{ color: 'var(--color-foreground)' }}>Connections</h1>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full border rounded-2xl pl-11 pr-4 py-3 outline-none transition shadow-sm text-sm"
            style={{ 
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-foreground)'
            }}
          />
        </div>

        {/* Tabs - Sleek Design like image_ad2eaf.png */}
        <div className="flex w-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="relative flex-1 py-3.5 flex justify-center items-center gap-2 transition hover:opacity-80"
                style={{ 
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: isActive ? '800' : '700',
                  fontSize: '0.875rem'
                }}
              >
                {tab.label}
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-full font-black"
                  style={{ 
                    backgroundColor: isActive ? 'var(--color-primary-soft)' : 'var(--color-surface-elevated)',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'
                  }}
                >
                  {tab.count}
                </span>
                
                {/* Active Tab Underline Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         {activeTab === "matches" && renderList(matches, false)}
         {activeTab === "likes" && renderList(likes, true)}
         {activeTab === "friends" && renderFriendsTab()}
      </div>
      
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />
      </div>
    }>
      <ChatListContent />
    </Suspense>
  );
}