# LovePWA 💘

> A high-performance, real-time Progressive Web App (PWA) dating platform built with Next.js, Go WebSockets, and Supabase.

LovePWA is a modern, responsive, and highly interactive dating application designed to provide a premium mobile-like experience on both Desktop and Mobile devices via Progressive Web App technology.

## 🌟 Core Features

- **Interactive Swiping Engine:** Tinder-like Framer Motion swipe cards with gesture tracking, Haptic feedback, and Super Likes.
- **Real-Time Match Logic:** Supabase-backed instant match detection with "Anti-Ghosting" 24-hour expiration timers.
- **Real-Time Chat & Engagement:** Powered by Go WebSockets, featuring Live Typing Indicators, Read Receipts (Blue Ticks), and Virtual Gifting (🌹).
- **Disappearing Media (View Once):** Send highly secure, ephemeral photos that permanently delete themselves 3 seconds after being opened.
- **Trust & Safety Center:** Built-in AI Face Scanning for Blue Tick verification, along with a robust Block & Report system.
- **Profile Customization & Discovery:** Express yourself with Bio Prompts, mock Spotify integration, and filter matches based on Campus Mode.
- **Monetization Engine:** Built-in virtual coin economy for Super Likes, Rewinding Swipes, and sending Virtual Gifts.
- **Viral Referral System:** Generate unique invite links to invite friends and earn rewards.

## 🛠️ Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Zustand
- **Backend:** Golang, WebSockets (Gorilla)
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security)
- **Deployment Strategy:** Vercel (Frontend), Fly.io / Render (Backend)

## 📦 Project Structure

- `/dating-pwa`: Next.js Frontend App
- `/backend`: Go WebSocket Backend Server

## 🚀 Running Locally

1. **Frontend:**
   ```bash
   cd dating-pwa
   npm install
   npm run dev
   ```

2. **Backend:**
   ```bash
   cd backend
   go mod tidy
   go run cmd/api/main.go
   ```

---
*LovePWA - Find love in your circle.*
