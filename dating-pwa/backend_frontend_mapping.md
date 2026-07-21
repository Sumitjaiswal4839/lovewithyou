# Project Architecture Mapping (Frontend vs Backend Connectivity)

This document tracks which features and files are fully connected to the real Go/Supabase backend versus those running on local/mock frontend state.

## 🟢 FULLY CONNECTED (Real Backend Logic)
*None yet. All API endpoints in `lib/api.ts` are ready, but we have been focusing on frontend MVP completion before wiring the database.*

## 🟡 PARTIALLY CONNECTED (State Management & API Stubs)
- `store/useUserStore.ts`: This is the global state manager. It simulates a database perfectly for the frontend.
- `lib/api.ts`: Contains the sync wrappers (`syncState`, `fetchProfile`) ready to be plugged into Go endpoints.
- `app/setup/page.tsx`: Collects real camera blobs and data, but saves it to Zustand instead of a real bucket.
- `backend/main.go`: Has the schema and structs defined for User Profiles, but uses an in-memory map instead of Supabase PostgreSQL.

## 🔴 FRONTEND ONLY (Mock Data / Local Logic)
### Core Pages
- `app/page.tsx` (Swipe Stack): Uses `DUMMY_PROFILES`. Filtering (Campus mode, Active mode) happens purely on the client side.
- `app/chat/page.tsx` (Chat List): Uses `matches` from Zustand store (Mock Data).
- `app/chat/[id]/page.tsx` (Chat Screen): Messages and simulated AI Icebreaker are stored in local component state. Typing indicators use `setTimeout`.
- `app/profile/page.tsx` (Analytics & Insights): Reads from local Zustand mock `analytics`.
- `app/profile/edit/page.tsx` (Edit Profile): Saves directly to Zustand store.
- `app/events/page.tsx` (Event Calendar): Uses hardcoded event arrays.
- `app/blind-date/page.tsx` (Voice Swipe): Records real audio but handles swiping via local mock data.

### Global Components & Service Workers
- `components/theme-provider.tsx`: Uses `localStorage` (Client).
- `components/ui/ToastProvider.tsx`: Client-side context state.
- `public/sw.js`: Service worker handles offline fallback and simulates Push Notifications locally.
- `hooks/useHaptics.ts`: Browser-native Vibration API.
- `components/ui/AIIcebreaker.tsx`: Currently simulates Gemini API latency using a mock timeout.

---
**Status Note:** Once the Next.js frontend build issues are resolved, the immediate next phase is connecting these 🔴/🟡 features to the Supabase Cloud.
