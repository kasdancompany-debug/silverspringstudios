const STATEMENTS = [
  "No upfront release invoice",
  "Investment recouped from film receipts",
  "Selective partnerships",
  "Transparent economics",
  "Completed features",
  "Founding slate in progress",
];

export function StatementMarquee() {
  const loop = [...STATEMENTS, ...STATEMENTS];

  return (
    <section
      aria-label="Studio principles"
      className="overflow-hidden border-y border-line bg-void py-4 md:py-5"
    >
      <div className="flex w-max marquee-track">
        {loop.map((text, i) => (
          <span
            key={`${text}-${i}`}
            className="mx-6 inline-flex items-center gap-6 whitespace-nowrap font-impact text-2xl tracking-[0.06em] text-ivory/90 md:mx-10 md:text-3xl"
          >
            {text}
            <span className="text-signal" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
