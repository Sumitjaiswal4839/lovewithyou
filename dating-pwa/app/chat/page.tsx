"use client";

import { useState, useEffect, Suspense } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageCircle, Search, Lock, HeartPulse, Heart, Users, Check, X, Clock } from "lucide-react";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { useToast } from "@/components/ui/ToastProvider";

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
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          {isLikes ? <HeartPulse size={48} className="text-white/10 mb-2" /> : <MessageCircle size={48} className="text-white/10 mb-2" />}
          <p>{isLikes ? "No likes yet." : "No matches yet."}</p>
          <p className="text-xs">Start swiping to find someone!</p>
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
              className={`flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl transition-all ${isBlurred ? 'filter blur-md opacity-70 pointer-events-none' : 'cursor-pointer hover:bg-white/10'}`}
            >
              {/* Avatar */}
              <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                {!isBlurred && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full"></div>}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold truncate">{item.name}</h3>
                  {!isBlurred && <span className="text-xs text-primary-400 font-medium">{isLikes ? "Liked You!" : "New Match!"}</span>}
                </div>
                {!isBlurred && (
                  <div className="flex items-center gap-2">
                     {item.campus && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-300">🎓 {item.campus}</span>}
                     <KarmaBadge score={item.karma} showText={false} />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Paywall Overlay */}
        {list.length > 5 && !isUnlockedToday && (
          <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-dark-bg via-dark-bg/90 to-transparent flex flex-col items-center justify-end pb-8 z-10 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-xl p-5 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center text-center max-w-[280px]">
              <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 mb-3">
                <Lock size={24} />
              </div>
              <h3 className="text-white font-bold mb-1">See All {isLikes ? "Likes" : "Matches"}</h3>
              <p className="text-xs text-gray-400 mb-4">You can only see 5 profiles for free per day. Unlock the rest now!</p>
              <button 
                onClick={handleUnlock}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-pink-500 text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Friend Requests ({incomingReqs.length})</h3>
            {incomingReqs.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <img src={req.img} alt={req.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{req.name}</h4>
                  <p className="text-xs text-gray-400">Wants to be friends</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => useUserStore.getState().acceptFriendRequest(req.id)}
                    className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/30 transition-colors"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => useUserStore.getState().declineFriendRequest(req.id)}
                    className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors"
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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">Sent Requests ({outgoingReqs.length})</h3>
            {outgoingReqs.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl opacity-70">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <img src={req.img} alt={req.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm truncate">{req.name}</h4>
                  <p className="text-[11px] text-orange-400 flex items-center gap-1"><Clock size={10} /> Pending Approval</p>
                </div>
                <button 
                  onClick={() => router.push(`/chat/${req.id}`)}
                  className="px-3 py-1.5 text-xs bg-white/10 text-white rounded-full font-medium"
                >
                  View Chat
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Friends List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider px-1">My Friends ({friends.length})</h3>
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              You haven't added any friends yet.
            </div>
          ) : (
            friends.map(friend => (
              <div 
                key={friend.id}
                onClick={() => router.push(`/chat/${friend.id}`)}
                className="flex items-center gap-4 p-3 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 relative">
                  <img src={friend.img} alt={friend.name} className="w-full h-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-bg rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold truncate">{friend.name}</h4>
                  <p className="text-xs text-primary-400 font-medium">Friend</p>
                </div>
                <MessageCircle size={18} className="text-gray-400" />
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg pb-20">
      
      {/* Header */}
      <div className="p-4 pt-8 pb-0 glass border-b border-glass-border">
        <h1 className="text-2xl font-bold text-white mb-4">Connections</h1>
        
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:border-primary-500 text-sm text-gray-200"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab("matches")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "matches" ? "border-primary-500 text-primary-500" : "border-transparent text-gray-400"}`}
          >
            My Matches <span className="ml-1 bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{matches.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("likes")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "likes" ? "border-pink-500 text-pink-500" : "border-transparent text-gray-400"}`}
          >
            Who Liked Me <span className="ml-1 bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{likes.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab("friends")}
            className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === "friends" ? "border-blue-500 text-blue-500" : "border-transparent text-gray-400"}`}
          >
            Friends <span className="ml-1 bg-white/10 text-white px-2 py-0.5 rounded-full text-[10px]">{friends.length + friendRequests.filter(r => r.status === 'incoming').length}</span>
          </button>
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto p-4">
         {activeTab === "matches" && renderList(matches, false)}
         {activeTab === "likes" && renderList(likes, true)}
         {activeTab === "friends" && renderFriendsTab()}
      </div>
      
    </div>
  );
}

export default function ChatListPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-white">Loading Connections...</div>}>
      <ChatListContent />
    </Suspense>
  );
}
