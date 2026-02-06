import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for browser/client-side usage
 * This client is used in Client Components
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Singleton instance for client-side usage
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Gets a singleton Supabase client for browser usage
 * Use this to avoid creating multiple client instances
 */
export function getSupabaseClient() {
  if (!browserClient) {
    browserClient = createBrowserClient();
  }
  return browserClient;
}
