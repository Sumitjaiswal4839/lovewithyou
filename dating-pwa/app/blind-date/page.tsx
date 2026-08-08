"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useDeviceAuth } from "@/hooks/useDeviceAuth";
import { useToast } from "@/components/ui/ToastProvider";
import { useUserStore } from "@/store/useUserStore";
import { Heart, X, Play, Pause, Headphones, Clock, Flame, Unlock, Sparkles, PhoneCall, Volume2 } from "lucide-react";
import { API } from "@/lib/api";

const DUMMY_PROFILES = [
  { id: "1", name: "Stranger #842", gender: "Female", location: "New Delhi", age: 21, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "2", name: "Stranger #991", gender: "Male", location: "Mumbai", age: 24, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "3", name: "Stranger #105", gender: "Female", location: "Bengaluru", age: 20, audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
];

export default function BlindDatePage() {
  useDeviceAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const spendCoins = useUserStore((state) => state.spendCoins);
  const coins = useUserStore((state) => state.coins);
  const profile = useUserStore((state) => state.profile);
  const deviceId = useUserStore((state) => state.deviceId);
  const matchPreferences = useUserStore((state) => state.matchPreferences);

  const [activeMode, setActiveMode] = useState<"browse" | "live3min">("live3min");
  const [profiles, setProfiles] = useState(DUMMY_PROFILES);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 3-Minute Live Blind Audio States
  const [inCall, setInCall] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes = 180 seconds
  const [myYes, setMyYes] = useState(false);
  const [partnerYes, setPartnerYes] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [hapticWave, setHapticWave] = useState(false);
  const [doubleTapCount, setDoubleTapCount] = useState(0);

  // Real WebRTC Audio Streaming States
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const wsSignaling = useRef<WebSocket | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inCall && timeLeft > 0 && !unlocked) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === 120) {
            toast("Partner whispers: 'Your voice sounds amazing!' 💕", "info");
          }
          if (prev === 90 && !partnerYes) {
            setPartnerYes(true);
            toast("Partner tapped YES to unlock photos! Tap YES to confirm mutual reveal!", "success");
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [inCall, timeLeft, unlocked, partnerYes, toast]);

  // WebRTC Audio Connection Lifecycle
  useEffect(() => {
    if (!inCall || !deviceId) return;

    const partnerId = "anon_partner";
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://lovewithyou.onrender.com";
    const wsUrl = `${BACKEND_URL.replace("http", "ws")}/api/v1/p2p/webrtc-signal?device_id=${deviceId}&partner_id=${partnerId}`;

    const initWebRTC = async () => {
      try {
        wsSignaling.current = new WebSocket(wsUrl);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);

        peerConnection.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });

        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate && wsSignaling.current?.readyState === WebSocket.OPEN) {
            wsSignaling.current.send(
              JSON.stringify({ type: "ice-candidate", candidate: event.candidate })
            );
          }
        };

        wsSignaling.current.onmessage = async (message) => {
          try {
            const data = JSON.parse(message.data);
            if (!peerConnection.current) return;

            if (data.type === "offer") {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
              const answer = await peerConnection.current.createAnswer();
              await peerConnection.current.setLocalDescription(answer);
              wsSignaling.current?.send(JSON.stringify({ type: "answer", sdp: answer }));
            } else if (data.type === "answer") {
              await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
            } else if (data.type === "ice-candidate") {
              await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } catch (e) {
            console.error("WebRTC Signaling Error:", e);
          }
        };

        // Create Offer if deviceId precedence
        if (deviceId > partnerId) {
          const offer = await peerConnection.current.createOffer();
          await peerConnection.current.setLocalDescription(offer);
          wsSignaling.current.onopen = () => {
            wsSignaling.current?.send(JSON.stringify({ type: "offer", sdp: offer }));
          };
        }
      } catch (err) {
        console.warn("Audio Permission / WebRTC Error:", err);
      }
    };

    initWebRTC();

    return () => {
      peerConnection.current?.close();
      wsSignaling.current?.close();
      localStream?.getTracks().forEach((t) => t.stop());
    };
  }, [inCall, deviceId]);

  const handleStart3MinDate = async () => {
    await API.startBlindAudioMatch(deviceId || "me", "Romantic & Deep");
    setInCall(true);
    setTimeLeft(180);
    setMyYes(false);
    setPartnerYes(false);
    setUnlocked(false);
    toast("🎙️ Connected to Live 3-Minute Blind Audio Date via P2P WebRTC!", "success");
  };

  const handleTapYes = () => {
    setMyYes(true);
    if (partnerYes || myYes) {
      setUnlocked(true);
      toast("🎉 Mutual YES confirmed! Profile Photo & True Name Unlocked!", "success");
    } else {
      toast("You voted YES! Waiting for partner to tap YES...", "info");
    }
  };

  const handleDoubleTapHaptic = async () => {
    setDoubleTapCount((prev) => prev + 1);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
    await API.syncHeartbeat("blind_room", deviceId || "me");
    setHapticWave(true);
    toast("💓 Synchronous Heartbeat Haptic pulse fired to both phones!", "success");
    setTimeout(() => setHapticWave(false), 2500);
  };

  // Swipe deck logic
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > 100) handleSwipe("right");
    else if (info.offset.x < -100) handleSwipe("left");
  };

  const handleSwipe = (direction: "left" | "right") => {
    stopAudio();
    if (direction === "right") {
      if (coins < 2) {
        toast("Not enough coins to like!", "error");
        return;
      }
      spendCoins(2);
      toast("Vibe Liked! (-2 Coins)", "success");
    }
    setProfiles((prev) => prev.slice(1));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? "0" : ""}${rem}`;
  };

  return (
    <div className="min-h-screen bg-[#07050d] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Flaming Heart Wave Haptic Effect */}
      <AnimatePresence>
        {hapticWave && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center bg-rose-600/20 backdrop-blur-sm"
          >
            <div className="text-center animate-bounce flex flex-col items-center">
              <Flame size={120} className="text-rose-500 fill-current drop-shadow-[0_0_50px_rgba(244,63,94,1)]" />
              <p className="text-xl font-black text-rose-300 uppercase tracking-widest mt-4">💓 Heartbeats Synced!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden WebRTC Remote Audio Stream */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Top Header */}
      <div className="p-4 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 sticky top-0">
        <div className="flex items-center gap-2">
          <Headphones className="text-pink-500" size={24} />
          <div>
            <h1 className="text-sm font-extrabold text-white">&quot;Blind Audio&quot; Dates 🎙️</h1>
            <p className="text-[10px] text-pink-300">Voice-Only • Haptic Heartbeats • No Photo until Mutual YES</p>
          </div>
        </div>
        <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-xs">
          <button
            onClick={() => { setActiveMode("live3min"); setInCall(false); }}
            className={`px-3 py-1 rounded-lg font-black transition ${activeMode === "live3min" ? "bg-pink-600 text-white shadow-md" : "text-gray-400"}`}
          >
            3-Min Live ⏳
          </button>
          <button
            onClick={() => { setActiveMode("browse"); stopAudio(); }}
            className={`px-3 py-1 rounded-lg font-black transition ${activeMode === "browse" ? "bg-purple-600 text-white shadow-md" : "text-gray-400"}`}
          >
            Deck Swiper
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-md mx-auto w-full z-10">
        {activeMode === "live3min" ? (
          !inCall ? (
            <div className="text-center space-y-6 w-full py-6">
              <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-rose-500/20 blur-xl opacity-50 animate-pulse"></div>
                <div className="w-32 h-32 rounded-full bg-black/90 border-2 border-rose-500/50 flex items-center justify-center shadow-2xl relative z-10">
                  <PhoneCall size={48} className="text-rose-400 animate-bounce" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">3-Minute Heart-to-Heart</h2>
                <p className="text-xs text-gray-300 mt-2 max-w-xs mx-auto leading-relaxed">
                  Only Voice! Koi photo nahi, koi name nahi. Complete 3 minutes of deep voice conversation. Agar dono time dhalne par <span className="text-emerald-400 font-bold">&quot;YES&quot;</span> karte hain tabhi Profile photo &amp; name unlock hogee!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left space-y-2">
                <p className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame size={16} className="text-rose-500" /> Haptic Heartbeat Synced
                </p>
                <p className="text-[11px] text-gray-400">
                  Double-tap center during your date to simultaneously vibrate both phones and flood screens with flaming heart waves!
                </p>
              </div>

              <button
                onClick={handleStart3MinDate}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 font-extrabold text-base text-white shadow-[0_0_25px_rgba(244,63,94,0.4)] active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Sparkles size={20} /> Match &amp; Connect Voice Now 🎙️
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-between space-y-6 py-4">
              {/* Timer Bar */}
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg">
                <span className="text-xs text-rose-300 font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span> Audio Date Active
                </span>
                <span className="text-2xl font-black text-emerald-400 font-mono tracking-wider flex items-center gap-1.5">
                  <Clock size={20} /> {formatTime(timeLeft)}
                </span>
              </div>

              {/* Profile Avatar / Unlock Showcase */}
              <div
                onDoubleClick={handleDoubleTapHaptic}
                className="relative w-64 h-64 rounded-3xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center cursor-pointer group select-none"
              >
                {!unlocked ? (
                  <>
                    <div className="w-28 h-28 rounded-full bg-white/5 border border-white/20 flex items-center justify-center filter blur-[2px] animate-pulse">
                      <Volume2 size={48} className="text-pink-400 animate-bounce" />
                    </div>
                    <p className="mt-4 font-black text-white text-lg">Anonymous Date 🤫</p>
                    <p className="text-[10px] text-pink-300 font-medium mt-1">Double-tap to fire Heartbeat Haptics 💕</p>
                    <div className="flex items-center gap-1 mt-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="w-1.5 bg-pink-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 24 + 8}px`, animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-28 h-28 rounded-full border-2 border-emerald-400 bg-indigo-600 flex items-center justify-center shadow-lg text-4xl font-extrabold">
                      👩‍🦰
                    </div>
                    <span className="mt-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] px-3 py-0.5 rounded-full font-bold">
                      ✨ Unlocked Profile!
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">Aanya Sharma, 21</h3>
                    <p className="text-xs text-gray-300">Delhi University Hub</p>
                  </motion.div>
                )}
              </div>

              {/* Haptic Double Tap Hint & YES Vote Controls */}
              <div className="w-full space-y-3">
                <button
                  onClick={handleDoubleTapHaptic}
                  className="w-full py-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 hover:bg-rose-900/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                >
                  <Flame size={16} className="text-rose-500 animate-bounce" /> Trigger Heartbeat Sync Vibrate 💓 ({doubleTapCount})
                </button>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={() => { setInCall(false); toast("Audio date ended.", "info"); }}
                    className="py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-red-400 font-extrabold text-xs border border-white/10"
                  >
                    End Date ❌
                  </button>
                  <button
                    onClick={handleTapYes}
                    disabled={myYes}
                    className={`py-3.5 rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center gap-1.5 ${
                      myYes ? "bg-emerald-600 text-white opacity-90 cursor-default" : "bg-gradient-to-r from-pink-500 to-rose-500 hover:brightness-110 text-white"
                    }`}
                  >
                    <Unlock size={16} /> {myYes ? "YES Confirmed ✅" : "Tap YES to Unlock 💖"}
                  </button>
                </div>
              </div>
            </div>
          )
        ) : (
          /* Deck Swiper legacy view */
          <div className="w-full flex flex-col items-center justify-center relative py-8">
            {profiles.length > 0 ? (
              <motion.div
                key={profiles[0].id}
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                className="w-full h-96 rounded-3xl border-2 border-purple-500/30 bg-gradient-to-b from-gray-900 to-black p-6 flex flex-col items-center justify-center shadow-2xl cursor-grab"
              >
                <div className="w-24 h-24 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center mb-6">
                  <Volume2 size={40} className="text-purple-300 animate-pulse" />
                </div>
                <h3 className="text-2xl font-extrabold text-white">{profiles[0].name}</h3>
                <p className="text-sm text-purple-300 mt-1">Age: {profiles[0].age} • {profiles[0].location}</p>
                <div className="flex items-center gap-6 mt-8">
                  <button onClick={() => handleSwipe("left")} className="w-14 h-14 rounded-full bg-white text-red-500 flex items-center justify-center shadow-lg font-black text-xl">X</button>
                  <button onClick={() => handleSwipe("right")} className="w-14 h-14 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-lg font-black text-xl">♥</button>
                </div>
              </motion.div>
            ) : (
              <p className="text-sm text-gray-400">No more voice cards! Return to 3-Min Live Mode above.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
