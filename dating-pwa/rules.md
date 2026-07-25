# 📜 Community Rules, AI Enforcement, Security & Privacy Policy (`rules.md`)

Our overarching vision is to build an inclusive, affordable, and deeply shielded social environment for students. Because **Dating PWA** operates on a free-to-use Coin Economy instead of paid subscriptions, guaranteeing absolute trust, robust security, and strict **Women’s Safety** is our primary architectural focus.

---

## Part 1: 🛡️ Women's Safety & Anti-Catfish Protocols

### 1.1. Absolute Zero-Tolerance for Fake Identities (Mandatory 6-Photo Rule)
- Every candidate must submit a **minimum of 6 distinct facial and lifestyle photos** during account initialization (`/setup`). 
- Profiles with fewer than 6 photos are strictly prevented from accessing matchmaking discovery stacks or entering live Random Chat pools.
- Requiring a diverse 6-photo array severely degrades the capability of automated spam bots and illegitimate catfish operations.

### 1.2. Zero-Leak Biometric AI Face Scanner & Privacy
- **100% Offline Browser Inference:** Unlike standard apps that transmit personal live camera feeds across cloud networks, our platform runs neural network evaluations entirely within local device RAM using weights hosted directly in `/public/models/` (`ssd_mobilenetv1.bin`, `face_landmark_68.json`).
- **Zero Raw Media Transit:** Your camera stream never leaves your personal phone or computer. Once facial liveness and structural geometry alignment against your submitted photos are locally affirmed, only an encrypted boolean validation token (`verified: true`) is bound to the database profile.

---

## Part 2: 🤖 Automated Moderation & Media Security

### 2.1. Client-Side NSFWJS Image Sanitization
- Every visual attachment shared across private message rooms (`/chat/[id]`) and live Random Chat lines (`/random-chat`), including Disappearing Snaps, undergoes strict local evaluation via integrated `nsfwjs` algorithms before rendering to the receiving user.
- **Enforcement Action:** Any transfer flagged for nudity, hate insignias, or unsolicited inappropriate content is instantly terminated, and a mandatory **-20 Coin Penalty** is enforced against the sender's balance.

### 2.2. Ephemeral Media Self-Destruct Mechanics
- **Snapchat-Style Snaps (`[DISAPPEARING_IMAGE]`):** Engineered for total privacy. Upon viewing by the receiver, an immutable 5,000-millisecond countdown executes.
- **Memory Garbage Collection:** Once expired, all traces of the Base64 image byte arrays are permanently pruned from React application state (`useState` / `useUserStore`), unlinked from the DOM, and marked for garbage collection by JS runtime engines. Attempting screen recordings or payload extraction is prohibited and monitored.
- **Voice Notes (`[AUDIO]`):** Audio recordings remain subject to community review. Audio harassment or threats result in permanent hardware isolation.

---

## Part 3: ⚖️ Karma Token System & Device Fingerprint Auth

### 3.1. Fair Earning & No Paywall Exclusions
- Coins replace prohibitive monthly cash memberships to maintain equitable student access:
  - Daily Login Streak: `+10 Coins`
  - Completed Profile Verification: `+20 Coins`
  - High Karma Rating Maintenance: `+5 Coins daily bonus`

### 3.2. Karma Deductions & Hardware Fingerprint Bans
- Every conversation header incorporates an accessible Report button (🚫).
- When validated report actions trigger:
  1. The live session severs instantaneously ("Skip to Next Person").
  2. The violating participant incurs a **-30 Karma reduction**.
  3. Should a user's Karma score fall below **40/100**, their hardware token is transferred to an isolated restriction queue, barring interaction with female-verified accounts.
- **Permanent Device Ban Protocol:** Because authentication runs on resilient hardware cryptographic hashing (`deviceId`) without traditional emails, deleting the app, wiping browser caches, or reinstalling the PWA **will NOT bypass a safety ban**. Restricted physical devices remain permanently isolated from the network.

---
*By interacting on Dating PWA, users pledge to maintain exemplary standards of empathy, privacy protection, and respect.* 💖
