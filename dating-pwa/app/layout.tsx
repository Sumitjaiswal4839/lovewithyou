import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AdminTrigger } from "@/components/AdminTrigger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LoveWith You - Find your Match",
  description: "A secure, coin-based dating app.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#ec4899",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is standard practice when using theme toggles
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black sm:bg-[#111] selection:bg-primary-500/30 transition-colors duration-300`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="dating-ui-theme">
          <ToastProvider>
            <div className="w-full max-w-md mx-auto min-h-screen bg-dark-bg relative shadow-2xl overflow-x-hidden sm:border-x border-white/5 pb-16 pt-14">
              <TopBar />
              <main className="min-h-full relative">
                {children}
              </main>
              <BottomNav />
              <AdminTrigger />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
