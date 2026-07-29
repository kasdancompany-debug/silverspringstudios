import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";

const PUBLIC_ADMIN_PATHS = ["/admin/login"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");

  if (!isProtectedRoute || isPublicAdminPath(pathname)) {
    return response;
  }

  const redirectToLogin = (reason?: string) => {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    if (reason) loginUrl.searchParams.set("error", reason);
    return NextResponse.redirect(loginUrl);
  };

  // Production never opens admin without a real Supabase session.
  // Development may explore the desk with sample data when env is missing.
  if (!isSupabaseEnvConfigured()) {
    if (isDemoModeAllowed()) {
      return response;
    }
    return redirectToLogin();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll() {},
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectToLogin();
  }

  // Fail closed: missing profile or lookup error means no staff access.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return redirectToLogin("unauthorized");
  }

  if (profile.role !== "admin" && profile.role !== "reviewer") {
    return redirectToLogin("unauthorized");
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
