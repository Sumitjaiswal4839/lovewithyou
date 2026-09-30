import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import Script from "next/script";
import { PushNotificationPrompt } from "@/components/PushNotificationPrompt";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export const metadata: Metadata = {
  title: "LoveWithYou - Random Chat & Free Anonymous Dating",
  description: "Join LoveWithYou for free anonymous dating, meet singles nearby, and start random chats globally. The best secure dating app to meet strangers.",
  keywords: "random chat, free dating app, meet singles, anonymous chat, strangers chat india, meet singles nearby",
  openGraph: {
    title: "LoveWithYou - Random Chat & Anonymous Dating",
    description: "Meet singles nearby and start random anonymous chats instantly.",
    url: "https://lovewithyou.vercel.app",
    siteName: "LoveWithYou",
    type: "website",
  },
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PostHog Analytics */}
        {process.env.NEXT_PUBLIC_POSTHOG_KEY && (
          <Script id="posthog-analytics" strategy="afterInteractive">
            {`
              !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId setPersonProperties group reset groups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTrace".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
              posthog.init('${process.env.NEXT_PUBLIC_POSTHOG_KEY}',{api_host:'https://us.i.posthog.com', person_profiles: 'identified_only'})
            `}
          </Script>
        )}
        {/* Manual Service Worker Registration for Turbopack */}
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                  function(registration) {
                    console.log('Service Worker registration successful with scope: ', registration.scope);
                  },
                  function(err) {
                    console.log('Service Worker registration failed: ', err);
                  }
                );
              });
            }
          `}
        </Script>
      </head>
      <body
        className="antialiased font-sans min-h-screen bg-[#f4f4f5] dark:bg-[#121212] sm:bg-[#e4e4e7] sm:dark:bg-[#0a0a0a] text-foreground selection:bg-primary/30 transition-colors duration-300"
      >
        <ThemeProvider defaultTheme="dark" storageKey="dating-ui-theme">
          <ToastProvider>
            {process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ? (
              <MaintenanceScreen />
            ) : (
              <>
                <PushNotificationPrompt />
                <AppLayoutWrapper>
                  {children}
                </AppLayoutWrapper>
              </>
            )}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
