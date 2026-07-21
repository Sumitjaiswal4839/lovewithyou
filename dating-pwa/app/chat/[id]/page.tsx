"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { ArrowLeft, Send, Sparkles, Image as ImageIcon, Mic, Sticker, Smile, Clock, Video, ShieldAlert, Ban, Lock, Gamepad2, X as CloseX, Circle, Gift, MoreVertical, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";
import { KarmaBadge } from "@/components/ui/KarmaBadge";
import { AIIcebreaker } from "@/components/ui/AIIcebreaker";

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'them';
  type: 'text' | 'photo' | 'audio' | 'gif' | 'gift' | 'photo-ephemeral';
  mediaUrl?: string;
  status?: 'sent' | 'delivered' | 'read';
  reaction?: string;
};

export default function ChatScreen({ params }: { params: { id: string } }) {
  const router = useRouter();
  const match = useUserStore((state) => state.matches.find(m => m.id === params.id));
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [toxicityWarning, setToxicityWarning] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isEphemeralMode, setIsEphemeralMode] = useState(false);
  const { toast } = useToast();
  const spendCoins = useUserStore((state) => state.spendCoins);
  
  // Tic-Tac-Toe state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  // 24 Hour Expiry Calculation
  const hoursLeft = match?.matchTimestamp 
    ? Math.max(0, 24 - Math.floor((Date.now() - match.matchTimestamp) / (1000 * 60 * 60))) 
    : 24;
  const isExpired = hoursLeft <= 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (!match) {
    return <div className="p-8 text-center text-white">Match not found.</div>;
  }

  const handleSendText = () => {
    if (!inputText.trim()) return;
    
    // AI Toxicity Filter Mock
    const lowerText = inputText.toLowerCase();
    if (lowerText.includes("stupid") || lowerText.includes("ugly")) {
      setToxicityWarning("Your message violates our community guidelines. Please be respectful.");
      setTimeout(() => setToxicityWarning(null), 4000);
      return;
    }

    sendMessage({ id: Date.now(), text: inputText, sender: "me", type: "text", status: "sent" });
    setInputText("");
  };

  const handleSendMedia = (type: 'photo' | 'audio' | 'gif', url: string, text: string = "") => {
    if (toxicityWarning) return;
    const finalType = (type === 'photo' && isEphemeralMode) ? 'photo-ephemeral' : type;
    sendMessage({ id: Date.now(), text, sender: "me", type: finalType as any, mediaUrl: url, status: "sent" });
    setShowAttachments(false);
    setIsEphemeralMode(false); // reset
  };

  const handleSendGift = () => {
    const coins = useUserStore.getState().coins;
    if (coins < 10) {
      toast("Not enough coins to send a gift!", "error");
      return;
    }
    spendCoins(10);
    sendMessage({ id: Date.now(), text: "Sent a Rose 🌹", sender: "me", type: "gift", status: "sent" });
    toast("Gift Sent! (-10 Coins)", "success");
  };

  const sendMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
    
    // Simulate read receipt update
    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m));
    }, 1500);

    // Simulate typing indicator & reply
    setTimeout(() => setIsTyping(true), 2000);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: Date.now(), text: "Omg totally! 💯", sender: "them", type: "text" }]);
    }, 4500);
  };

  const addReaction = (msgId: number, reaction: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, reaction } : m));
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg">
      
      {/* Header */}
      <div className="flex items-center gap-3 p-4 pt-8 glass border-b border-glass-border">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        
        <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
          <img src={match.img} alt={match.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-lg leading-tight flex items-center gap-2">
            {match.name}
            {match.zodiacSign && <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">{match.zodiacSign}</span>}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5">
            {match.campus && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">🎓 {match.campus}</span>}
            <KarmaBadge score={match.karma} showText={false} className="scale-75 origin-left" />
          </div>
        </div>
        
        {/* 24-Hour Timer & Video Call */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${hoursLeft < 6 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}`}>
            <Clock size={12} /> {hoursLeft}h
          </div>
          <button onClick={handleSendGift} className="p-2 bg-white/10 rounded-full hover:bg-pink-500/20 hover:text-pink-400 transition-colors text-white" title="Send Gift (-10 Coins)">
            <Gift size={16} />
          </button>
          <button onClick={() => setShowVideoModal(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
            <Video size={16} />
          </button>
          <button onClick={() => setShowReportModal(true)} className="p-1.5 text-gray-400 hover:text-white transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
           <AIIcebreaker 
             matchName={match.name} 
             matchHobbies={match.hobbies} 
             onGenerate={(opener) => setInputText(opener)} 
           />
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`relative group max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'me' ? 'bg-primary-500 text-white rounded-br-sm' : 'bg-white/10 text-gray-200 rounded-bl-sm'}`}
                onDoubleClick={() => msg.sender === 'them' && addReaction(msg.id, '❤️')}
              >
                {/* Media Content */}
                {msg.type === 'photo' || msg.type === 'gif' ? (
                  <img src={msg.mediaUrl} alt="media" className="rounded-xl mb-2 max-w-full h-40 object-cover" />
                ) : msg.type === 'photo-ephemeral' ? (
                  <div 
                    className="w-40 h-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer mb-2 group"
                    onClick={(e) => {
                       const el = e.currentTarget;
                       el.innerHTML = `<img src="${msg.mediaUrl}" class="w-full h-full object-cover rounded-xl" />`;
                       setTimeout(() => {
                         setMessages(prev => prev.filter(m => m.id !== msg.id));
                         toast("Photo expired", "info");
                       }, 3000);
                    }}
                  >
                    <EyeOff size={24} className="mb-2 text-primary-500 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-white/80">Tap to View (3s)</span>
                  </div>
                ) : msg.type === 'gift' ? (
                  <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-tr from-pink-500/20 to-rose-500/20 rounded-xl mb-2 border border-pink-500/30">
                    <span className="text-4xl animate-bounce">🌹</span>
                  </div>
                ) : msg.type === 'audio' ? (
                  <div className="flex items-center gap-2 w-48 h-8 bg-black/20 rounded-full px-3 mb-1">
                    <Mic size={14} />
                    <div className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-white rounded-full"></div>
                    </div>
                  </div>
                ) : null}
                
                {/* Text Content */}
                {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}

                {/* Reactions */}
                {msg.reaction && (
                  <div className="absolute -bottom-3 -right-2 bg-dark-bg border border-glass-border rounded-full p-1 text-xs shadow-lg">
                    {msg.reaction}
                  </div>
                )}
              </div>
              
              {/* Status Receipts */}
              {msg.sender === 'me' && (
                <div className="mt-1 mr-1 text-[10px] text-gray-400">
                  {msg.status === 'sent' && 'Sent'}
                  {msg.status === 'read' && <span className="text-blue-400 font-bold">Read ✓✓</span>}
                </div>
              )}
            </div>
          ))
        )}
        
        {/* Typing Indicator */}
        {isTyping && (
           <div className="flex items-start">
             <div className="bg-white/10 text-gray-400 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
               <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Tray Overlay */}
      {showAttachments && (
        <div className="p-4 bg-black border-t border-glass-border flex flex-col gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Attachments</span>
            <button 
              onClick={() => setIsEphemeralMode(!isEphemeralMode)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition border ${isEphemeralMode ? 'bg-primary-500/20 text-primary-400 border-primary-500/50' : 'bg-white/10 text-gray-400 border-transparent hover:text-white'}`}
            >
              <EyeOff size={12} /> View Once Mode
            </button>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => handleSendMedia('photo', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80')} 
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
            >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center"><ImageIcon size={20} /></div>
            <span className="text-[10px]">Photo</span>
          </button>
          <button 
            onClick={() => handleSendMedia('gif', 'https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center"><Sticker size={20} /></div>
            <span className="text-[10px]">GIF</span>
          </button>
          <button 
            onClick={() => handleSendMedia('audio', '#', 'Audio Message')}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-white"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center"><Mic size={20} /></div>
            <span className="text-[10px]">Voice</span>
          </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 glass border-t border-glass-border pb-safe">
        {toxicityWarning && (
          <div className="mb-2 px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-[10px] rounded-lg flex items-center gap-2">
            <ShieldAlert size={14} /> {toxicityWarning}
          </div>
        )}
        
        {isExpired ? (
          <div className="flex items-center justify-center p-3 bg-red-500/10 text-red-400 text-sm font-bold rounded-xl gap-2 border border-red-500/20">
            <Ban size={18} /> Match Expired (24h passed)
          </div>
        ) : !match.isMutual ? (
          <div className="flex items-center justify-center p-3 bg-white/5 text-gray-400 text-sm font-bold rounded-xl border border-white/10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            <span className="relative z-10 flex items-center gap-2">
              <Lock size={16} /> Waiting for mutual match...
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 relative bg-white/5 border border-white/10 rounded-full p-1 pl-3">
            <button onClick={() => setShowAttachments(!showAttachments)} className="text-gray-400 hover:text-white transition p-1">
              <Smile size={20} />
            </button>
            
            <input 
              type="text" 
              placeholder="Type a message..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-white py-2"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            />
            
            <button 
              onClick={handleSendText}
              disabled={!inputText.trim()}
              className="p-2 rounded-full bg-primary-500 text-white disabled:opacity-0 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        )}
      </div>
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert size={20} className="text-red-500"/> Safety Center</h3>
            <div className="space-y-2">
              <button onClick={() => { toast("User Blocked", "success"); router.push("/"); }} className="w-full text-left p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold flex items-center gap-3 transition">
                <Ban size={18} /> Block User
              </button>
              <button onClick={() => { toast("Report Submitted. We'll review this.", "info"); setShowReportModal(false); }} className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold flex items-center gap-3 transition">
                <ShieldAlert size={18} /> Report Profile
              </button>
            </div>
            <button onClick={() => setShowReportModal(false)} className="w-full mt-4 p-4 text-gray-400 hover:text-white font-bold text-center">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deepfake / Video Call Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>
            <h3 className="text-xl font-bold text-white">AI Deepfake Protection</h3>
            <p className="text-sm text-gray-400">
              Our AI verifies that the person on video matches their profile photos in real-time. Do you want to start a secure video call?
            </p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowVideoModal(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition font-bold">
                Cancel
              </button>
              <button onClick={() => setShowVideoModal(false)} className="flex-1 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition shadow-[0_0_15px_rgba(59,130,246,0.4)] font-bold">
                Start Call
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tic-Tac-Toe Game Modal */}
      {showGameModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-dark-bg border border-glass-border w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Gamepad2 size={24} className="text-primary-500"/> Tic-Tac-Toe</h3>
              <button onClick={() => setShowGameModal(false)} className="text-gray-400 hover:text-white"><CloseX size={24} /></button>
            </div>
            <div className="text-center mb-4 font-bold text-sm text-gray-300">
              {isXNext ? "Your Turn (X)" : `${match.name}'s Turn (O)`}
            </div>
            <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-xl">
              {board.map((cell, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    if (cell || !isXNext) return;
                    const newBoard = [...board];
                    newBoard[idx] = "X";
                    setBoard(newBoard);
                    setIsXNext(false);
                    // Mock opponent move
                    setTimeout(() => {
                      const emptyIds = newBoard.map((val, i) => val === null ? i : null).filter(v => v !== null);
                      if (emptyIds.length > 0) {
                        const aiMove = emptyIds[Math.floor(Math.random() * emptyIds.length)];
                        newBoard[aiMove as number] = "O";
                        setBoard([...newBoard]);
                        setIsXNext(true);
                      }
                    }, 1000);
                  }}
                  className="aspect-square bg-dark-bg border border-glass-border rounded-lg flex items-center justify-center text-3xl font-bold cursor-pointer hover:bg-white/5 transition"
                >
                  {cell === 'X' && <CloseX size={36} className="text-primary-500" />}
                  {cell === 'O' && <Circle size={32} className="text-blue-500" />}
                </div>
              ))}
            </div>
            <button 
              onClick={() => { setBoard(Array(9).fill(null)); setIsXNext(true); }}
              className="w-full mt-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
