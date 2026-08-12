"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from "lucide-react";
import { API } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface CallScreenProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  partnerImg: string;
  targetId: string;
  deviceId: string;
  roomId: string;
  callType: "audio" | "video";
  isIncoming: boolean;
  incomingOffer?: any;
  onSendSignal: (signalData: string) => void;
  incomingSignal?: string; // updated from parent when new signal arrives
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallScreen({
  isOpen,
  onClose,
  partnerName,
  partnerImg,
  targetId,
  deviceId,
  roomId,
  callType,
  isIncoming,
  incomingOffer,
  onSendSignal,
  incomingSignal
}: CallScreenProps) {
  const [callStatus, setCallStatus] = useState<"calling" | "ringing" | "connected" | "ended">(isIncoming ? "ringing" : "calling");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "audio");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebRTC
  const initWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === "video",
      });
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current && event.streams[0]) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setCallStatus("connected");
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          onSendSignal(JSON.stringify({ type: "ice", candidate: event.candidate }));
        }
      };

      return pc;
    } catch (err) {
      console.error("Failed to access media devices:", err);
      alert("Microphone/Camera access denied.");
      handleEndCall(false);
      return null;
    }
  };

  const startCall = async () => {
    const pc = await initWebRTC();
    if (!pc) return;

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      onSendSignal(JSON.stringify(offer));
    } catch (err) {
      console.error("Error creating offer:", err);
    }
  };

  const answerCall = async () => {
    const pc = await initWebRTC();
    if (!pc || !incomingOffer) return;

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(incomingOffer)));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      onSendSignal(JSON.stringify(answer));
      setCallStatus("connected");
    } catch (err) {
      console.error("Error answering call:", err);
    }
  };

  // Process incoming signals from parent
  useEffect(() => {
    if (!incomingSignal || !peerConnectionRef.current) return;
    
    try {
      const signal = JSON.parse(incomingSignal);
      const pc = peerConnectionRef.current;

      if (signal.type === "answer") {
        pc.setRemoteDescription(new RTCSessionDescription(signal));
        setCallStatus("connected");
      } else if (signal.type === "ice" && signal.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(signal.candidate)).catch(console.error);
      } else if (signal.type === "end") {
        handleEndCall(false); // Remote ended
      }
    } catch (err) {
      console.error("Failed to process signal:", err);
    }
  }, [incomingSignal]);

  // Initial trigger
  useEffect(() => {
    if (isOpen) {
      if (!isIncoming) {
        startCall();
      }
      // If incoming, we wait for user to hit "Answer"
    } else {
      cleanup();
    }
    
    return () => cleanup();
  }, [isOpen]);

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const handleEndCall = (sendSignal = true) => {
    setCallStatus("ended");
    cleanup();
    if (sendSignal) {
      onSendSignal(JSON.stringify({ type: "end" }));
    }
    setTimeout(() => onClose(), 1000);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
      >
        {/* Video Area */}
        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
          {callType === "video" ? (
            <>
              {/* Remote Video (Full Screen) */}
              <video 
                ref={remoteVideoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
                style={{ display: callStatus === "connected" ? "block" : "none" }}
              />
              
              {/* Local Video (PiP) */}
              <div className="absolute top-6 right-6 w-28 h-40 bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/10 z-10">
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <VideoOff size={24} className="text-white/50" />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Audio Only UI
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 ${callStatus === 'calling' || callStatus === 'ringing' ? 'animate-pulse' : ''}`}>
                  <img src={partnerImg} alt={partnerName} className="w-full h-full object-cover" />
                </div>
                {callStatus === 'connected' && (
                  <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
                )}
              </div>
            </div>
          )}

          {/* Status Overlay when not connected */}
          {callStatus !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-0">
              <h2 className="text-white text-3xl font-bold mb-2">{partnerName}</h2>
              <p className="text-white/70 tracking-widest uppercase text-sm">
                {callStatus === "ended" ? "Call Ended" : (isIncoming && callStatus === "ringing" ? "Incoming Call..." : "Calling...")}
              </p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="h-32 bg-gradient-to-t from-black to-transparent flex items-center justify-center gap-6 px-6 pb-8 z-10">
          {isIncoming && callStatus === "ringing" ? (
            <>
              <button 
                onClick={() => handleEndCall(true)}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={28} />
              </button>
              <button 
                onClick={answerCall}
                className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white hover:bg-green-600 transition shadow-lg shadow-green-500/30 animate-bounce"
              >
                <Phone size={28} />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              {callType === "video" && (
                <button 
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition ${isVideoOff ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}`}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
              )}

              <button 
                onClick={() => handleEndCall(true)}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition shadow-lg shadow-red-500/30"
              >
                <PhoneOff size={28} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
