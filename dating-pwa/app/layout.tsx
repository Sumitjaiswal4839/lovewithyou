import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { AdminTrigger } from "@/components/AdminTrigger";
import { A2HSPrompt } from "@/components/A2HSPrompt";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import ScreenshotShield from "@/components/ScreenshotShield";
import Script from "next/script";

export const metadata: Metadata = {
  title: "LoveWithYou - Find your Match",
  description: "A secure, coin-based next-gen dating & flirt app.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/icon.png",
  },
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
      <head>
        {/* PostHog Analytics */}
        <Script id="posthog-analytics" strategy="afterInteractive">
          {`
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonProperties group reset groups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTrace".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_dummy_key_replace_me',{api_host:'https://us.i.posthog.com', person_profiles: 'identified_only'})
          `}
        </Script>
      </head>
      <body
        className="antialiased font-sans min-h-screen bg-black sm:bg-[#111] selection:bg-primary-500/30 transition-colors duration-300"
      >
        <ThemeProvider defaultTheme="dark" storageKey="dating-ui-theme">
          <ToastProvider>
            <div className="w-full max-w-md mx-auto min-h-screen bg-dark-bg relative shadow-2xl overflow-x-hidden sm:border-x border-white/5 pb-16 pt-14">
              <ScreenshotShield>
                <TopBar />
                <main className="min-h-full relative">
                  {children}
                </main>
                <BottomNav />
                <A2HSPrompt />
                <PushNotificationPrompt />
                <AdminTrigger />
              </ScreenshotShield>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
