import { format } from "date-fns";
import type { FilmPayment } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

const STATUS_STYLES: Record<FilmPayment["status"], string> = {
  pending: "border-line-strong text-slate",
  completed: "border-success/60 text-success",
  failed: "border-danger/60 text-danger",
  cancelled: "border-line-strong text-slate",
};

export function PaymentHistory({ payments }: { payments: FilmPayment[] }) {
  if (payments.length === 0) {
    return <p className="text-sm text-slate">No payments have been recorded for this film yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
            <th className="py-2.5 pr-4 font-normal">Date</th>
            <th className="py-2.5 pr-4 font-normal">Type</th>
            <th className="py-2.5 pr-4 font-normal">Amount</th>
            <th className="py-2.5 pr-4 font-normal">Method</th>
            <th className="py-2.5 pr-4 font-normal">Reference</th>
            <th className="py-2.5 pr-4 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment.id} className="border-b border-line last:border-b-0">
              <td className="py-2.5 pr-4 text-slate">{formatDate(payment.payment_date)}</td>
              <td className="py-2.5 pr-4 text-ivory">{payment.payment_type}</td>
              <td className="py-2.5 pr-4 text-slate">
                {formatCurrency(Number(payment.amount), payment.currency)}
              </td>
              <td className="py-2.5 pr-4 text-slate">{payment.payment_method ?? "—"}</td>
              <td className="py-2.5 pr-4 text-slate">{payment.reference_number ?? "—"}</td>
              <td className="py-2.5 pr-4">
                <span
                  className={`border px-2 py-0.5 text-[0.6rem] tracking-[0.08em] uppercase ${STATUS_STYLES[payment.status]}`}
                >
                  {payment.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
