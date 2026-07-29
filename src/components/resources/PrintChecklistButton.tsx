"use client";

export function PrintChecklistButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={
        className ??
        "border border-warm-metal/60 bg-transparent px-4 py-2 text-xs tracking-[0.14em] uppercase text-warm-metal transition-colors hover:border-warm-metal hover:text-ivory"
      }
    >
      Print / Save PDF
    </button>
  );
}
