import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const VALID_OTP_TYPES = ["email", "signup", "recovery", "invite"] as const;
type OtpType = (typeof VALID_OTP_TYPES)[number];

function isValidOtpType(value: string): value is OtpType {
  return VALID_OTP_TYPES.includes(value as OtpType);
}

function isSafePath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("\\")) return false;
  try {
    const url = new URL(path, "http://localhost");
    return url.pathname.startsWith("/");
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const nextParam = searchParams.get("next") ?? "/";
  const next = isSafePath(nextParam) ? nextParam : "/";

  if (token_hash && rawType && isValidOtpType(rawType)) {
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const { error } = await supabase.auth.verifyOtp({
      type: rawType,
      token_hash,
    });

    if (!error) return response;
  }

  return NextResponse.redirect(`${origin}/login?error=confirmation_error`);
}
