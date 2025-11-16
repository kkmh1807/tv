"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { supabaseBrowser } from "@/utils/supabase/client";
import { useUser } from "@/utils/user/UserContext";

export default function Login() {
  const supabase = supabaseBrowser();
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (user) {
      router.push("/home");
    }
  }, [user, router]);

  if (loading) return <p>Loading…</p>;

  if (user) {
    return null; 
  }

  return (
    <div className="max-w-sm mx-auto">
      <Auth
        supabaseClient={supabase}
        providers={[]}
        showLinks={false}
        onlyThirdPartyProviders={false}
      />
    </div>
  );
}
