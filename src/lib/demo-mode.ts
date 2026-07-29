/**
 * Demo mode lets public forms and the acquisitions desk run against
 * in-memory sample data when Supabase isn't configured.
 *
 * Never enabled in production — even if NEXT_PUBLIC_DEMO_MODE is set —
 * so sample records and auth bypasses cannot ship accidentally.
 */
export function isDemoModeAllowed(): boolean {
  if (process.env.NODE_ENV === "production") {
    return false;
  }
  return true;
}

export function isSupabaseEnvConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return false;
  // Reject obvious placeholder values that would look "configured" but aren't.
  if (url.includes("your-project") || url.includes(".example")) return false;
  if (anonKey.includes("your-anon") || anonKey === "your-anon-key") return false;
  return true;
}

/** True when a public-facing URL/email still looks like a template placeholder. */
export function isPlaceholderSiteConfig(): boolean {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
  return (
    !siteUrl ||
    siteUrl.includes(".example") ||
    !email ||
    email.includes(".example")
  );
}
