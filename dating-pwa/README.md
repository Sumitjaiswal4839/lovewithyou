# 💖 Dating PWA — Secure, Free, & Device-Authenticated Dating Platform

A revolutionary Progressive Web Application (PWA) designed specifically to address affordability and student safety in modern dating apps. Built with **Next.js**, **TailwindCSS**, and **Zustand**, featuring localized AI verification and real-time interactive features without requiring expensive subscriptions.

---

## 🌟 Why This App? (Core Philosophy)

1. **💸 Zero Cash Subscriptions (Coin Economy):**
   - No prohibitive paywalls or premium membership tiers for student users.
   - Users earn free **Coins** through daily login streaks, tasks, profile completion, and respectful karma behavior.
   - Coins can be spent to unlock anonymous likers, unblur full profiles, and boost visibility.

2. **🔐 Device Fingerprint Authentication:**
   - No traditional email/password or intrusive social login sign-ups required.
   - Authenticates seamlessly via unique hardware/software device identification (`deviceId`).
   - Maintains user state across app reinstalls while keeping interactions frictionless.

3. **🛡️ Girls' Safety & Anti-Fake Verification:**
   - **Local AI Face Verification:** Incorporates client-side face scanning using models hosted directly in `public/models` (running locally without third-party API costs or privacy leaks).
   - **6-Photo Mandatory Rule:** Users must provide at least 6 verified photos during profile setup to prevent catfish identities.

---

## ✨ Features & Capabilities

### 🎲 Live Random Chat (`/random-chat`)
- **Anonymous Discovery:** Meet strangers with hidden identities (e.g., `"S***t"`) and blurred initial profile preview cards.
- **Interactive Action Bar:**
  - **❤️ Like to Unlock:** Spend 1 Coin to instantly unblur their photos and reveal their actual identity!
  - **➕ Add Friend:** Send real-time friend requests right inside the chat room.
  - **📍 Location & Gender Display:** See verified general locations (e.g., Delhi, DL) and gender without compromising privacy.
  - **🚫 Instant Report & Block:** Immediately sever connection and block abusive users.
- **Skip & Connect:** Disconnected or unwanted chat? Simply tap **"Skip to Next Person"** for instant re-routing.
- **Online Duration Timer:** Tracks active conversation time dynamically (`Online (0m)`).

### 🤝 Friend System & Chat Locking (`/chat`)
- **Dedicated Friends Tab:** Organize interactions into *My Matches*, *Who Liked Me*, and *Friends*.
- **Request Management:** View incoming friend requests with instant Accept (✅) or Decline (❌) actions, and check outgoing requests marked as *Pending Approval*.
- **Chat Locking Security:** Trying to chat with someone before they accept your request? The chat box stays automatically locked 🔒 until mutual approval is granted!

### 🎤 Voice Notes, Media & Disappearing Snaps
- **Attachments Popover:** An intuitive `+` menu right next to the message box.
- **Snapchat-Style Disappearing Messages 👻:** Send private photos that appear as a locked `"Tap to View"` box. Once opened by the recipient, a strict **5-second timer** counts down before the photo is permanently deleted from the UI and state!
- **Hold-to-Record Voice Notes 🎙️:** Tap the mic icon to record real-time audio through browser audio capture (`MediaRecorder`), complete with live red pulsing animations and embedded waveform playback.

### 🧭 Navigation & User Experience
- **Sidebar Drawer Menu:** Access everything quickly, including **Feedback & Bug Reporting** modals and a comprehensive **FAQ** page directly without digging through complicated settings.
- **PWA Ready:** Smooth offline fallback, mobile touchscreen-optimized gestures, and App Store-grade transitions using **Framer Motion**.

---

## 🛠️ Technology Stack

| Component | Technology / Library | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router, React 19) | Server and client rendering, route-based architecture |
| **Styling & Animation** | TailwindCSS & Framer Motion | Glassmorphic aesthetics, fluid micro-interactions |
| **State Management** | Zustand (`useUserStore`) | Lightweight reactive global state simulation |
| **Icons & UI Extras** | Lucide React | Clean, modern visual hierarchy and indicators |
| **Audio Capture** | HTML5 Web Audio (`MediaRecorder`)| Native browser voice note generation |
| **AI Models** | Client-Side Face Scanner | Hosted locally inside `/public/models` for ultra-fast checks |

---

## 🚀 Getting Started (Development Setup)

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```

3. **Open in your browser or mobile emulator:**
   Navigate to [http://localhost:3000](http://localhost:3000). To test device gestures and PWA responsiveness, open browser DevTools and switch to mobile touchscreen viewport.

---

## 📁 Key File Structure Highlights

- `app/random-chat/page.tsx` — Full implementation of live random matchmaking, audio recorder, and disappearing photos.
- `app/chat/page.tsx` — Comprehensive message hub featuring Match list, Who Liked Me paywalls, and Friend Request management.
- `app/chat/[id]/page.tsx` — Real-time private chat room with locking controls for unapproved contacts.
- `app/setup/page.tsx` — Onboarding workflow enforcing AI Face Verification and the 6-photo safety rule.
- `store/useUserStore.ts` — Zustand store tracking coins, karma, friendships, device IDs, and user profile metadata.
- `public/models/` — Local AI neural network model weights for offline-safe photo validation.

---
*Built with love to create a safer, fairer dating ecosystem for everyone.* 💖
