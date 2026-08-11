"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Send, RefreshCw, Plus, SkipForward, X as XIcon, Lock, Image as ImageIcon, Mic, StopCircle, EyeOff, ShieldAlert, User, BarChart2, Smile, AlertTriangle, CheckCircle2, Dices, Lightbulb, History, Heart, Clock } from "lucide-react";
import RandomChatHeader from "@/components/RandomChatHeader";
import MatchPreferencesHeader from "@/components/MatchPreferencesHeader";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  senderId: "me" | "partner";
  text: string;
  timestamp: Date;
  pollData?: {
    question: string;
    yesVotes: number;
    noVotes: number;
    myVote?: "yes" | "no";
  };
}

interface PartnerItem {
  id: string;
  originalName: string;
  hiddenName: string;
  location: string;
  gender: string;
  isLiked: boolean;
  photos: string[];
  matchedTime: string;
}

const ICEBREAKER_PROMPTS = [
  "✈️ If you could travel anywhere tonight, where would we go?",
  "🍕 Pineapple on pizza: Genius or Crime?",
  "🎧 What song is playing on loop in your head right now?",
  "🌙 Are you a night owl or an early morning person?",
  "🎬 Favorite comfort movie you can rewatch 100 times?",
  "🚀 What's your biggest spontaneous adventure story?"
];

const SPIN_VIBES = [
  { name: "College Student 🎓", tag: "student" },
  { name: "Music Lover 🎵", tag: "music" },
  { name: "Night Owl 🌙", tag: "night_owl" },
  { name: "Fitness Enthusiast 🏋️", tag: "fitness" },
  { name: "Anime Fan 🎌", tag: "anime" },
  { name: "Creative Soul 🎭", tag: "creative" }
];

export default function RandomChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const spendCoins = useUserStore(state => state.spendCoins);
  const coins = useUserStore(state => state.coins);
  const profile = useUserStore(state => state.profile);

  // 1. Pre-Chat Verification & Target Selection States
  const [showPreChatModal, setShowPreChatModal] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [targetGenderPreference, setTargetGenderPreference] = useState<"Female" | "Male" | "Anyone">("Female");
  const [connectionsLeft, setConnectionsLeft] = useState(20);

  // 2. Spin-to-Connect States
  const [showSpinWheelModal, setShowSpinWheelModal] = useState(false);
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [landedVibe, setLandedVibe] = useState<string | null>(null);

  // 3. Matching History Vault States
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [matchingHistory, setMatchingHistory] = useState<PartnerItem[]>([]);
  const [selectedHistoryPartner, setSelectedHistoryPartner] = useState<PartnerItem | null>(null);

  // Connection states
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showStickerTray, setShowStickerTray] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const disappearingFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [partner, setPartner] = useState<PartnerItem>({
    id: "random_123",
    originalName: "Ayesha",
    hiddenName: "A***a",
    location: "Delhi, DL",
    gender: "Female",
    isLiked: false,
    photos: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=700&fit=crop"
    ],
    matchedTime: "Just now"
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

  // Handle Match Search after Agreement
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
        setIsConnected(true);

        const partnerGenderName = targetGenderPreference === "Female" ? "Ayesha" : targetGenderPreference === "Male" ? "Rohan" : "Ananya";
        const partnerGenderType = targetGenderPreference === "Female" ? "Female" : targetGenderPreference === "Male" ? "Male" : "Female";

        const newPartner: PartnerItem = {
          id: Math.random().toString(),
          originalName: partnerGenderName,
          hiddenName: `${partnerGenderName[0]}***${partnerGenderName[partnerGenderName.length - 1]}`,
          location: "Delhi, DL",
          gender: partnerGenderType,
          isLiked: false,
          photos: [
            partnerGenderType === "Female" 
              ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=700&fit=crop"
              : "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&h=700&fit=crop"
          ],
          matchedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setPartner(newPartner);
        setMatchingHistory(prev => [newPartner, ...prev]);

        setMessages([
          {
            id: Date.now().toString(),
            senderId: "partner",
            text: `Hi! Connected via ${landedVibe ? landedVibe : targetGenderPreference === "Female" ? "Female-Only ♀️" : "Random"} match pool!`,
            timestamp: new Date()
          }
        ]);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSearching, targetGenderPreference, landedVibe]);

  const handleAgreeAndEnter = () => {
    if (coins < 1) {
      toast("Need at least 1 Coin to start Random Chat!", "error");
      return;
    }
    spendCoins(1);
    setConnectionsLeft(20);
    setShowPreChatModal(false);
    setShowWarningModal(false);
    setIsSearching(true);
    toast(`1 Coin deducted! 20 ${targetGenderPreference} connections unlocked 🔥`, "success");
  };

  const handleSpinToConnect = () => {
    setIsSpinningWheel(true);
    setLandedVibe(null);

    setTimeout(() => {
      const selected = SPIN_VIBES[Math.floor(Math.random() * SPIN_VIBES.length)];
      setLandedVibe(selected.name);
      setIsSpinningWheel(false);
      toast(`🎰 Wheel landed on: ${selected.name}! Matching now...`, "success");

      setTimeout(() => {
        setShowSpinWheelModal(false);
        setIsConnected(false);
        setMessages([]);
        setIsSearching(true);
      }, 1200);
    }, 2000);
  };

  const sendRawMessage = (text: string, pollData?: Message['pollData']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: "me",
      text: text,
      timestamp: new Date(),
      pollData,
    };

    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      if (isConnected) {
        let reply = "That's super cool! Tell me more ✨";
        if (text.includes("GIF_") || text.includes("STICKER_")) reply = "Haha love that reaction! 😂🔥";
        if (text.startsWith("[AUDIO]")) reply = "Listening to your voice note right now! 🎙️🎧";
        if (text.startsWith("✈️") || text.startsWith("🍕") || text.startsWith("🎧")) reply = "Ooh great question! Honestly, I'd pick Paris or Tokyo for a midnight flight! ✈️✨";

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            senderId: partner.id as any,
            text: text.startsWith("[DISAPPEARING_IMAGE]") ? "Unlocked your snap! 💖" : reply,
            timestamp: new Date(),
          },
        ]);
      }
    }, 1500);
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    sendRawMessage(inputText.trim());
    setInputText("");
  };

  const sendIcebreakerPrompt = (promptText: string) => {
    sendRawMessage(promptText);
    toast("Sent Icebreaker prompt to avoid awkward silence! 💡", "info");
  };

  const sendStickerReaction = (emoji: string) => {
    sendRawMessage(`STICKER_${emoji}`);
    setShowStickerTray(false);
  };

  const createQuickPoll = (question: string) => {
    sendRawMessage(`[POLL] ${question}`, {
      question,
      yesVotes: 1,
      noVotes: 0,
      myVote: "yes"
    });
    setShowAttachmentMenu(false);
  };

  const handlePollVote = (msgId: string, option: "yes" | "no") => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId && m.pollData) {
        return {
          ...m,
          pollData: {
            ...m.pollData,
            yesVotes: option === "yes" ? m.pollData.yesVotes + 1 : m.pollData.yesVotes,
            noVotes: option === "no" ? m.pollData.noVotes + 1 : m.pollData.noVotes,
            myVote: option
          }
        };
      }
      return m;
    }));
    toast(`Voted ${option.toUpperCase()} on poll!`, "info");
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
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          sendRawMessage(`[AUDIO]${dataUrl}`);
        };
        reader.readAsDataURL(audioBlob);
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
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== msgId));
      toast("👻 Ephemeral photo auto-deleted after 10 seconds!", "info");
    }, 10000);
  };

  const handleLikePartner = (targetPartner: PartnerItem) => {
    if (targetPartner.isLiked) return;
    if (coins < 1) {
      toast("Need 1 coin to like and unlock their profile name!", "error");
      return;
    }
    spendCoins(1);

    const updateLikeState = (p: PartnerItem) => (p.id === targetPartner.id ? { ...p, isLiked: true } : p);
    setPartner(prev => updateLikeState(prev));
    setMatchingHistory(prev => prev.map(p => updateLikeState(p)));
    if (selectedHistoryPartner) {
      setSelectedHistoryPartner(prev => (prev ? { ...prev, isLiked: true } : null));
    }
    toast(`Liked ${targetPartner.originalName}! Profile unlocked (-1 Coin)`, "success");
  };

  const nextChat = () => {
    if (connectionsLeft <= 1) {
      toast("Completed 20 connections limit for 1 Coin! Start new session.", "info");
      setShowPreChatModal(true);
      setIsConnected(false);
      return;
    }
    setConnectionsLeft(prev => prev - 1);
    setIsConnected(false);
    setMessages([]);
    setIsSearching(true);
  };

  // 1. PRE-CHAT VERIFICATION & TARGET GENDER SELECTION MODAL
  if (showPreChatModal) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4 text-foreground font-sans overflow-y-auto">
        <div className="bg-white/[0.03] border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-600 flex items-center justify-center text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Identity &amp; Target Setup</h2>
              <p className="text-xs text-muted font-medium">Verify your profile &amp; choose who to chat with</p>
            </div>
          </div>

          <div className="bg-surface-elevated border border-border rounded-2xl p-4 space-y-1.5">
            <span className="text-[10px] font-black uppercase text-muted">Your Current Identity</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-black text-foreground flex items-center gap-2">
                👤 {profile?.gender || "Male"} • Age {profile?.age || 22}
              </span>
              <span className="text-[10px] bg-success/20 text-emerald-300 font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Verified User ✅
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-primary block">
              Who would you like to chat with?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTargetGenderPreference("Female")}
                className={`py-3 px-2 rounded-2xl text-xs font-black text-center transition border ${
                  targetGenderPreference === "Female"
                    ? "bg-primary/20 border-primary text-primary shadow-md shadow-primary/20"
                    : "bg-surface-elevated border-border text-white/60 hover:text-white"
                }`}
              >
                Female ♀️
              </button>
              <button
                onClick={() => setTargetGenderPreference("Male")}
                className={`py-3 px-2 rounded-2xl text-xs font-black text-center transition border ${
                  targetGenderPreference === "Male"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/20"
                    : "bg-surface-elevated border-border text-muted hover:text-foreground"
                }`}
              >
                Male ♂️
              </button>
              <button
                onClick={() => setTargetGenderPreference("Anyone")}
                className={`py-3 px-2 rounded-2xl text-xs font-black text-center transition border ${
                  targetGenderPreference === "Anyone"
                    ? "bg-purple-500/20 border-purple-500 text-purple-300 shadow-md shadow-purple-500/20"
                    : "bg-surface-elevated border-border text-muted hover:text-foreground"
                }`}
              >
                Anyone 🚻
              </button>
            </div>
            {targetGenderPreference === "Female" && (
              <p className="text-[11px] text-primary font-medium italic mt-1">
                🔒 Strict Safety Rule: You will ONLY be matched with verified Female profiles.
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setShowPreChatModal(false);
              setShowWarningModal(true);
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-pink-600 to-purple-600 hover:from-rose-600 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-primary/25 active:scale-95 transition"
          >
            CONTINUE TO SAFETY WARNING →
          </button>
        </div>
      </div>
    );
  }

  // 2. WARNING & SAFETY AGREEMENT MODAL
  if (showWarningModal) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4 text-foreground font-sans overflow-y-auto">
        <div className="bg-white/[0.03] border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <ShieldAlert size={28} className="text-warning animate-pulse" />
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">Community Safety &amp; Rules</h2>
              <p className="text-xs text-muted">Strict zero-tolerance policy active</p>
            </div>
          </div>

          <div className="bg-rose-950/30 border border-primary/40 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-black text-primary uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-primary" /> Prohibited Actions &amp; Auto-Ban
            </h4>
            <p className="text-xs text-secondary leading-relaxed">
              Any abusive language, harassment, nudity, or offensive behavior will cause an <span className="text-primary font-bold">Instant Automatic Hardware Device Ban</span> without warnings!
            </p>
          </div>

          <div className="space-y-2 text-xs text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span>Anti-Screenshot &amp; Screen Record Shield active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-success shrink-0" />
              <span>Zero Location Log sharing (Complete Anonymous privacy)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-warning shrink-0" />
              <span className="font-bold text-amber-300">1 Coin Limit: Connect with up to 20 {targetGenderPreference} partners!</span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleAgreeAndEnter}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/30 active:scale-95 transition"
            >
              AGREE &amp; ENTER RANDOM CHAT 🔥
            </button>
            <button
              onClick={() => {
                setShowWarningModal(false);
                setShowPreChatModal(true);
              }}
              className="w-full py-2 text-xs text-muted hover:text-foreground font-bold"
            >
              ← Back to Preferences
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-center px-4">
        <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-rose-500 animate-spin mb-6"></div>
        <h2 className="text-xl font-black text-foreground mb-1">Searching Random Chat Pool...</h2>
        <p className="text-xs text-muted">Filtering for <span className="text-primary font-bold">{landedVibe ? landedVibe : targetGenderPreference}</span> matches nearby</p>
        <button onClick={() => setShowPreChatModal(true)} className="mt-8 px-6 py-2.5 bg-surface-elevated rounded-2xl text-foreground font-bold text-xs hover:bg-surface-elevated transition">
          Cancel Search
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <MatchPreferencesHeader />
      <RandomChatHeader 
        partner={partner} 
        onLike={() => handleLikePartner(partner)}
        onAddFriend={() => toast("Friend request sent! 🤝", "success")}
        onReport={() => { toast("User blocked and reported!", "error"); nextChat(); }}
        onProfileClick={() => isConnected && setShowProfileModal(true)}
        onOpenHistory={() => setShowHistoryModal(true)}
        onOpenSafetyInfo={() => setShowWarningModal(true)}
        isConnected={isConnected}
      />

      {/* Connection Counter Banner */}
      <div className="bg-surface-elevated border-b border-border px-4 py-1.5 flex items-center justify-between text-[11px]">
        <span className="text-muted font-medium">
          Filter: <span className="text-primary font-bold">{landedVibe ? landedVibe : targetGenderPreference}</span>
        </span>
        <span className="text-amber-300 font-bold">Connections Left: {connectionsLeft}/20 🪙</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="text-center my-2">
          <span className="bg-surface-elevated border border-border text-muted text-xs px-3 py-1 rounded-full">
            Anonymous Chat Connected • Zero Logs Active 🛡️
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === "me";
          const isAudio = msg.text.startsWith("[AUDIO]");
          const isImage = msg.text.startsWith("[IMAGE]");
          const isDisappearing = msg.text.startsWith("[DISAPPEARING_IMAGE]");
          const isSticker = msg.text.startsWith("STICKER_");
          const isPoll = msg.text.startsWith("[POLL]");

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl shadow-sm overflow-hidden ${
                isMe 
                  ? 'bg-gradient-to-br from-primary to-pink-600 text-white rounded-br-sm' 
                  : 'bg-surface-elevated text-white rounded-bl-sm border border-border'
              } ${isImage || isDisappearing ? 'p-1' : 'px-4 py-2.5'}`}>
                
                {isSticker && (
                  <div className="text-3xl animate-bounce py-1">
                    {msg.text.replace("STICKER_", "")}
                  </div>
                )}

                {isDisappearing && (
                  <div className="w-full max-w-[200px] aspect-[3/4] relative">
                    {viewedDisappearingMsgs[msg.id] ? (
                       <img src={msg.text.replace("[DISAPPEARING_IMAGE]", "")} alt="Disappearing" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                       <div 
                         onClick={() => revealDisappearingMessage(msg.id)}
                         className="w-full h-full bg-black/70 flex flex-col items-center justify-center cursor-pointer rounded-xl p-3 text-center"
                       >
                         <Lock size={28} className="text-primary mb-2 animate-pulse" />
                         <span className="text-xs font-black text-foreground uppercase">Tap to View Snap</span>
                         <span className="text-[10px] text-muted mt-1">Self-destructs in 10s 👻</span>
                       </div>
                    )}
                  </div>
                )}

                {isPoll && msg.pollData && (
                  <div className="space-y-2 p-1 min-w-[200px]">
                    <div className="flex items-center gap-1.5 text-xs font-black text-primary">
                      <BarChart2 size={16} /> Quick Icebreaker Poll
                    </div>
                    <p className="text-xs font-bold text-foreground">{msg.pollData.question}</p>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handlePollVote(msg.id, "yes")}
                        className={`py-1.5 rounded-xl text-xs font-black border transition ${
                          msg.pollData.myVote === "yes" ? "bg-success text-foreground border-emerald-400" : "bg-surface-elevated border-white/20 text-secondary"
                        }`}
                      >
                        YES ({msg.pollData.yesVotes})
                      </button>
                      <button
                        onClick={() => handlePollVote(msg.id, "no")}
                        className={`py-1.5 rounded-xl text-xs font-black border transition ${
                          msg.pollData.myVote === "no" ? "bg-primary text-white border-primary" : "bg-surface-elevated border-white/20 text-white/80"
                        }`}
                      >
                        NO ({msg.pollData.noVotes})
                      </button>
                    </div>
                  </div>
                )}

                {isAudio && (
                  <div className="flex items-center gap-3 min-w-[150px]">
                     <div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center shrink-0">
                       <Mic size={14} className="text-foreground" />
                     </div>
                     <audio src={msg.text.replace("[AUDIO]", "")} controls className="h-8 max-w-[150px] opacity-90 invert grayscale hue-rotate-180" />
                  </div>
                )}

                {!isImage && !isDisappearing && !isAudio && !isSticker && !isPoll && (
                  <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
                )}
                
                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-rose-200' : 'text-muted'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* MINI ICEBREAKER PROMPTS HORIZONTAL CHIP BAR */}
      {isConnected && (
        <div className="bg-background/95 border-t border-border px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-black uppercase text-amber-300 bg-warning/10 border border-amber-500/20 px-2 py-1 rounded-xl flex items-center gap-1 shrink-0">
            <Lightbulb size={12} /> Icebreakers
          </span>
          {ICEBREAKER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendIcebreakerPrompt(prompt)}
              className="text-xs font-bold text-secondary hover:text-foreground bg-surface-elevated hover:bg-surface-elevated border border-border rounded-2xl px-3 py-1 whitespace-nowrap transition shrink-0 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Sticker Tray */}
      <AnimatePresence>
        {showStickerTray && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 bg-black/90 border-t border-border flex items-center justify-around text-2xl z-20"
          >
            {["💖", "🔥", "😂", "🤯", "🌹", "💋", "✨", "👀"].map(emoji => (
              <button key={emoji} onClick={() => sendStickerReaction(emoji)} className="hover:scale-125 transition transform">
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Controls */}
      <div className="p-3 bg-background border-t border-border pb-safe">
        {!isConnected ? (
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={nextChat}
              className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-pink-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-primary/25 active:scale-95 transition"
            >
              <RefreshCw size={18} /> Skip Person ({connectionsLeft} left)
            </button>
            <button 
              onClick={() => setShowSpinWheelModal(true)}
              className="flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-foreground rounded-2xl font-black text-xs shadow-lg shadow-purple-600/25 active:scale-95 transition"
            >
              <Dices size={18} /> Spin-to-Connect 🎰
            </button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <button 
              onClick={nextChat}
              title="Skip to Next Person"
              className="p-3 bg-surface-elevated text-foreground rounded-2xl hover:bg-surface-elevated transition-colors shrink-0"
            >
              <SkipForward size={18} />
            </button>

            <button 
              onClick={() => setShowSpinWheelModal(true)}
              title="Spin-to-Connect Gamified Wheel"
              className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-foreground rounded-2xl hover:opacity-90 transition-colors shrink-0 shadow-md shadow-purple-600/20"
            >
              <Dices size={18} />
            </button>

            <form onSubmit={handleSendMessage} className="flex-1 flex items-end gap-1 bg-surface-elevated border border-border rounded-3xl p-1.5 focus-within:border-primary transition-colors relative">
              <AnimatePresence>
                {showAttachmentMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full left-0 mb-3 bg-background border border-border rounded-2xl shadow-2xl p-2 flex flex-col gap-1 w-52 z-30"
                  >
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-elevated rounded-xl text-foreground text-xs font-bold"
                    >
                      <ImageIcon size={16} className="text-blue-400" /> Send Photo
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => disappearingFileInputRef.current?.click()}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-elevated rounded-xl text-foreground text-xs font-bold"
                    >
                      <EyeOff size={16} className="text-purple-400" /> 10s Disappearing Snap 👻
                    </button>

                    <button 
                      type="button"
                      onClick={() => createQuickPoll("Do you like music & late-night chats? 🎵")}
                      className="flex items-center gap-3 p-2.5 hover:bg-surface-elevated rounded-xl text-foreground text-xs font-bold"
                    >
                      <BarChart2 size={16} className="text-success" /> Create Quick Poll 📊
                    </button>

                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, false)} />
                    <input type="file" ref={disappearingFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {isRecording ? (
                <div className="flex-1 flex items-center justify-between pl-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-xs text-primary font-bold">Recording Voice Note...</span>
                  </div>
                  <button type="button" onClick={stopRecording} className="p-2 bg-primary text-white rounded-full mr-1">
                    <StopCircle size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="p-2.5 text-muted hover:text-foreground transition"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  >
                    <Plus size={18} />
                  </button>

                  <button 
                    type="button" 
                    className="p-2.5 text-warning hover:text-amber-300 transition"
                    onClick={() => setShowStickerTray(!showStickerTray)}
                  >
                    <Smile size={18} />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none text-foreground outline-none py-2 text-xs placeholder:text-muted"
                  />

                  {inputText.trim() ? (
                    <button 
                      type="submit" 
                      className="p-2.5 rounded-full bg-gradient-to-r from-primary to-pink-600 text-white shadow-md"
                    >
                      <Send size={16} />
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={startRecording}
                      className="p-2.5 text-muted hover:text-foreground transition"
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

      {/* 3. MATCHING HISTORY VAULT MODAL */}
      <AnimatePresence>
        {showHistoryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-4 max-h-[80vh] flex flex-col">
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-foreground"
              >
                <XIcon size={16} />
              </button>

              <div className="flex items-center gap-3 border-b border-border pb-3">
                <History size={24} className="text-purple-400" />
                <div>
                  <h3 className="text-lg font-black text-foreground">Matching History Vault</h3>
                  <p className="text-xs text-muted">Tap any past partner to view their real profile &amp; Like them</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {matchingHistory.length === 0 ? (
                  <div className="text-center py-10 text-muted text-xs">
                    No past partners matched in this session yet. Start chatting to build your vault!
                  </div>
                ) : (
                  matchingHistory.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      onClick={() => setSelectedHistoryPartner(item)}
                      className="bg-white/[0.03] border border-border hover:border-purple-500/40 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden border border-white/20 shrink-0">
                          <img src={item.photos[0]} alt={item.originalName} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-foreground flex items-center gap-1.5">
                            {item.isLiked ? item.originalName : item.hiddenName}
                            {item.isLiked && <span className="text-[10px] text-primary">❤️ Liked</span>}
                          </h4>
                          <p className="text-[10px] text-muted flex items-center gap-1">
                            <span>{item.gender} • {item.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-muted flex items-center gap-1">
                          <Clock size={10} /> {item.matchedTime}
                        </span>
                        <span className="text-[10px] text-purple-300 font-bold block mt-0.5">View Profile →</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SELECTED HISTORY PARTNER PROFILE MODAL (ONLY LIKE AVAILABLE, NO ADD FRIEND) */}
      <AnimatePresence>
        {selectedHistoryPartner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative p-5 space-y-4">
              <button 
                onClick={() => setSelectedHistoryPartner(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-foreground"
              >
                <XIcon size={16} />
              </button>
              
              <div className="text-center">
                <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 mb-1 inline-block">
                  📜 Vault History Card
                </span>
                <h3 className="text-lg font-black text-foreground">
                  {selectedHistoryPartner.isLiked ? selectedHistoryPartner.originalName : selectedHistoryPartner.hiddenName}
                </h3>
                <p className="text-xs text-muted">
                  {selectedHistoryPartner.isLiked ? "Profile Unlocked ✅" : "Like to unlock full profile name & photos"}
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar">
                {selectedHistoryPartner.photos.map((photo, i) => (
                  <div key={i} className="shrink-0 w-48 aspect-[3/4] rounded-2xl overflow-hidden snap-center relative">
                    <img 
                      src={photo} 
                      alt={`Photo ${i+1}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${!selectedHistoryPartner.isLiked ? 'blur-xl scale-110 brightness-50' : 'blur-0'}`} 
                    />
                    {!selectedHistoryPartner.isLiked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                         <Lock size={32} className="text-foreground/50 mb-2" />
                         <span className="text-foreground/80 font-bold text-xs uppercase tracking-wider">Locked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Strict Requirement: ONLY LIKE BUTTON AVAILABLE, NO ADD FRIEND */}
              <div className="space-y-2 pt-1">
                {!selectedHistoryPartner.isLiked ? (
                  <button 
                    onClick={() => handleLikePartner(selectedHistoryPartner)}
                    className="w-full py-3 bg-gradient-to-r from-primary to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
                  >
                    <Heart size={16} /> Unlock Profile with 1 Coin 🪙
                  </button>
                ) : (
                  <div className="w-full py-3 bg-success/20 border border-emerald-500/40 text-emerald-300 text-center font-black text-xs rounded-2xl">
                    ❤️ Liked &amp; Unlocked Profile
                  </div>
                )}
                <p className="text-[10px] text-muted text-center font-medium">
                  🔒 Note: Add Friend is disabled in Vault History mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spin Wheel Modal */}
      <AnimatePresence>
        {showSpinWheelModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl relative space-y-5">
              <button 
                onClick={() => setShowSpinWheelModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-foreground"
              >
                <XIcon size={16} />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  🎰 Gamified Partner Roulette
                </span>
                <h3 className="text-lg font-black text-foreground tracking-tight">Spin-to-Connect Wheel</h3>
                <p className="text-xs text-muted">Spin the wheel to decide the vibe of your next partner!</p>
              </div>

              <div className="w-44 h-44 rounded-full border-4 border-purple-500/40 mx-auto flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-purple-950/40 via-black to-pink-950/40 shadow-[0_0_30px_rgba(147,51,234,0.3)]">
                <div className={`text-center p-3 ${isSpinningWheel ? "animate-spin" : ""}`}>
                  <Dices size={40} className="text-purple-400 mx-auto mb-2" />
                  <span className="text-xs font-black text-foreground block">
                    {landedVibe ? landedVibe : isSpinningWheel ? "Spinning Wheel..." : "Ready to Spin!"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSpinToConnect}
                disabled={isSpinningWheel}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-500 hover:to-primary text-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 active:scale-95 transition"
              >
                {isSpinningWheel ? "🎰 Spinning Vibe Wheel..." : "SPIN WHEEL & MATCH 🔥"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="bg-background border border-border w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative p-5 space-y-4">
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-foreground"
              >
                <XIcon size={16} />
              </button>
              
              <div className="text-center">
                <h3 className="text-lg font-black text-foreground">
                  {partner.isLiked ? partner.originalName : partner.hiddenName}
                </h3>
                <p className="text-xs text-muted">
                  {partner.isLiked ? "Profile Unlocked ✅" : "Like to unlock full profile name & photos"}
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto snap-x no-scrollbar">
                {partner.photos.map((photo, i) => (
                  <div key={i} className="shrink-0 w-48 aspect-[3/4] rounded-2xl overflow-hidden snap-center relative">
                    <img 
                      src={photo} 
                      alt={`Photo ${i+1}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${!partner.isLiked ? 'blur-xl scale-110 brightness-50' : 'blur-0'}`} 
                    />
                    {!partner.isLiked && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                         <Lock size={32} className="text-foreground/50 mb-2" />
                         <span className="text-foreground/80 font-bold text-xs uppercase tracking-wider">Locked</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!partner.isLiked && (
                <button 
                  onClick={() => handleLikePartner(partner)}
                  className="w-full py-3 bg-gradient-to-r from-primary to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-primary/25"
                >
                  Unlock Profile with 1 Coin 🪙
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
