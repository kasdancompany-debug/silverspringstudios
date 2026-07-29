import { ButtonLink } from "@/components/ui/ButtonLink";
import { STUDIO_ADVISOR } from "@/lib/studio-advisor";

const COMMITMENTS = [
  "Streaming & digital focus — not theatrical",
  "Packaging that matches the film",
  "Economics stated before you sign",
  "No invented catalogue or placements",
] as const;

export function TrustBand() {
  return (
    <section id="trust" className="relative overflow-hidden border-y border-line bg-void py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 100% 0%, rgba(255, 45, 106, 0.18), transparent 55%)",
        }}
      />
      <div className="container-page relative z-[1] grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="credit text-signal">Trust</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4.25rem)] leading-[0.92] text-ivory">
            New company.
            <br />
            Clear offer.
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-slate">
            We are building a founding slate of digital releases — not a theatrical slate, not a
            fake catalogue. Early partners get direct access, invested packaging and transparent
            economics. We publish what is actually true as we go.
          </p>

          <div className="mt-10 border border-line bg-surface/80 p-6 md:p-8">
            <p className="credit text-flare">{STUDIO_ADVISOR.deskLabel}</p>
            <p className="mt-3 font-display text-xl leading-snug text-ivory md:text-2xl">
              {STUDIO_ADVISOR.deskBlurb}
            </p>
            <p className="mt-4 text-sm text-slate">{STUDIO_ADVISOR.responseAimLabel}.</p>
          </div>
        </div>

        <div>
          <p className="credit text-slate">Publish commitments</p>
          <ul className="mt-6 space-y-0">
            {COMMITMENTS.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-4 border-t border-line py-5 first:border-t-0 first:pt-0"
              >
                <span className="font-impact text-2xl text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-impact text-xl tracking-[0.03em] text-ivory md:text-2xl">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/submit?source=founding-slate&medium=home&campaign=trust"
              variant="signal"
            >
              Submit for Consideration
            </ButtonLink>
            <ButtonLink href="/our-approach#founding-slate" variant="secondary">
              Follow the Slate
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
