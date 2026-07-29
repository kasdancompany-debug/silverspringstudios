import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/layout/Wordmark";
import { LoginForm } from "@/components/admin/LoginForm";
import { isDemoModeAllowed, isSupabaseEnvConfigured } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  const demoAvailable = isDemoModeAllowed() && !isSupabaseEnvConfigured();

  return (
    <div className="grain relative flex min-h-screen items-center justify-center bg-ink px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(196,184,168,0.08),_transparent_55%)]" />
      <div className="relative z-[2] w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <Wordmark href={undefined} />
          <p className="mt-6 text-xs tracking-[0.28em] text-warm-metal uppercase">Acquisitions Desk</p>
          <h1 className="mt-3 font-display text-3xl text-ivory">Admin Sign In</h1>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate">
            Internal access only. Sign in with your Silver Spring Studios team credentials to review
            submissions and manage signed titles.
          </p>
        </div>

        <div className="border border-line-strong bg-surface p-8 md:p-10">
          {demoAvailable ? (
            <div className="mb-8 space-y-4 border border-warm-metal/40 bg-warm-metal/5 p-5">
              <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Demo mode</p>
              <p className="text-sm leading-relaxed text-slate">
                Supabase is not configured. Explore the acquisitions desk with clearly marked sample
                submissions — no live filmmaker data.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center justify-center border border-warm-metal/60 px-4 py-2.5 text-xs tracking-[0.12em] text-warm-metal uppercase no-underline transition-colors hover:border-warm-metal hover:text-ivory"
              >
                Enter demo dashboard
              </Link>
            </div>
          ) : null}

          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-8 text-center text-xs tracking-[0.1em] text-slate/70 uppercase">
          Not a team member? Return to the{" "}
          <Link href="/" className="text-slate underline-offset-4 hover:text-ivory">
            public site
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
