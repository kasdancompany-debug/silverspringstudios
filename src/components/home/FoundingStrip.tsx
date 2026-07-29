import { ButtonLink } from "@/components/ui/ButtonLink";

export function FoundingStrip() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-surface py-20 md:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 90% 50%, rgba(92, 225, 230, 0.12), transparent 55%)",
        }}
      />
      <div className="container-page relative z-[1] grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-16">
        <div>
          <p className="credit text-flare">Founding Slate</p>
          <h2 className="mt-4 font-impact text-[clamp(2.25rem,6vw,4rem)] text-ivory">
            Building in public.
            <br />
            Title by title.
          </h2>
          <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-slate">
            Silver Spring Studios is a new company. We are not presenting an invented catalogue.
            Early partners help define the slate — and we intend to share the real record of that
            work as it happens.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col lg:items-stretch">
          <ButtonLink
            href="/submit?source=founding-slate&medium=home&campaign=founding-slate"
            variant="signal"
            size="lg"
          >
            Submit for Consideration
          </ButtonLink>
          <ButtonLink href="/our-approach#founding-slate" variant="secondary" size="lg">
            Follow the Slate
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
