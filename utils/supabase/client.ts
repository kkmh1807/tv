import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let client: SupabaseClient | undefined;

export const supabaseBrowser = (): SupabaseClient => {
  if (!client) {
    client = createBrowserClient(url, anon);
  }
  return client;
};
