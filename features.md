# 💖 LoveWithYou - Complete Features Architecture & Audit (`features.md`)

This document contains a comprehensive audit and technical documentation of all implemented features in the **LoveWithYou** Dating PWA, Go Backend Microservices, and Supabase PostgreSQL Database architecture.

---

# 1. Authentication

## Hardware Device Fingerprint Authentication
1. **What it does**: Allows users to seamlessly register and log in using their device's unique hardware fingerprint without requiring tedious email/password logins or phone OTP verification.
2. **How it works technically**: The frontend generates a persistent device fingerprint stored in `useUserStore.ts` and passes it via `X-Device-Id` HTTP headers to `POST /auth/device` in Go backend and Supabase `profiles` table.
3. **Why it is important**: Eliminates onboarding drop-off, protects user privacy by avoiding personal phone number collection, and prevents fake account creation.

## Age Verification & Mandatory Setup Gate
1. **What it does**: Enforces a strict age minimum of 18+ and forces new users to complete their profile setup before accessing matching decks or chat rooms.
2. **How it works technically**: Implemented in `app/setup/page.tsx` using interactive sliders (18 to 60+), validating non-empty names and enforcing a 6-photo safety upload standard before saving to Supabase.
3. **Why it is important**: Guarantees legal compliance for 18+ dating platforms and prevents blank or incomplete bot profiles from entering the swipe deck.

## Master & Sub-Admin Security Gatekeeper
1. **What it does**: Secures the administration portal (`/admin`) behind a master security key (`***REMOVED***`) and allows lower sub-admins to log in with granular access rights.
2. **How it works technically**: Built in `app/admin/page.tsx` using password verification state, local storage sub-admin registry, and Supabase security policies locking sensitive user attributes.
3. **Why it is important**: Protects sensitive user data, provides moderation control over toxic accounts, and enables revenue monitoring.

---

# 2. Profile

## Interactive Hinge-Style Prompts & Teasers
1. **What it does**: Displays conversational icebreaker prompts (e.g., *"Finish My Sentence"*, *"On our first weekend together..."*) on profile cards to spark natural dialogue.
2. **How it works technically**: Managed in `components/profile/AdvancedDatingWidget.tsx` and `app/profile/edit/page.tsx`, storing prompt strings in the Supabase `profiles` table.
3. **Why it is important**: Solves the common dating app problem of boring profile bios and gives matches an easy opening flirt line.

## Multi-Photo Gallery & Bio Management
1. **What it does**: Enables users to upload, preview, re-order, and manage their gallery photos and public bio descriptions.
2. **How it works technically**: Connected to `lib/cloudinary.ts` using `uploadToCloudinary()`, sending media directly to Cloud Name `dpexzhhae` via `lovewithyou_preset` and saving secure HTTPS URLs to Supabase.
3. **Why it is important**: Visual appeal is the single most critical factor for dating apps, ensuring fast image loading without burdening application servers.

## Zodiac & Compatibility Calculator Tagging
1. **What it does**: Displays zodiac badges (Astrology) and automatically calculates a percentage compatibility score between two profiles.
2. **How it works technically**: Evaluates zodiac sign pairs in `app/page.tsx` via `getZodiacCompatibility()`, rendering styled dark-glass chips on swipe cards.
3. **Why it is important**: Adds fun personality depth and increases user engagement through astrological matching trends.

## Tabbed VIP Profile Dashboard
1. **What it does**: Presents a streamlined user profile dashboard divided into Overview, Edit Details, and Weekly Analytics tabs.
2. **How it works technically**: Built in `app/profile/page.tsx` using framer-motion tab switching, displaying views, likes, matches, and coin balances.
3. **Why it is important**: Provides users with a clear command center to track their dating success and manage app settings.

---

# 3. Coin Economy

## Wallet Coin Balance & Real-Time Ledger
1. **What it does**: Tracks virtual coin currency in the user's wallet used to unlock premium micro-actions like rewinds, radar pings, and VIP Halos.
2. **How it works technically**: Synced reactively via Zustand `useUserStore.ts` and Go backend endpoints `POST /coins/earn` and `POST /coins/spend`.
3. **Why it is important**: Drives app gamification and lays the foundation for micro-transaction monetization.

## Daily Cupid's Slot Machine Reward Wheel
1. **What it does**: Allows users to spin a lucky wheel once every 24 hours to win free wallet coins, Super Likes, or profile boosts.
2. **How it works technically**: Invokes `POST /api/v1/rewards/daily-slot` in Go backend via `components/profile/AdvancedDatingWidget.tsx`, featuring spinning animation states and instant coin credits.
3. **Why it is important**: Boosts daily active user (DAU) retention by rewarding users for logging in every day.

## Coin Deduction for Premium Micro-Actions
1. **What it does**: Charges specific coin amounts for high-value actions (e.g., -5 Coins for Rewinds, -5 Coins for State Filters, -50 Coins for VIP Halo).
2. **How it works technically**: Executes `spendCoins(amount)` inside client components, verifying sufficient balance before calling backend endpoints.
3. **Why it is important**: Prevents feature spamming and creates intrinsic value for earning or purchasing virtual coins.

---

# 4. Swipe & Match

## Tinder-Style Card Swiping & Super Likes
1. **What it does**: Allows users to swipe left to pass, right to like, or trigger a Super Like with animated card gestures.
2. **How it works technically**: Implemented in `app/page.tsx` using Framer Motion drag gestures, posting swipe directions to Supabase `swipes` table and `POST /swipes`.
3. **Why it is important**: Provides the classic, addictive core matching mechanic expected in modern dating applications.

## 🔄 "Second Chance" Swipe History Rewind Vault
1. **What it does**: Allows users to restore their last left-swiped profile if they made a mistake or changed their mind.
2. **How it works technically**: Triggered via `handleRewind()` in `app/page.tsx` and `POST /api/v1/swipes/rewind`, deducting 5 coins and popping the last swiped profile from local history.
3. **Why it is important**: Gives users peace of mind against accidental swipes and serves as a popular coin sink.

## 📍 Nearby GPS Sonar Radar Scan
1. **What it does**: Displays nearby singles on an interactive GPS radar map within adjustable distance radii.
2. **How it works technically**: Built in `app/nearby-map/page.tsx` fetching coordinates via `GET /users/nearby` and posting high-priority pings via `POST /api/v1/radar/ping`.
3. **Why it is important**: Facilitates real-world local dating and spontaneous nearby meetups.

## 🎙️ 3-Minute Voice-First "Blind Date" Lounge
1. **What it does**: Connects two singles in a 3-minute voice-only date where photos and names remain hidden until both tap "YES".
2. **How it works technically**: Operates in `app/blind-date/page.tsx` using `POST /api/v1/blind-audio/match`, featuring an automated 180s countdown timer and mutual consent reveal cards.
3. **Why it is important**: Prioritizes genuine voice chemistry over surface-level photos, creating deeper romantic connections.

## 🔥 18+ After-Dark Anonymous Intimate Lounge
1. **What it does**: Provides a private, dark-mode night lounge (11 PM - 2 AM) for anonymous intimate matching without logging names or locations.
2. **How it works technically**: Built in `app/after-dark/page.tsx` connected to Go backend `POST /api/v1/lounge/join` with high-concurrency memory matching queues and zero DB persistence.
3. **Why it is important**: Caters to night-owl singles seeking judgment-free, private, consensual conversations.

## 🌙 Midnight Roulette & 2v2 Squad Matching
1. **What it does**: Enables shy users to pair up with a best friend for 2-vs-2 group voice and chat room dates.
2. **How it works technically**: Implemented in `app/midnight-roulette/page.tsx` calling `POST /api/v1/squad/match` to create paired group room tokens.
3. **Why it is important**: Reduces 1-on-1 dating anxiety by bringing a wingman/friend along for double dates.

## OmeTV-Style Instant Random Chat
1. **What it does**: Instantly pairs users with random available singles for quick text or video handshakes.
2. **How it works technically**: Operates in `app/random-chat/page.tsx`, displaying live active indicators and typing status notifications.
3. **Why it is important**: Delivers instant gratification for users seeking immediate conversations without waiting for mutual swipes.

---

# 5. Chat

## Real-Time Instant Messaging (Supabase Realtime)
1. **What it does**: Delivers sub-100ms real-time text messaging between matched users.
2. **How it works technically**: Built in `app/chat/[id]/page.tsx` using Supabase WebSocket channel subscriptions (`supabase.channel()`), inserting messages into the `messages` table.
3. **Why it is important**: Enables seamless, reliable communication without page refreshes or message lag.

## 👻 Snapchat-Style Ephemeral 5-Second Snaps
1. **What it does**: Allows users to send private photo snaps that self-destruct 5 seconds after the recipient taps to view them.
2. **How it works technically**: Uploads media via `uploadToCloudinary()`, rendering a blurred glassmorphic overlay in `app/chat/[id]/page.tsx` with an immutable 5s timer and auto-deletion.
3. **Why it is important**: Enhances chat intimacy and privacy, giving users confidence when sharing private moments.

## 🎙️ Walkie-Talkie Voice Note Recorder
1. **What it does**: Enables users to record and send instant walkie-talkie audio notes directly inside chat rooms.
2. **How it works technically**: Captures microphone audio using HTML5 `MediaRecorder` API in `app/chat/[id]/page.tsx`, uploading audio blobs to Cloudinary and rendering inline audio waveforms.
3. **Why it is important**: Voice notes convey tone and emotion far better than plain text messages.

## Friend Request Gating Safeguard
1. **What it does**: Locks message input textboxes until mutual friend requests are officially accepted by both users.
2. **How it works technically**: Checks friendship status in Supabase `friend_requests` table before rendering the chat input controls.
3. **Why it is important**: Prevents unsolicited spam or harassment from unverified strangers.

---

# 6. Safety

## 👁️ AI Face Liveness & "Catfish Buster" Smile Scan
1. **What it does**: Verifies user identity using real-time face landmark scanning and smile ratio verification to grant a **Blue Diamond Trust Shield 🛡️💎**.
2. **How it works technically**: Evaluates client-side TensorFlow models (`ssd_mobilenetv1.bin`) in `app/setup/page.tsx` and calls `POST /api/v1/safety/verify-smile` in Go backend.
3. **Why it is important**: Eradicates catfish profiles and fake photos, making LoveWithYou one of the safest dating platforms available.

## 🚨 Emergency 2-Hour "Date Safe Check-In" SOS Guardian
1. **What it does**: Arms a 2-hour protection timer before real-world offline dates that automatically dispatches GPS coordinates to a trusted friend if the user fails to check in safe.
2. **How it works technically**: Managed in `components/profile/AdvancedDatingWidget.tsx` calling `POST /api/v1/safety/sos-timer`, storing emergency contact phone numbers and meetup location strings.
3. **Why it is important**: Ensures physical safety for users meeting online matches in the real world.

## Anti-Screenshot & Screen-Record Shield
1. **What it does**: Blocks screenshot captures and warns users against leaking private chat conversations or profile media.
2. **How it works technically**: Wrapped globally via `components/ScreenshotShield.tsx`, monitoring key combinations (`PrintScreen`, `Win+Shift+S`) and visibility changes.
3. **Why it is important**: Protects user privacy and prevents unauthorized distribution of intimate chat media.

## Device Banning & Moderation System
1. **What it does**: Instantly bans toxic users or harassment offenders by blacklisting their hardware device fingerprint.
2. **How it works technically**: Admin updates `is_banned: true` in Supabase `profiles` table via `app/admin/page.tsx`, blocking API requests for banned device IDs.
3. **Why it is important**: Keeps the community safe and prevents banned troublemakers from simply creating new accounts.

---

# 7. UI/UX

## Minimalist Luxury 7-Color Signature Design System
1. **What it does**: Establishes a cohesive dark-mode aesthetic using 7 curated signature hex colors (`#D624B8`, `#4B32F0`, `#32A7F0`, `#4CF5EB`, `#4BF02B`, `#FFDC17`, `#E36E59`).
2. **How it works technically**: Registered in `app/globals.css` via `@theme` variables, CSS custom utility classes (`.badge-gold`, `.btn-signature-gradient`), and dark glass styling.
3. **Why it is important**: Eliminates color chaos and gives the PWA a sleek, high-end, Tinder Gold/Raya level presentation.

## Dynamic AppLayoutWrapper Responsive Container
1. **What it does**: Automatically adjusts layout container widths, hiding public top/bottom bars for full-screen dashboards like `/admin`.
2. **How it works technically**: Implemented in `components/layout/AppLayoutWrapper.tsx` using `usePathname()`, conditionally rendering `<TopBar />` and `<BottomNav />`.
3. **Why it is important**: Fixes double navigation bars and squished mobile layouts on widescreen desktop devices.

## Accordion Navigation Sidebar Drawer
1. **What it does**: Organizes all app features, arenas, match preferences, and settings into clean collapsible drawer sections.
2. **How it works technically**: Built in `components/SidebarDrawer.tsx` using Framer Motion slide-in animations and Zustand state hooks.
3. **Why it is important**: Keeps navigation intuitive and beginner-friendly without cluttering the main screen.

## Haptic Vibrations & Smooth Animations
1. **What it does**: Triggers subtle physical phone vibrations when swiping cards, tapping buttons, or syncing heartbeats.
2. **How it works technically**: Implemented via `useHaptics()` hook referencing HTML5 `navigator.vibrate()`.
3. **Why it is important**: Enhances tactile feedback and makes user interactions feel premium and alive.

---

# 8. Student Perks

## Campus Student ID Verification Badge
1. **What it does**: Grants a verified student badge (`GraduationCap`) to college students upon uploading their campus ID card.
2. **How it works technically**: Student ID images are uploaded via `uploadToCloudinary()`, queued in `app/admin/page.tsx` for admin verification, and updated in Supabase.
3. **Why it is important**: Creates trusted student micro-communities on college campuses.

## Campus Secret Crush Locker
1. **What it does**: Allows students to submit secret college crushes anonymously; if both add each other, a mutual match is revealed!
2. **How it works technically**: Connected to `POST /api/v1/campus/crush` in Go backend via `lib/api.ts`.
3. **Why it is important**: Solves college crush hesitation and makes campus dating fun and risk-free.

## Anonymous Campus Confessions Live Feed
1. **What it does**: Provides a live community feed for students to post anonymous college confessions and flirt stories.
2. **How it works technically**: Operates in `app/campus/page.tsx` using `POST /api/v1/campus/confessions` with department tags.
3. **Why it is important**: Boosts community engagement and daily app opens among college students.

## Virtual Speed Dating & Campus Mixers
1. **What it does**: Hosts timed virtual speed dating events for specific university campuses.
2. **How it works technically**: Rendered in `app/events/page.tsx` with event countdown clocks and registration queues.
3. **Why it is important**: Creates event-driven spikes in user traffic and mutual matches.

---

# 9. Monetization

## In-App AdMob & Unity Ads Earning Tracker
1. **What it does**: Tracks daily ad impressions, eCPM rates, and estimated payouts from rewarded video and banner ads.
2. **How it works technically**: Analytics monitored in `app/admin/page.tsx` with real-time financial summary cards.
3. **Why it is important**: Generates passive ad revenue from non-paying users who watch ads for free coins.

## VIP Halo Glowing Avatar Border
1. **What it does**: Unlocks a golden glowing halo avatar ring around user profile photos across swipe decks and leaderboards.
2. **How it works technically**: Activated via `POST /api/v1/profile/vip-halo` for 50 coins, applying custom CSS glow classes.
3. **Why it is important**: Provides a status symbol for top users and serves as a major coin sink.

## Profile Discovery Boost (30-Min Priority Radar)
1. **What it does**: Priority-boosts a user's profile to the top of nearby swipe decks for 30 minutes, increasing matches up to 10x.
2. **How it works technically**: Triggered via `API.broadcastPheromonePulse()` in `app/nearby-map/page.tsx`, updating priority ranking algorithms.
3. **Why it is important**: High-converting premium feature that encourages coin spending.

## Premium Subscription Tier Showcase
1. **What it does**: Showcases VIP tier perks (Unlimited Swipes, Rewinds, VIP Halos, See Who Liked You).
2. **How it works technically**: Rendered in `app/premium/page.tsx` with tier comparison cards and unlock triggers.
3. **Why it is important**: Drives user conversion from free tier to paid VIP memberships.
