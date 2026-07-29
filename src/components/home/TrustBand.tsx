import { ButtonLink } from "@/components/ui/ButtonLink";
import { STUDIO_ADVISOR } from "@/lib/studio-advisor";

const POINTS = [
  "Completed features with a clear point of view",
  "Filmmakers who take presentation and audience seriously",
  "Digital and streaming release — not theatrical exhibition",
  "Terms discussed openly before any agreement is signed",
] as const;

export function TrustBand() {
  return (
    <section id="trust" className="relative overflow-hidden border-y border-line bg-void py-20 md:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 100% 0%, rgba(255, 45, 106, 0.14), transparent 55%)",
        }}
      />
      <div className="container-page relative z-[1] grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <p className="credit text-signal">Partnership</p>
          <h2 className="mt-4 font-impact text-[clamp(2.5rem,7vw,4rem)] leading-[0.92] text-ivory">
            Built for filmmakers
            <br />
            with intention.
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-slate">
            We work with independent filmmakers who have finished ambitious work and want a
            distributor that treats packaging, positioning, and commercial reality with equal
            seriousness. Silver Spring Studios is building its slate carefully — title by title.
          </p>

          <div className="mt-10 border border-line bg-surface/80 p-6 md:p-8">
            <p className="credit text-signal">{STUDIO_ADVISOR.deskLabel}</p>
            <p className="mt-3 font-display text-xl leading-snug text-ivory md:text-2xl">
              {STUDIO_ADVISOR.deskBlurb}
            </p>
            <p className="mt-4 text-sm text-slate">{STUDIO_ADVISOR.responseAimLabel}.</p>
          </div>
        </div>

        <div>
          <p className="credit text-slate">What we value</p>
          <ul className="mt-6 space-y-0">
            {POINTS.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-4 border-t border-line py-5 first:border-t-0 first:pt-0"
              >
                <span className="font-impact text-2xl text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.95rem] leading-snug text-ivory md:text-lg">{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/submit" variant="signal">
              Submit a Film
            </ButtonLink>
            <ButtonLink href="/our-approach" variant="secondary">
              Our Approach
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
