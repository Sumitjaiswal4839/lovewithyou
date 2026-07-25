# 🏛️ Master System Architecture & Developer Guide — Dating PWA

This authoritative technical documentation unifies the frontend engineering, backend microservice topology, database schemas, network mapping, and developer testing guidelines for the **Dating PWA** platform. Designed for zero-cost student scaling, high performance, and unmatched female user safety.

---

## 1. System Topology & Architectural Pillars

```
+---------------------------------------------------------------------------------------------+
|                                  CLIENT LAYER (Next.js PWA)                                 |
|                                                                                             |
|  +-----------------------+     +------------------------+     +--------------------------+  |
|  |  Presentation Layer   |     |    State & Data Store  |     |   Local Edge Processing  |  |
|  |  - Tailwind CSS       | <-> |    - Zustand Store     | <-> |   - Face-API (AI Models) |  |
|  |  - Framer Motion      |     |    - LocalStorage Sync |     |   - Web MediaRecorder    |  |
|  |  - Responsive Drawer  |     |    - Device Auth ID    |     |   - Image Base64 Encoder |  |
|  +-----------------------+     +------------------------+     +--------------------------+  |
|              ^                              ^                              ^                |
+--------------|------------------------------|------------------------------|----------------+
               |                              |                              |                 
               v                              v                              v                 
+---------------------------------------------------------------------------------------------+
|                             CLOUD CONNECTION LAYER (Supabase / Go)                          |
|                                                                                             |
|  +-----------------------+     +------------------------+     +--------------------------+  |
|  |  PostgreSQL Database  |     |    Supabase Realtime   |     |   Device Auth / Go API   |  |
|  |  - Row Level Security |     |    - WebSocket Channels|     |   - Hardware Verification|  |
|  +-----------------------+     +------------------------+     +--------------------------+  |
+---------------------------------------------------------------------------------------------+
```

### 1.1. Device Fingerprint Authentication (No-Login Engine)
- Eliminates accounts, passwords, and OAuth friction.
- Evaluates hardware characteristics (Canvas fingerprint, WebGL geometry, resolution) to generate a stable cryptographic hash (`deviceId`).
- Even after home screen app removal or reinstallation, matching hardware signatures instantly reconnect the existing profile and coin balance.

### 1.2. Zero-Cost Coin & Karma Economy
- **Earning Mechanics:** Daily login streaks (+10 coins), verified profile milestones (+20 coins), and maintaining respectful chat etiquette (high Karma badge rating).
- **Spending & Paywalls:** Revealing hidden stranger names in Random Chat (-1 coin) or viewing unlimited daily profile admirers (-50 coins).

---

## 2. Frontend Engineering (Next.js 16 + Zustand)

### 2.1. UI & Aesthetics (The "WOW" Standard)
- **Strict Glassmorphic Dark Mode:** Built with curated HSL dark tokens (`bg-dark-bg`) and floating translucent depth layers (`bg-black/60`, `backdrop-blur-md`, `border-white/10`). Avoids flat default primary colors.
- **Fluid Micro-Animations:** All interactive elements, popovers, and swipe stacks incorporate physical spring kinematics via **Framer Motion** (`hover:scale-105`, `active:scale-95`).
- **Touch & PWA Optimization:** Configured for mobile touchscreen viewports with offline caching service workers (`/public/sw.js`).

### 2.2. Global Reactive State (`store/useUserStore.ts`)
```typescript
export interface FriendRequest {
  id: string;
  name: string;
  img: string;
  status: "incoming" | "outgoing";
  timestamp: number;
}

export interface Friend {
  id: string;
  name: string;
  img: string;
  addedAt: number;
}

interface UserState {
  deviceId: string | null;
  coins: number;
  karma: number;
  matches: Match[];
  friendRequests: FriendRequest[];
  friends: Friend[];
  sendFriendRequest: (userId: string, name: string, img: string) => void;
  acceptFriendRequest: (userId: string) => void;
  declineFriendRequest: (userId: string) => void;
  spendCoins: (amount: number) => boolean;
}
```

---

## 3. Backend & Database Schemas (Go + Supabase PostgreSQL)

### 3.1. Relational Tables & Row Level Security (RLS)
```sql
-- Profiles & Economy
CREATE TABLE public.users (
    device_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    hidden_name TEXT NOT NULL, -- Masked identity (e.g. "S***t")
    gender TEXT NOT NULL,
    location TEXT,
    coins INTEGER DEFAULT 10,
    karma INTEGER DEFAULT 100,
    verified BOOLEAN DEFAULT false,
    photos TEXT[] NOT NULL, -- Mandatory 6-photo array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Asymmetric Friend Requests & Verified Friendships
CREATE TABLE public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    UNIQUE(sender_id, receiver_id)
);

CREATE TABLE public.friendships (
    user_id_1 TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    user_id_2 TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id_1, user_id_2)
);

-- Ephemeral & Rich Media Messaging
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    receiver_id TEXT REFERENCES public.users(device_id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- Supports plain text, [IMAGE], [DISAPPEARING_IMAGE], and [AUDIO]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
```

### 3.2. Realtime WebSocket Subscription Pattern
```typescript
const channel = supabase
  .channel(`chat_${minId}_${maxId}`)
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'messages',
    filter: `receiver_id=eq.${deviceId}`
  }, (payload) => deliverIncomingMessage(payload.new))
  .subscribe();
```

---

## 4. Frontend vs Backend Connectivity Mapping

| Feature / Module | Current Architecture State | Details |
| :--- | :--- | :--- |
| **Global User Economy & Friends** | 🟡 Partially Connected | Managed reactively in Zustand store (`useUserStore.ts`) with API sync stubs in `lib/api.ts` ready for Go server attachment. |
| **AI Onboarding Face Verification** | 🟡 Partially Connected | Enforces mandatory 6-photo uploads; executes live browser biometric evaluation using local edge model weights in `/public/models/`. |
| **Live Random Chat & Media Engine** | 🔴 Frontend Only (Mocked) | Simulates anonymous connections, voice note buffers (`[AUDIO]...`), and 5s self-destructing snaps (`[DISAPPEARING_IMAGE]...`) in client state. |
| **Chat Locking & Friend Management** | 🔴 Frontend Only (Mocked) | Enforces chat input locking (`/chat/[id]`) and instant friend request acceptance/rejection via local Zustand slices. |
| **Production DB & Edge CDN** | 🟢 Ready for Wiring | DDL tables, Go API structs (`backend/main.go`), and Cloudinary upload placeholders are prepared for production deployment. |

---

## 5. Developer Handbook & Testing Guidelines

### 5.1. Testing Rich Media & Voice Notes Locally (`/random-chat`)
- Access `http://localhost:3000` in a microphone-enabled desktop or mobile touchscreen browser.
- When the chat text field is empty, the send button transforms into a **Mic Button 🎙️**.
- Tapping triggers `navigator.mediaDevices.getUserMedia()`, displaying a live red pulsating waveform indicator. Stopping the recording automatically generates and embeds a base64 `[AUDIO]` player payload.

### 5.2. Simulating Onboarding & Face Scanner (`/setup`)
- **Dynamic SSR Bypass:** Because `@vladmandic/face-api` uses browser canvas/TextEncoder APIs, `FaceScanner` MUST be imported with Next.js dynamic import and `ssr: false` to prevent build crashes.
- Ensure all model neural weights (`ssd_mobilenetv1.bin`, `face_landmark_68.json`) are actively served from `/public/models/`.
- Attempting profile submission without exactly **6 verified photos** will trigger an intentional interface validation block.
