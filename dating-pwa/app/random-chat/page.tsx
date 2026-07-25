"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Send, Loader2, RefreshCw, Plus, SkipForward, X as XIcon, Lock, Image as ImageIcon, Mic, StopCircle, Eye, EyeOff } from "lucide-react";
import RandomChatHeader from "@/components/RandomChatHeader";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import SecureImage from "@/components/chat/SecureImage";

interface Message {
  id: string;
  senderId: "me" | "partner";
  text: string;
  timestamp: Date;
}

export default function RandomChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const spendCoins = useUserStore(state => state.spendCoins);
  const coins = useUserStore(state => state.coins);

  // Connection states
  const [isSearching, setIsSearching] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const disappearingFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [partner, setPartner] = useState({
    id: "random_123",
    originalName: "Sumit",
    hiddenName: "S***t",
    location: "Delhi, DL",
    gender: "Men",
    isLiked: false,
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500&h=700&fit=crop"
    ]
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [viewedDisappearingMsgs, setViewedDisappearingMsgs] = useState<Record<string, boolean>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mock finding a partner
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
        setIsConnected(true);
        // Add a welcome message from system
        setMessages([
          {
            id: Date.now().toString(),
            senderId: "partner",
            text: "Hi! I just joined.",
            timestamp: new Date()
          }
        ]);
      }, 3000); // 3 seconds search
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  // Mock partner disconnecting after some time randomly
  useEffect(() => {
    if (!isConnected) return;
    
    // Partner disconnects after 3-5 minutes (mocked to 2 minutes for testing)
    const timeout = setTimeout(() => {
      setIsConnected(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        senderId: "partner",
        text: "User has disconnected.",
        timestamp: new Date()
      }]);
    }, 120000); 

    return () => clearTimeout(timeout);
  }, [isConnected]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendRawMessage(inputText.trim());
    setInputText("");
  };

  const sendRawMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Mock partner reply
    setTimeout(() => {
      if (isConnected) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            senderId: partner.id as any,
            text: text.startsWith("[IMAGE]") ? "Nice photo!" : text.startsWith("[AUDIO]") ? "Listening now..." : "Haha, totally!",
            timestamp: new Date(),
          },
        ]);
      }
    }, Math.random() * 2000 + 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isDisappearing: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast("Image must be less than 5MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const prefix = isDisappearing ? "[DISAPPEARING_IMAGE]" : "[IMAGE]";
      sendRawMessage(`${prefix}${dataUrl}`);
      setShowAttachmentMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          sendRawMessage(`[AUDIO]${dataUrl}`);
        };
        reader.readAsDataURL(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowAttachmentMenu(false);
    } catch (err) {
      toast("Microphone access denied", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const revealDisappearingMessage = (msgId: string) => {
    setViewedDisappearingMsgs(prev => ({ ...prev, [msgId]: true }));
    // Auto hide/delete after 5 seconds
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }, 5000);
  };

  const handleLike = () => {
    if (!isConnected) return;
    if (partner.isLiked) return;

    // Deduct coins for liking in random chat
    if (coins < 1) {
      toast("You need 1 coin to like and reveal their name!", "error");
      return;
    }
    
    spendCoins(1);
    setPartner(prev => ({ ...prev, isLiked: true }));
    toast("You liked them! Their name is revealed. (-1 Coin)", "success");
    
    // System message
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      senderId: "me",
      text: "You sent a Like ❤️",
      timestamp: new Date()
    }]);
  };

  const handleAddFriend = () => {
    if (!isConnected) return;
    
    // Check if already friends or requested
    const state = useUserStore.getState();
    if (state.friends.some(f => f.id === partner.id)) {
      toast("You are already friends!", "error");
      return;
    }
    if (state.friendRequests.some(r => r.id === partner.id)) {
      toast("Request already sent!", "error");
      return;
    }
    
    // Send request
    const sendFriendRequest = useUserStore.getState().sendFriendRequest;
    sendFriendRequest(partner.id, partner.originalName, partner.photos[0]);
    toast("Friend request sent! 🤝", "success");
  };

  const handleReport = () => {
    toast("User reported and blocked. Disconnecting...", "error");
    setIsConnected(false);
  };

  const nextChat = () => {
    setIsConnected(false);
    setMessages([]);
    setPartner({
      id: Math.random().toString(),
      originalName: "Priya",
      hiddenName: "P***a",
      location: "Mumbai, MH",
      gender: "Women",
      isLiked: false,
      photos: [
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=700&fit=crop",
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&h=700&fit=crop"
      ]
    });
    setIsSearching(true);
  };

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-dark-bg text-center px-4">
        <div className="w-24 h-24 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin mb-8"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Finding someone...</h2>
        <p className="text-gray-400">Looking for people nearby in Random Chat</p>
        <button onClick={() => router.back()} className="mt-12 px-6 py-2 bg-white/10 rounded-full text-white font-medium hover:bg-white/20 transition">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      <RandomChatHeader 
        partner={partner} 
        onLike={handleLike}
        onAddFriend={handleAddFriend}
        onReport={handleReport}
        onProfileClick={() => isConnected && setShowProfileModal(true)}
        isConnected={isConnected}
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-4">
          <span className="bg-white/5 text-gray-400 text-xs px-3 py-1 rounded-full">
            You are now chatting with a random stranger
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          const isSystem = msg.text === "User has disconnected." || msg.text === "You sent a Like ❤️";

          if (isSystem) {
             return (
               <div key={msg.id} className="text-center my-2">
                 <span className={`text-xs px-3 py-1 rounded-full ${msg.text.includes('disconnected') ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'}`}>
                   {msg.text}
                 </span>
               </div>
             );
          }

          const isAudio = msg.text.startsWith("[AUDIO]");
          const isImage = msg.text.startsWith("[IMAGE]");
          const isDisappearing = msg.text.startsWith("[DISAPPEARING_IMAGE]");

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl shadow-sm overflow-hidden ${
                isMe 
                  ? 'bg-gradient-to-br from-primary-600 to-primary-500 text-white rounded-br-sm' 
                  : 'bg-white/10 text-gray-200 rounded-bl-sm border border-white/5'
              } ${isImage || isDisappearing ? 'p-1' : 'px-4 py-2.5'}`}>
                
                {isImage && (
                  <div className="w-full max-w-[200px] aspect-[3/4]">
                     <SecureImage src={msg.text.replace("[IMAGE]", "")} alt="Sent photo" />
                  </div>
                )}

                {isDisappearing && (
                  <div className="w-full max-w-[200px] aspect-[3/4] relative">
                    {viewedDisappearingMsgs[msg.id] ? (
                       <img src={msg.text.replace("[DISAPPEARING_IMAGE]", "")} alt="Disappearing" className="w-full h-full object-cover" />
                    ) : (
                       <div 
                         onClick={() => revealDisappearingMessage(msg.id)}
                         className="w-full h-full bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                       >
                         <Lock size={32} className="text-primary-400 mb-2" />
                         <span className="text-xs font-bold uppercase tracking-wider text-white">Tap to View</span>
                         <span className="text-[10px] text-gray-400 mt-1">Disappears in 5s</span>
                       </div>
                    )}
                  </div>
                )}

                {isAudio && (
                  <div className="flex items-center gap-3 min-w-[150px]">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Mic size={14} className="text-white" />
                     </div>
                     <audio src={msg.text.replace("[AUDIO]", "")} controls className="h-8 max-w-[150px] opacity-90 invert grayscale hue-rotate-180" />
                  </div>
                )}

                {!isImage && !isDisappearing && !isAudio && (
                  <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                )}
                
                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-primary-200' : 'text-gray-500'} ${(isImage || isDisappearing) ? 'pr-2 pb-1' : ''}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area / Disconnected State */}
      <div className="p-3 bg-dark-bg border-t border-glass-border pb-safe">
        {!isConnected ? (
          <button 
            onClick={nextChat}
            className="w-full flex items-center justify-center gap-2 py-4 bg-primary-500 text-white rounded-2xl font-bold hover:bg-primary-600 transition"
          >
            <RefreshCw size={20} /> Skip to Next Person
          </button>
        ) : (
          <div className="flex items-end gap-2">
            <button 
              onClick={nextChat}
              title="Skip to Next Person"
              className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
            >
              <SkipForward size={20} />
            </button>

            <form onSubmit={handleSendMessage} className="flex-1 flex items-end gap-1 bg-white/5 border border-white/10 rounded-3xl p-1.5 focus-within:border-primary-500 transition-colors relative">
              
              {/* Attachment Popover */}
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-3 bg-dark-bg border border-white/10 rounded-2xl shadow-2xl p-2 flex flex-col gap-1 w-48 z-10"
                  >
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-white text-sm text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <ImageIcon size={16} />
                      </div>
                      Send Photo
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => disappearingFileInputRef.current?.click()}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors text-white text-sm text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <EyeOff size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span>Disappearing</span>
                        <span className="text-[10px] text-gray-400">View once (5s)</span>
                      </div>
                    </button>
                    
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
                    <input type="file" ref={disappearingFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {isRecording ? (
                <div className="flex-1 flex items-center justify-between pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-sm text-red-400 font-medium">Recording...</span>
                  </div>
                  <button type="button" onClick={stopRecording} className="p-2 bg-red-500 text-white rounded-full mr-1">
                    <StopCircle size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    className={`p-3 rounded-full transition-colors flex-shrink-0 ${showAttachmentMenu ? 'bg-primary-500/20 text-primary-400' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Plus size={20} className={showAttachmentMenu ? 'rotate-45 transition-transform' : 'transition-transform'} />
                  </button>
                  
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none text-white outline-none py-3 text-sm placeholder:text-gray-500"
                    onFocus={() => setShowAttachmentMenu(false)}
                  />
                  
                  {inputText.trim() ? (
                    <button 
                      type="submit" 
                      className="p-3 rounded-full flex-shrink-0 transition-all bg-primary-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] scale-100 hover:scale-105"
                    >
                      <Send size={18} className="ml-0.5" />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startRecording}
                      className="p-3 rounded-full flex-shrink-0 transition-all bg-white/10 text-gray-400 hover:text-white hover:bg-white/20"
                    >
                      <Mic size={18} />
                    </button>
                  )}
                </>
              )}
            </form>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-dark-bg border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                <XIcon size={16} />
              </button>
              
              <div className="p-4 border-b border-white/10 text-center">
                <h3 className="text-xl font-bold text-white">
                  {partner.isLiked ? partner.originalName : partner.hiddenName}
                </h3>
                <p className="text-sm text-gray-400">
                  {partner.isLiked ? "Profile Unlocked" : "Like to unlock full profile"}
                </p>
              </div>

              <div className="p-4 flex gap-3 overflow-x-auto snap-x no-scrollbar">
                {partner.photos.map((photo, i) => (
                  <div key={i} className="flex-shrink-0 w-48 aspect-[3/4] rounded-2xl overflow-hidden snap-center relative">
                    <img 
                      src={photo} 
                      alt={`Photo ${i+1}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${!partner.isLiked ? 'blur-xl scale-110 brightness-50' : 'blur-0'}`} 
                    />
                    {!partner.isLiked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                         <Lock size={32} className="text-white/50 mb-2" />
                         <span className="text-white/80 font-bold text-xs uppercase tracking-wider">Locked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!partner.isLiked && (
                <div className="p-4 pt-0">
                  <button 
                    onClick={() => {
                       handleLike();
                       if (coins >= 1) {
                         // The like function handles the logic, if it succeeds, the state updates and photos unblur
                       }
                    }}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl transition-colors shadow-lg shadow-primary-500/20"
                  >
                    Unlock with 1 Coin
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
