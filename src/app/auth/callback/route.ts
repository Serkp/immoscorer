import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  /* ── PKCE flow: exchange code for session ── */
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset-password", requestUrl.origin)
        );
      }
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  /* ── Token hash flow (older Supabase format) ── */
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "email" | "signup",
    });
    if (!error) {
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset-password", requestUrl.origin)
        );
      }
      return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
    }
  }

  /* ── Fallback: something went wrong ── */
  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
