import { createClient } from "@/lib/supabase/server";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";

export type StaffAuthResult =
  | { ok: true; userId: string | null; demo: boolean }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Defense-in-depth staff gate for /api/admin/* routes.
 * Fail closed on missing/unknown roles. Allow demo only outside production
 * when Supabase env is not configured.
 */
export async function requireStaffSession(): Promise<StaffAuthResult> {
  if (!isSupabaseEnvConfigured()) {
    if (isDemoModeAllowed()) {
      return { ok: true, userId: null, demo: true };
    }
    return { ok: false, status: 401, error: "Authentication required." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { ok: false, status: 401, error: "Authentication required." };
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      return { ok: false, status: 403, error: "Unauthorized." };
    }

    if (profile.role !== "admin" && profile.role !== "reviewer") {
      return { ok: false, status: 403, error: "Unauthorized." };
    }

    return { ok: true, userId: user.id, demo: false };
  } catch {
    return { ok: false, status: 401, error: "Authentication required." };
  }
}
