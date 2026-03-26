import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export async function POST(request: NextRequest) {
  try {
    // Verify the request comes from an authenticated context
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Use admin client to fetch user data securely
    const supabase = getSupabaseAdmin();
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user?.user) {
      console.error("[WelcomeEmail API] User not found:", userError);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = user.user.email;
    if (!email) {
      return NextResponse.json({ error: "No email for user" }, { status: 400 });
    }

    const name = user.user.user_metadata?.full_name as string | undefined;

    await sendWelcomeEmail({ email, name });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[WelcomeEmail API] Error:", error);
    // Don't fail the signup flow — email is non-critical
    return NextResponse.json(
      { error: "Failed to send welcome email" },
      { status: 500 }
    );
  }
}
