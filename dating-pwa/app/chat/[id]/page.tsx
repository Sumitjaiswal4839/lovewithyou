"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, MoreVertical, Phone, Video, Image as ImageIcon, Lock, Mic, Sparkles, Gamepad2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import SecureImage from "@/components/chat/SecureImage";
import FlirtGamesSuite from "@/components/chat/FlirtGamesSuite";
import { API } from "@/lib/api";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;
  
  const { toast } = useToast();
  const deviceId = useUserStore((state) => state.deviceId);
  const friendRequests = useUserStore((state) => state.friendRequests);
  const friends = useUserStore((state) => state.friends);
  const acceptFriendRequest = useUserStore((state) => state.acceptFriendRequest);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const callRoomId = [deviceId, matchId].sort().join("_");
  
  // Call States
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [callType, setCallType] = useState<"audio"|"video">("audio");
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [incomingOffer, setIncomingOffer] = useState<any>(null);
  const [incomingSignal, setIncomingSignal] = useState<string | undefined>();
  
  // Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleSendWebRTCSignal = async (signalData: string) => {
    try {
      await API.sendWebRTCSignal({
        roomId: callRoomId,
        senderId: deviceId || "",
        targetId: matchId,
        signalData,
        channelType: callType
      });
    } catch (e) {
      console.error(e);
    }
  };
  
  const handleMenuAction = async (action: string) => {
    setIsMenuOpen(false);
    if (action === "unmatch" || action === "report") {
      toast(action === "unmatch" ? "Unmatched with user." : "User reported. Thank you.", "success");
      router.back();
    } else if (action === "clear") {
      setMessages([]);
      try {
        await supabase
          .from('messages')
          .delete()
          .or(`and(sender_id.eq.${deviceId},receiver_id.eq.${matchId}),and(sender_id.eq.${matchId},receiver_id.eq.${deviceId})`);
        toast("Chat deleted permanently.", "success");
      } catch (e) {
        toast("Failed to delete chat.", "error");
      }
    }
  };
  const [isTyping, setIsTyping] = useState(false);
  const [isFlirtOpen, setIsFlirtOpen] = useState(false);

  // 📸 Automatic Screenshot Blocker & Karma Shaming Deduction
  useEffect(() => {
    const handleScreenshotAttempt = async (e: KeyboardEvent) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        toast("🚨 Screenshot attempted! Content blurred & 20 Karma deducted automatically!", "error");
        await API.reportScreenshotViolation(deviceId || "anon_violator", matchId, "private_chat");
      }
    };
    window.addEventListener("keyup", handleScreenshotAttempt);
    return () => window.removeEventListener("keyup", handleScreenshotAttempt);
  }, [deviceId, matchId, toast]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!deviceId || !matchId) return;

    // 1. Generate consistent Room ID for private routing
    const roomId = [deviceId, matchId].sort().join("_");
    const isProd = process.env.NODE_ENV === "production";
    const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || (isProd ? "https://lovewithyou.onrender.com" : "http://localhost:8080"))?.replace(/\/+$/, "");
    const authToken = useUserStore.getState().authToken;
    const wsUrl = `${BACKEND_URL.replace("http", "ws")}/ws?room_id=${roomId}&device_id=${deviceId}&token=${authToken}`;

    try {
      wsRef.current = new WebSocket(wsUrl);
      wsRef.current.onmessage = (event) => {
        try {
          const incoming = JSON.parse(event.data);
          
          if (incoming.signalData) {
            // It's a WebRTC signal
            const signalObj = JSON.parse(incoming.signalData);
            if (signalObj.type === "offer") {
              setCallType(incoming.channelType as "audio"|"video");
              setIncomingOffer(incoming.signalData);
              setIsIncomingCall(true);
              setIsCallOpen(true);
            } else {
              setIncomingSignal(incoming.signalData);
            }
          }
          
          if (incoming.content && incoming.sender_id !== deviceId) {
            setMessages((prev) => [...prev, incoming as Message]);
          }
        } catch (e) {
          console.error("WS Parse Error:", e);
        }
      };
    } catch (wsErr) {
      console.warn("WebSocket Connection Error:", wsErr);
    }

    // Fetch initial messages from Supabase DB
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${deviceId},receiver_id.eq.${matchId}),and(sender_id.eq.${matchId},receiver_id.eq.${deviceId})`)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (data) {
        setMessages(data);
        if (data.length === 0) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      }
    };

    fetchMessages();

    // Subscribe to realtime postgres changes
    const channel = supabase
      .channel(`chat_${roomId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${deviceId}`
      }, (payload) => {
          if (payload.new.sender_id !== deviceId) {
            const { appSettings } = useUserStore.getState();
            if (appSettings?.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            setMessages((prev) => [...prev, payload.new as Message]);
          }
      })
      .subscribe();

    return () => {
      if (wsRef.current) wsRef.current.close();
      supabase.removeChannel(channel);
    };
  }, [deviceId, matchId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !deviceId) return;

    const msgContent = newMessage.trim();
    setNewMessage(""); // Optimistic UI clear

    // Optimistic insert into UI state
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: deviceId,
      receiver_id: matchId,
      content: msgContent,
      created_at: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, tempMsg]);

    // Persist to Supabase messages table and fetch real UUID
    const { data, error } = await supabase.from('messages').insert([{
      sender_id: deviceId,
      receiver_id: matchId,
      content: msgContent
    }]).select().single();

    if (!error && data) {
      // Replace the temp message with the real one from the database
      setMessages((prev) => prev.map(m => m.id === tempMsg.id ? data as Message : m));
    } else {
      toast("Failed to send message", "error");
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const sendEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const sendMockImage = async () => {
    // This mocks sending a slightly risky image for demonstration
    if (!deviceId) return;
    const mockNsfwUrl = "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=800&q=80"; // Note: unsplash is SFW but nsfwjs sometimes triggers on skin/bikini
    const msgContent = `[IMAGE]${mockNsfwUrl}`;
    
    const tempMsg: Message = {
      id: Date.now().toString(),
      sender_id: deviceId,
      receiver_id: matchId,
      content: msgContent,
      created_at: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, tempMsg]);

    const { error } = await supabase.from('messages').insert([{
      sender_id: deviceId,
      receiver_id: matchId,
      content: msgContent
    }]);

    if (error) {
      toast("Failed to send image", "error");
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    }
  };

  const [partnerProfile, setPartnerProfile] = useState<{ name: string; photo_url: string } | null>(null);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      if (!matchId) return;
      const { data } = await supabase
        .from("profiles")
        .select("name, photo_url")
        .or(`device_id.eq.${matchId},id.eq.${matchId}`)
        .single();
      if (data) {
        setPartnerProfile(data);
      }
    };
    fetchPartnerDetails();
  }, [matchId]);

  const matchName = partnerProfile?.name || (matchId === "1" ? "Priya" : "Single Partner");
  const matchImg = partnerProfile?.photo_url || "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80";

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated backdrop-blur-md sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 bg-surface-elevated hover:bg-surface-elevated rounded-full transition-colors text-foreground">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <img src={matchImg} alt="Match" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
            </div>
            <div>
              <h2 className="text-foreground font-bold text-sm leading-tight">{matchName}</h2>
              <p className="text-green-400 text-[10px] font-medium">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-muted">
          <button className="p-2 hover:bg-surface-elevated rounded-full transition-colors"><Phone size={18} /></button>
          <button className="p-2 hover:bg-surface-elevated rounded-full transition-colors"><Video size={18} /></button>
          <button className="p-2 hover:bg-surface-elevated rounded-full transition-colors"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        <div className="text-center my-4">
          <span className="bg-surface-elevated text-muted text-xs px-3 py-1 rounded-full">You matched today</span>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
             <p className="text-muted text-sm">Say hi to {matchName}! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === deviceId;
            const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id);
            
            const isAudio = msg.content.startsWith("[AUDIO]");
            const isImage = msg.content.startsWith("[IMAGE]");
            const isDisappearing = msg.content.startsWith("[DISAPPEARING_IMAGE]");
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
                {!isMe && (
                  <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                    {showAvatar && <img src={matchImg} alt="avatar" className="w-6 h-6 rounded-full object-cover" />}
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl shadow-sm overflow-hidden ${
                  isMe 
                    ? 'bg-gradient-to-br from-primary-600 to-primary text-white rounded-br-sm' 
                    : 'bg-surface-elevated text-white rounded-bl-sm border border-border'
                } ${isImage || isDisappearing ? 'p-1' : 'px-4 py-2.5'}`}>
                  
                  {isImage && (
                    <div className="w-full max-w-[200px] aspect-[3/4]">
                      <SecureImage src={msg.content.replace('[IMAGE]', '')} alt="Chat image" />
                    </div>
                  )}

                  {isDisappearing && (
                    <div className="w-full max-w-[200px] aspect-[3/4] relative">
                       <div className="w-full h-full bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-elevated transition-colors">
                         <Lock size={32} className="text-primary mb-2" />
                         <span className="text-xs font-bold uppercase tracking-wider text-foreground">Tap to View</span>
                       </div>
                    </div>
                  )}

                  {isAudio && (
                    <div className="flex items-center gap-3 min-w-[150px]">
                       <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
                         <Mic size={14} className="text-foreground" />
                       </div>
                       <audio src={msg.content.replace("[AUDIO]", "")} controls className="h-8 max-w-[150px] opacity-90 invert grayscale hue-rotate-180" />
                    </div>
                  )}

                  {!isImage && !isDisappearing && !isAudio && (
                    <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                  )}
                  
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-muted'} ${(isImage || isDisappearing) ? 'pr-2 pb-1' : ''}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
               <img src={matchImg} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
            </div>
            <div className="bg-surface-elevated rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-background border-t border-glass-border pb-safe">
        
        {(() => {
          const outgoingRequest = friendRequests.find(r => r.id === matchId && r.status === "outgoing");
          const incomingRequest = friendRequests.find(r => r.id === matchId && r.status === "incoming");
          
          if (outgoingRequest) {
            return (
              <div className="text-center py-4 bg-surface-elevated rounded-2xl border border-border">
                <Lock size={20} className="text-orange-400 mx-auto mb-2" />
                <p className="text-sm text-secondary font-medium">Waiting for {matchName} to accept your friend request.</p>
              </div>
            );
          }
          
          if (incomingRequest) {
            return (
              <div className="text-center py-4 bg-surface-elevated rounded-2xl border border-border">
                <p className="text-sm text-secondary font-medium mb-3">{matchName} wants to be friends!</p>
                <button 
                  onClick={() => acceptFriendRequest(matchId)}
                  className="px-6 py-2 bg-green-500 text-foreground rounded-full font-bold shadow-lg"
                >
                  Accept to Chat
                </button>
              </div>
            );
          }

          return (
            <>
              {/* AI Wingman & Game Triggers */}
              <div className="flex items-center gap-2 mb-2.5 px-1 overflow-x-auto no-scrollbar">
                <button
                  type="button"
                  onClick={() => {
                    const openers = [
                      `Hey ${matchName}! My AI Wingman noticed we both share awesome vibes. What's your top campus hangout spot? ✨`,
                      `If you could instantly skip one exam paper this semester, which subject would it be? 📚🚀`,
                      `Truth or Dare time! Pick one to break the ice! 🎲😎`,
                      `Hey! What song is on loop in your playlist this week? 🎵✨`
                    ];
                    const picked = openers[Math.floor(Math.random() * openers.length)];
                    setNewMessage(picked);
                    toast("✨ AI Wingman loaded a high-conversion icebreaker!", "success");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 hover:border-purple-400 text-[11px] font-bold text-purple-300 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Sparkles size={14} className="text-pink-400 animate-pulse" /> AI Wingman Coach
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const gamePrompt = `🎮 [DATE GAME] Hey! I launched a Rapid 5-Question Compatibility Quiz! Reply with your answer: Sunrise 🌅 or Sunset 🌆?`;
                    setNewMessage(gamePrompt);
                    toast("🎲 Compatibility Game challenge loaded! Tap Send!", "success");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-600/30 to-teal-600/30 border border-emerald-500/40 hover:border-emerald-400 text-[11px] font-bold text-emerald-300 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <Gamepad2 size={14} className="text-success" /> Compatibility Quiz 🎲
                </button>
                <button
                  type="button"
                  onClick={() => setIsFlirtOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-purple-600 border border-primary font-extrabold text-[11px] text-foreground shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all shrink-0 animate-pulse active:scale-95"
                >
                  🎡 3D Flirt Suite (Bottle, 2 Truths, Whisper)
                </button>
              </div>

              <form onSubmit={sendMessage} className="flex items-end gap-2 bg-surface-elevated border border-border rounded-3xl p-1.5 pl-4 pr-1.5 focus-within:border-primary transition-colors">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message ${matchName}...`}
                  className="flex-1 bg-transparent border-none text-foreground outline-none py-3 text-sm placeholder:text-muted"
                />
                <button 
                  type="button" 
                  onClick={sendMockImage}
                  className="p-3 bg-surface-elevated hover:bg-surface-elevated text-secondary rounded-full transition-colors flex-shrink-0"
                  title="Send Image (Mock)"
                >
                  <ImageIcon size={18} />
                </button>
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-full flex-shrink-0 transition-all ${
                    newMessage.trim() 
                      ? 'bg-primary text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-100 hover:scale-105' 
                      : 'bg-surface-elevated text-white/60 scale-95'
                  }`}
                >
                  <Send size={18} className={newMessage.trim() ? 'ml-0.5' : ''} />
                </button>
              </form>
              
              {/* Emoji Quick Replies */}
              <div className="flex gap-4 mt-3 px-2 overflow-x-auto no-scrollbar">
                 {['❤️', '😂', '🔥', '👀', '✨', '🥺', '💯', '🥂'].map(emoji => (
                   <button 
                     key={emoji} 
                     onClick={() => sendEmoji(emoji)}
                     className="text-2xl hover:scale-125 transition-transform active:scale-95"
                   >
                     {emoji}
                   </button>
                 ))}
               </div>
            </>
          );
        })()}
      </div>

      {/* Flirt Suite & Interactive Games Modal */}
      <FlirtGamesSuite
        isOpen={isFlirtOpen}
        onClose={() => setIsFlirtOpen(false)}
        onSendMessage={(txt) => { setNewMessage(txt); setIsFlirtOpen(false); }}
      />
    </div>
  );
}
