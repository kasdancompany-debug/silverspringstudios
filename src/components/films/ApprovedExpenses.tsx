import { format } from "date-fns";
import type { FilmExpense } from "@/types/database";
import { formatCurrency } from "@/lib/utils";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function ApprovedExpenses({ expenses }: { expenses: FilmExpense[] }) {
  if (expenses.length === 0) {
    return <p className="text-sm text-slate">No release expenses have been logged for this title yet.</p>;
  }

  const totalRecoupable = expenses
    .filter((expense) => expense.is_recoupable)
    .reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
              <th className="py-2.5 pr-4 font-normal">Category</th>
              <th className="py-2.5 pr-4 font-normal">Description</th>
              <th className="py-2.5 pr-4 font-normal">Amount</th>
              <th className="py-2.5 pr-4 font-normal">Recoupable</th>
              <th className="py-2.5 pr-4 font-normal">Approved</th>
              <th className="py-2.5 pr-4 font-normal">Incurred</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b border-line last:border-b-0">
                <td className="py-2.5 pr-4 text-ivory">{expense.category}</td>
                <td className="py-2.5 pr-4 text-slate">{expense.description}</td>
                <td className="py-2.5 pr-4 text-slate">{formatCurrency(Number(expense.amount))}</td>
                <td className="py-2.5 pr-4 text-slate">{expense.is_recoupable ? "Yes" : "No"}</td>
                <td className="py-2.5 pr-4">
                  <span
                    className={`border px-2 py-0.5 text-[0.6rem] tracking-[0.08em] uppercase ${
                      expense.approved ? "border-success/60 text-success" : "border-line-strong text-slate"
                    }`}
                  >
                    {expense.approved ? "Approved" : "Pending"}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-slate">{formatDate(expense.incurred_date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate">
        Total recoupable expenses: <span className="text-ivory">{formatCurrency(totalRecoupable)}</span>
      </p>
    </div>
  );
}
