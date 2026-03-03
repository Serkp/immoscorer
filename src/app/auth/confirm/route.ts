import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Alias for /auth/callback — Supabase may redirect to /auth/confirm
 * in some configurations (e.g., email confirmations, magic links).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const error = requestUrl.searchParams.get("error");
  const error_description = requestUrl.searchParams.get("error_description");

  if (error) {
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

  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return NextResponse.redirect(
        new URL(
          "/auth/error?message=" +
            encodeURIComponent(exchangeError.message),
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
  }

  if (token_hash && type) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "email" | "signup",
    });
    if (verifyError) {
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
  }

  return NextResponse.redirect(
    new URL("/auth/error?message=invalid_request", requestUrl.origin),
  );
}
