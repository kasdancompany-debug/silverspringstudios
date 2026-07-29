import { formatCurrency } from "@/lib/utils";
import type { Film } from "@/types/database";

export function RecoupmentSummary({ film }: { film: Film }) {
  const investment = Number(film.release_investment ?? 0);
  const recouped = Number(film.recouped_amount ?? 0);
  const balance = investment - recouped;
  const percent = investment > 0 ? Math.min(100, Math.round((recouped / investment) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Release Investment</p>
          <p className="mt-1 font-display text-2xl text-ivory">{formatCurrency(investment)}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Recouped to Date</p>
          <p className="mt-1 font-display text-2xl text-success">{formatCurrency(recouped)}</p>
        </div>
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Remaining Balance</p>
          <p className={`mt-1 font-display text-2xl ${balance > 0 ? "text-warm-metal" : "text-success"}`}>
            {formatCurrency(Math.max(balance, 0))}
          </p>
        </div>
      </div>

      {investment > 0 ? (
        <div>
          <div className="h-2 w-full overflow-hidden bg-ink">
            <div
              className="h-full bg-forest-soft transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate">{percent}% recouped</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 border-t border-line pt-5">
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Filmmaker Share</p>
          <p className="mt-1 text-sm text-ivory">
            {film.filmmaker_share_percent !== null ? `${film.filmmaker_share_percent}%` : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs tracking-[0.08em] text-slate uppercase">Studio Share</p>
          <p className="mt-1 text-sm text-ivory">
            {film.studio_share_percent !== null ? `${film.studio_share_percent}%` : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
