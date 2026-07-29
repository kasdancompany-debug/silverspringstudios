"use client";

import { useState } from "react";
import { ExternalLink, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Displays the screener URL as a plain link, but never renders the
 * screener password in the initial page HTML. The password stays masked
 * until an authenticated admin/reviewer explicitly clicks "Reveal
 * password", which calls POST /api/admin/screener-reveal — a request that
 * is authorized server-side and logged to submission_access_log.
 */
export function ScreenerCredentials({
  submissionId,
  screenerUrl,
  hasPassword,
}: {
  submissionId: string;
  screenerUrl: string | null;
  hasPassword: boolean;
}) {
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReveal() {
    setError(null);
    setIsRevealing(true);

    try {
      const response = await fetch("/api/admin/screener-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        setError(json?.error ?? "Unable to reveal password. Please try again.");
        return;
      }

      setRevealedPassword(typeof json.password === "string" ? json.password : "");
    } catch {
      setError("Unable to reveal password. Please check your connection and try again.");
    } finally {
      setIsRevealing(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-xs tracking-[0.08em] text-slate uppercase">Screener</p>
        <p className="mt-1 text-sm leading-relaxed break-all text-ivory">
          {screenerUrl ? (
            <a
              href={screenerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-warm-metal hover:text-ivory"
            >
              {screenerUrl}
              <ExternalLink size={13} strokeWidth={1.75} />
            </a>
          ) : (
            "—"
          )}
        </p>
      </div>

      <div>
        <p className="text-xs tracking-[0.08em] text-slate uppercase">Screener Password</p>

        {!hasPassword ? (
          <p className="mt-1 text-sm text-ivory">—</p>
        ) : revealedPassword !== null ? (
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <code className="border border-line-strong bg-ink px-2.5 py-1 text-sm tracking-wide text-ivory">
              {revealedPassword || "(empty)"}
            </code>
            <button
              type="button"
              onClick={() => setRevealedPassword(null)}
              className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] text-slate uppercase transition-colors hover:text-ivory"
            >
              <EyeOff size={13} strokeWidth={1.75} />
              Hide
            </button>
          </div>
        ) : (
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="font-display text-lg tracking-[0.3em] text-ivory">••••••••</span>
            <Button type="button" variant="secondary" size="sm" onClick={handleReveal} disabled={isRevealing}>
              {isRevealing ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Revealing…
                </>
              ) : (
                <>
                  <Eye size={13} strokeWidth={1.75} />
                  Reveal password
                </>
              )}
            </Button>
          </div>
        )}

        {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}
      </div>
    </>
  );
}
