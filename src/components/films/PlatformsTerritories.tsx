import { format } from "date-fns";
import type { FilmRelease } from "@/types/database";

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function PlatformsTerritories({ releases }: { releases: FilmRelease[] }) {
  if (releases.length === 0) {
    return (
      <p className="text-sm text-slate">
        No platform or territory records yet. Once a release plan is entered, it will be listed here.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
            <th className="py-2.5 pr-4 font-normal">Platform</th>
            <th className="py-2.5 pr-4 font-normal">Territory</th>
            <th className="py-2.5 pr-4 font-normal">Status</th>
            <th className="py-2.5 pr-4 font-normal">Start</th>
            <th className="py-2.5 pr-4 font-normal">End</th>
          </tr>
        </thead>
        <tbody>
          {releases.map((release) => (
            <tr key={release.id} className="border-b border-line last:border-b-0">
              <td className="py-2.5 pr-4 text-ivory">{release.platform}</td>
              <td className="py-2.5 pr-4 text-slate">{release.territory}</td>
              <td className="py-2.5 pr-4">
                <span className="border border-line-strong px-2 py-0.5 text-[0.6rem] tracking-[0.08em] text-slate uppercase">
                  {release.status}
                </span>
              </td>
              <td className="py-2.5 pr-4 text-slate">{formatDate(release.start_date)}</td>
              <td className="py-2.5 pr-4 text-slate">{formatDate(release.end_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
