import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { FilmRevenueStatement } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function RevenueStatements({ statements }: { statements: FilmRevenueStatement[] }) {
  if (statements.length === 0) {
    return (
      <p className="text-sm text-slate">
        No revenue statements have been recorded yet. Statements will appear here once distribution
        revenue begins.
      </p>
    );
  }

  const totalNet = statements.reduce((sum, statement) => sum + Number(statement.net_receipts ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
              <th className="py-2.5 pr-4 font-normal">Period</th>
              <th className="py-2.5 pr-4 font-normal">Gross Receipts</th>
              <th className="py-2.5 pr-4 font-normal">Deductions</th>
              <th className="py-2.5 pr-4 font-normal">Net Receipts</th>
              <th className="py-2.5 pr-4 font-normal">Statement Date</th>
              <th className="py-2.5 pr-4 font-normal">Document</th>
            </tr>
          </thead>
          <tbody>
            {statements.map((statement) => (
              <tr key={statement.id} className="border-b border-line last:border-b-0">
                <td className="py-2.5 pr-4 text-ivory">
                  {formatDate(statement.period_start)} – {formatDate(statement.period_end)}
                </td>
                <td className="py-2.5 pr-4 text-slate">{formatCurrency(Number(statement.gross_receipts))}</td>
                <td className="py-2.5 pr-4 text-slate">{formatCurrency(Number(statement.deductions))}</td>
                <td className="py-2.5 pr-4 text-ivory">{formatCurrency(Number(statement.net_receipts))}</td>
                <td className="py-2.5 pr-4 text-slate">{formatDate(statement.statement_date)}</td>
                <td className="py-2.5 pr-4">
                  {statement.document_path ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-warm-metal">
                      <ExternalLink size={12} strokeWidth={1.75} /> On file
                    </span>
                  ) : (
                    <span className="text-xs text-slate/60">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate">
        Total net receipts to date: <span className="text-ivory">{formatCurrency(totalNet)}</span>
      </p>
    </div>
  );
}
