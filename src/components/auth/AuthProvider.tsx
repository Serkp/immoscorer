"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    // Use getUser() — validates token server-side, reads from cookie
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      setUser(u ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Ensure profile exists on sign-in (FK constraint for saves)
      if (_event === "SIGNED_IN" && s?.user) {
        supabase
          .from("profiles")
          .select("id")
          .eq("id", s.user.id)
          .single()
          .then(({ data }) => {
            if (!data) {
              supabase.from("profiles").upsert(
                { id: s.user!.id, email: s.user!.email, updated_at: new Date().toISOString() },
                { onConflict: "id" }
              ).then(({ error }) => {
                if (error) console.error("[AuthProvider] profile create error:", error.message);
                else console.log("[AuthProvider] profile ensured for:", s.user!.id);
              });
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await getSupabase().auth.signOut();
    setUser(null);
    setSession(null);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
