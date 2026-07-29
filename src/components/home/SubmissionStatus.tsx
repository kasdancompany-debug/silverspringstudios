/** Thin credit-style transition band between hero and model */
export function SubmissionStatus() {
  return (
    <div className="border-y border-line bg-surface/80">
      <div className="container-page flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between md:py-4">
        <p className="credit text-warm-metal">Acquisitions · Open Window</p>
        <p className="text-sm text-slate md:text-right">
          Completed features · Documentaries · Limited series — Canada, United States &
          English-language international productions
        </p>
      </div>
    </div>
  );
}
