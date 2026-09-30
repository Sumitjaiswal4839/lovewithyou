import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "dummy-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn("Supabase URL or Key is missing from environment variables! Using dummy values for build.");
}

import { useUserStore } from "@/store/useUserStore";

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: async (url, options = {}) => {
      const state = useUserStore.getState();
      const headers = new Headers(options?.headers);
      if (state.authToken) {
        headers.set("Authorization", `Bearer ${state.authToken}`);
      }
      return fetch(url, { ...options, headers });
    },
  },
});
