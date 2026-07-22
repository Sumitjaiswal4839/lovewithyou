"use client";

import { useState, useEffect, useRef } from "react";
import { useUserStore } from "@/store/useUserStore";
import { Search, Mic, X, Send, User, ChevronDown, ChevronUp, Users, ShieldAlert } from "lucide-react";

type Message = {
  id: string;
  sender: 'me' | 'stranger' | 'system';
  text: string;
  isVoice?: boolean;
};

export default function RandomChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showTnC, setShowTnC] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const liveUserCount = useUserStore((state) => state.liveUserCount);
  const matchPreferences = useUserStore((state) => state.matchPreferences);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock finding a stranger
  const startSearch = () => {
    setIsSearching(true);
    setConnected(false);

    let lookingMsg = "Looking for someone you can vibe with...";
    if (matchPreferences) {
      const locStr = matchPreferences.locationScope === "City" && matchPreferences.selectedCity ? ` in ${matchPreferences.selectedCity}` : 
                     matchPreferences.locationScope === "State" && matchPreferences.selectedState ? ` in ${matchPreferences.selectedState}` : "";
      const genderStr = matchPreferences.gender !== "Everyone" ? ` a ${matchPreferences.gender}` : " someone";
      lookingMsg = `Looking for${genderStr}${locStr} you can vibe with...`;
    }

    setMessages([{ id: Date.now().toString(), sender: 'system', text: lookingMsg }]);
    
    setTimeout(() => {
      setIsSearching(false);
      setConnected(true);
      setMessages(prev => [
        ...prev, 
        { id: Date.now().toString(), sender: 'system', text: "You're now chatting with a random stranger. Say hi!" }
      ]);
    }, 2000);
  };

  const handleDisconnect = () => {
    setConnected(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), sender: 'system', text: "You disconnected." }
    ]);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !connected) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'me', text: inputText }]);
    setInputText("");

    // Mock stranger reply
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'stranger', text: "Haha that's interesting! tell me more." }]);
    }, 3000);
  };

  const sendVoiceNote = () => {
    if (!connected) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'me', text: "🎤 Audio Message (0:04)", isVoice: true }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-black text-white pb-16">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Random Chat
        </h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-xs font-semibold text-green-400">{liveUserCount} Live</span>
        </div>
      </div>

      {/* Terms and Conditions Banner */}
      <div className="bg-gradient-to-r from-red-900/40 to-orange-900/40 border-b border-red-500/20 px-4 py-3">
        <div className="flex items-start justify-between cursor-pointer" onClick={() => setShowTnC(!showTnC)}>
          <div className="flex gap-2">
            <ShieldAlert size={20} className="text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-100">Important Safety Guidelines</p>
              {!showTnC && <p className="text-xs text-red-300 mt-1">Be respectful. No nudity or harassment...</p>}
            </div>
          </div>
          {showTnC ? <ChevronUp size={20} className="text-red-400" /> : <ChevronDown size={20} className="text-red-400" />}
        </div>
        
        {showTnC && (
          <div className="mt-3 text-xs text-red-200/80 space-y-2 animate-in fade-in slide-in-from-top-2">
            <p>1. Do not share personal information (phone number, address) with strangers.</p>
            <p>2. Any form of harassment, hate speech, or sexually explicit content will result in an immediate ban.</p>
            <p>3. If you feel uncomfortable, press the 'Disconnect' button immediately.</p>
            <p>4. All chats are monitored by AI for toxic behavior to ensure a safe environment.</p>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : msg.sender === 'stranger' ? 'justify-start' : 'justify-center'}`}>
            {msg.sender === 'system' ? (
              <span className="text-xs font-medium text-gray-500 bg-white/5 px-4 py-1 rounded-full">
                {msg.text}
              </span>
            ) : (
              <div className="flex flex-col gap-1 max-w-[80%]">
                {msg.sender === 'stranger' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400">Stranger</span>
                    <button onClick={() => setShowProfile(true)} className="text-[10px] bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-gray-300 transition-colors">
                      View Profile
                    </button>
                  </div>
                )}
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.sender === 'me' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none' 
                    : 'bg-white/10 text-gray-100 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}
        {isSearching && (
          <div className="flex justify-center my-8">
            <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full animate-pulse">
              <Search className="w-5 h-5 text-gray-400 animate-spin-slow" />
              <span className="text-sm font-medium text-gray-300">Searching the globe...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar */}
      <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/10 flex flex-col gap-3">
        {connected ? (
          <div className="flex gap-2">
            <button 
              onClick={handleDisconnect}
              className="px-4 py-3 bg-red-500/20 text-red-400 rounded-xl font-bold border border-red-500/30 hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
              <X size={18} /> Stop
            </button>
            <div className="flex-1 flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent px-3 outline-none text-sm placeholder:text-gray-500"
              />
              <button onClick={sendVoiceNote} className="p-2 text-gray-400 hover:text-white transition-colors">
                <Mic size={20} />
              </button>
              <button onClick={sendMessage} className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={startSearch}
            disabled={isSearching}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
          >
            <Users size={24} /> {isSearching ? "Searching..." : "Start New Search"}
          </button>
        )}
      </div>

      {/* Mock Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center">
          <div className="bg-dark-bg w-full sm:w-96 border border-glass-border rounded-t-3xl sm:rounded-3xl overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-10">
            <div className="h-48 bg-gradient-to-br from-purple-900 to-black relative">
              <button onClick={() => setShowProfile(false)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white backdrop-blur-md">
                <X size={20} />
              </button>
              <div className="absolute -bottom-10 left-6 w-24 h-24 bg-gray-800 rounded-full border-4 border-dark-bg flex items-center justify-center overflow-hidden shadow-xl">
                 <User size={40} className="text-gray-500" />
              </div>
            </div>
            <div className="p-6 pt-14 space-y-4">
              <div>
                <h3 className="text-2xl font-black text-white">Stranger <span className="text-sm font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full ml-2">Verified</span></h3>
                <p className="text-gray-400">Campus: Delhi University</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-purple-300">Karma: 250</span>
                <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-pink-300">Mode: Date</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-purple-500 pl-3">
                "Here for good vibes and deep conversations. Let's see where this goes."
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
