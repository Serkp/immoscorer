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
    let mounted = true;

    // Initialize: try getSession first (fast, from memory/cookie),
    // then validate with getUser (server-side check)
    async function init() {
      try {
        // 1. getSession — fast, reads from local storage / cookie
        const { data: { session: s } } = await supabase.auth.getSession();
        if (mounted && s?.user) {
          console.log("[AuthProvider] session found:", s.user.id);
          setSession(s);
          setUser(s.user);
          setLoading(false);
        }

        // 2. getUser — validates token server-side (slower but authoritative)
        const { data: { user: u } } = await supabase.auth.getUser();
        if (mounted) {
          if (u) {
            console.log("[AuthProvider] getUser confirmed:", u.id);
            setUser(u);
          } else if (!s?.user) {
            // Only clear user if getSession also had no user
            console.log("[AuthProvider] no session, no user");
            setUser(null);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("[AuthProvider] init error:", err);
        if (mounted) setLoading(false);
      }
    }
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return;
      console.log("[AuthProvider] auth event:", _event, s?.user?.id);
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);

      // Ensure profile exists on sign-in (FK constraint for saves)
      if (_event === "SIGNED_IN" && s?.user) {
        supabase
          .from("profiles")
          .select("id")
          .eq("id", s.user.id)
          .maybeSingle()
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

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
