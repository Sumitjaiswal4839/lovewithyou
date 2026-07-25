# ⏳ Pending Tasks & Production Migration Roadmap (`pending_task.md`)

This document exclusively catalogues all deferred architecture improvements, backend integrations, cloud storage migrations, and upcoming feature rollout phases marked for execution **later**, following initial frontend PWA MVP validation.

---

## 1. ☁️ Cloud Media Storage & CDN Migration (Critical for Production)

### [ ] Migrate to Cloudinary or Supabase Storage Buckets
- **Current Status:** User profile pictures (the mandatory 6-photo setup grid) and chat attachments (Voice Notes `[AUDIO]`, Standard Photos `[IMAGE]`, and Disappearing Snaps `[DISAPPEARING_IMAGE]`) are compressed as Base64 strings and stored in local component state or browser LocalStorage via Zustand.
- **Why Deferred:** Stored locally during MVP testing to enable instant testing without API keys, cloud credential setup, or storage usage costs.
- **Pending Implementation Action:**
  1. Initialize Supabase Storage Buckets (`/user-photos/` and `/media-attachments/`) or integrate a cloud CDN via Cloudinary SDK.
  2. Refactor `<input type="file">` handlers in `app/setup/page.tsx`, `app/random-chat/page.tsx`, and `app/chat/[id]/page.tsx` to directly stream binary blobs to cloud URL endpoints before saving the output static URL to PostgreSQL database rows.
  3. Set strict file size ceilings (max 5MB per upload) and format transcode rules (convert all audio to compressed `.webm`/`.mp3` and images to WebP).

---

## 2. 🗄️ Backend & Database Connectivity Sync

### [ ] Connect Frontend Global Store to Supabase Cloud & Go API
- **Current Status:** The primary data models for User Coins, Karma Badge status, Friend Requests (`incoming`/`outgoing`), Match lists, and Chat Rooms operate within simulated frontend state (`store/useUserStore.ts`).
- **Why Deferred:** To achieve ultra-fast UI rendering, animations, and frontend feature completion without waiting on live relational queries or remote socket setups.
- **Pending Implementation Action:**
  1. Hook existing network wrappers in `lib/api.ts` into our Go Golang API Server (`backend/main.go` / port 8080) and live Supabase Cloud credentials.
  2. Replace local Zustand mock arrays (`DUMMY_PROFILES`) with real-time relational queries executed against PostgreSQL tables (`public.users`, `public.friendships`, `public.friend_requests`, and `public.messages`).
  3. Verify Row Level Security (RLS) policies block unauthorized reads of unliked or hidden stranger identities.

---

## 3. 🚀 Phase 2 & 3 Roadmap Features (Next Development Targets)

### [ ] Phase 2: Real-Time Animated Radar Map & Nearby Discovery (`/nearby-map`)
- **Planned Goal:** Transform simple discovery lists into a live, glowing interactive GPS Radar & Nearby Map.
- **Key Specifications:**
  - Anonymized Map Pins displaying approximate distances (e.g., "Student within 2 km") without exposing accurate street-level physical addresses.
  - Interactive distance radius sliders (1 km to 25 km filter).
  - Radar sweep animations and localized haptics (`useHaptics.ts`) when a verified campus match appears nearby.

### [ ] Phase 3: Coin Store & VIP Premium Subscriptions (`/premium`)
- **Planned Goal:** Introduce a realistic dummy payment checkout interface allowing users to purchase Coin bundles or unlock VIP profile statuses.
- **Key Specifications:**
  - Build a sleek mock checkout modal simulating **Razorpay** or **Stripe** payment gateways.
  - Implement **VIP Golden Badge & Border:** When purchased, wraps the user's profile card in an animated gold shimmer border and prioritizes their visibility in discovery stacks.
  - Add optional bundle items (e.g., *100 Coins for ₹49*, *Unlimited Weekend Pass*).

---

## 4. 🔔 Push Notifications & Background Service Workers (PWA)

### [ ] Integrate Web Push Notification Services (VAPID / FCM)
- **Current Status:** Service Worker (`public/sw.js`) provides offline caching and simulated local push notifications.
- **Why Deferred:** Real push notification infrastructures require active public HTTPS domains, SSL certificates, and registered Web VAPID server keys.
- **Pending Implementation Action:**
  1. Configure Apple / Google VAPID push notification delivery keys for production deployment.
  2. Listen for background WebSocket payloads (Incoming Friend Requests, New Chats, Match notifications) inside `sw.js` and render native operating system lock-screen toasts when the dating PWA is minimized or closed.

---

## 5. 🧹 Automated Cloud Ephemeral Garbage Collection

### [ ] Deploy Backend Cron Job for Disappearing Media Cleanup (`/api/cron/cleanup`)
- **Current Status:** Disappearing Photos (`[DISAPPEARING_IMAGE]`) execute a localized 5-second countdown timer in the user's browser before destroying the Base64 state array from memory.
- **Pending Implementation Action:**
  - Ensure cloud-hosted ephemeral files (once migrated to Cloudinary/Supabase) have automated server-side expiration TTLs (Time-To-Live).
  - Deploy a daily serverless cron worker (`/api/cron/cleanup`) to prune orphan cloud storage objects and scrub expired ephemeral database rows from PostgreSQL to guarantee complete GDPR privacy protection.

---

## 📊 Summary Checkboard

| Module / System | Current Testing Solution (MVP) | Deferred Target Implementation | Priority |
| :--- | :--- | :--- | :--- |
| **Media & Photos** | Base64 strings in LocalStorage/Zustand | **Cloudinary / Supabase Storage Buckets** | 🔴 High (Before Launch) |
| **User State & Chats** | Zustand React Client State | **Go API + Supabase PostgreSQL RLS** | 🔴 High (Before Launch) |
| **Discovery UI** | Standard Swipe Card Stack | **Phase 2: Animated GPS Radar Map** | 🟡 Medium (Next Feature) |
| **Monetization** | Daily Logins & Tasks Only | **Phase 3: Razorpay Coin Store & VIP Mode**| 🟡 Medium (Next Feature) |
| **Notifications** | Local Service Worker Toasts | **Web Push Protocol / VAPID Keys** | 🟢 Low (Post-Launch) |
| **Ephemeral Snaps** | Frontend React DOM Deletion | **Serverless Cloud Cron Prining** | 🟢 Low (Post-Launch) |
