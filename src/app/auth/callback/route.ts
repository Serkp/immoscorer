import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  // ── Error from Supabase ──
  if (error) {
    console.error("Auth callback error:", error, error_description);
    return NextResponse.redirect(
      new URL(
        "/auth/error?message=" +
          encodeURIComponent(error_description || error),
        requestUrl.origin,
      ),
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.redirect(
      new URL("/auth/error?message=server_config_error", requestUrl.origin),
    );
  }

  // Create Supabase server client with cookie handling
  const cookieStore = cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  // ── PKCE Flow: exchange code for session ──
  if (code) {
    try {
      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Code exchange error:", exchangeError);
        return NextResponse.redirect(
          new URL(
            "/auth/error?message=" +
              encodeURIComponent(exchangeError.message),
            requestUrl.origin,
          ),
        );
      }
      // Redirect based on flow type
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset-password", requestUrl.origin),
        );
      }
      if (type === "signup") {
        // Send welcome email (non-blocking, don't fail the redirect)
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            sendWelcomeEmail({
              email: user.email,
              name: user.user_metadata?.full_name as string | undefined,
            }).catch((err) => console.error("[Auth Callback] Welcome email failed:", err));
          }
        } catch (e) {
          console.error("[Auth Callback] Could not send welcome email:", e);
        }
        return NextResponse.redirect(
          new URL("/dashboard", requestUrl.origin),
        );
      }
      return NextResponse.redirect(
        new URL("/dashboard", requestUrl.origin),
      );
    } catch (e) {
      console.error("Callback exception:", e);
      return NextResponse.redirect(
        new URL("/auth/error?message=exchange_failed", requestUrl.origin),
      );
    }
  }

  // ── Token Hash Flow (older Supabase format / magic link) ──
  if (token_hash && type) {
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "recovery" | "email" | "signup",
      });
      if (verifyError) {
        console.error("OTP verify error:", verifyError);
        return NextResponse.redirect(
          new URL(
            "/auth/error?message=" +
              encodeURIComponent(verifyError.message),
            requestUrl.origin,
          ),
        );
      }
      if (type === "recovery") {
        return NextResponse.redirect(
          new URL("/auth/reset-password", requestUrl.origin),
        );
      }
      return NextResponse.redirect(
        new URL("/dashboard", requestUrl.origin),
      );
    } catch (e) {
      console.error("Token verification exception:", e);
      return NextResponse.redirect(
        new URL("/auth/error?message=verification_failed", requestUrl.origin),
      );
    }
  }

  // ── Nothing provided ──
  return NextResponse.redirect(
    new URL("/auth/error?message=invalid_request", requestUrl.origin),
  );
}
