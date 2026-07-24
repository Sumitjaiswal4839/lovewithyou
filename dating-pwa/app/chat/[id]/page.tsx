"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Send, MoreVertical, ShieldAlert, Phone, Video } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

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
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!deviceId || !matchId) return;

    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${deviceId},receiver_id.eq.${matchId}),and(sender_id.eq.${matchId},receiver_id.eq.${deviceId})`)
        .order('created_at', { ascending: true })
        .limit(50);
        
      if (data) {
        setMessages(data);
        
        // Simulate them typing if you have no messages yet
        if (data.length === 0) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 5000); // Stop after 5s
        }
      }
    };

    fetchMessages();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`chat_${Math.min(Number(deviceId), Number(matchId))}_${Math.max(Number(deviceId), Number(matchId))}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `receiver_id=eq.${deviceId}` // Only listen to incoming messages to avoid duplicates
      }, (payload) => {
          if (payload.new.sender_id !== deviceId) {
            // Trigger haptic feedback for incoming messages if enabled
            const { appSettings } = useUserStore.getState();
            if (appSettings?.hapticsEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
          }
          
          setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [deviceId, matchId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !deviceId) return;

    const msgContent = newMessage.trim();
    setNewMessage(""); // Optimistic UI clear
    
    // Optimistic insert
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
      toast("Failed to send message", "error");
      // Remove temp message on failure
      setMessages((prev) => prev.filter(m => m.id !== tempMsg.id));
    } else {
      // Simulate reply typing
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
  };

  const sendEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  // Mock match data based on ID since we don't have a users table fetch yet
  const matchName = matchId === "1" ? "Priya" : "Match " + matchId.substring(0,4);
  const matchImg = matchId === "1" ? "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80";

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/60 backdrop-blur-md sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white">
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <img src={matchImg} alt="Match" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
            </div>
            <div>
              <h2 className="text-white font-bold text-sm leading-tight">{matchName}</h2>
              <p className="text-green-400 text-[10px] font-medium">Online</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Phone size={18} /></button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><Video size={18} /></button>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors"><MoreVertical size={18} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-4">
        <div className="text-center my-4">
          <span className="bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-full">You matched today</span>
        </div>
        
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 opacity-50">
             <p className="text-gray-400 text-sm">Say hi to {matchName}! 👋</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender_id === deviceId;
            const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.sender_id !== msg.sender_id);
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-4 group`}>
                {!isMe && (
                  <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                    {showAvatar && <img src={matchImg} alt="avatar" className="w-6 h-6 rounded-full object-cover" />}
                  </div>
                )}
                
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  isMe 
                    ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-sm' 
                    : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'
                }`}>
                  <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                  <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-500'}`}>
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
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-dark-bg border-t border-glass-border pb-safe">
        <form onSubmit={sendMessage} className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl p-1.5 pl-4 pr-1.5 focus-within:border-primary-500 transition-colors">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${matchName}...`}
            className="flex-1 bg-transparent border-none text-white outline-none py-3 text-sm placeholder:text-gray-500"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              newMessage.trim() 
                ? 'bg-primary-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-100 hover:scale-105' 
                : 'bg-white/10 text-gray-500 scale-95'
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
      </div>
    </div>
  );
}
