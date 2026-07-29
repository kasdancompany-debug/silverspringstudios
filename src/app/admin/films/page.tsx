import type { Metadata } from "next";
import Link from "next/link";
import { getFilms } from "@/lib/admin/data";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Films" };
export const dynamic = "force-dynamic";

export default async function AdminFilmsPage() {
  const { data: films, configured, error } = await getFilms();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Signed Titles</p>
        <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Films</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Titles that have moved from acquisitions into distribution. Each film has its own portal
          preview covering release status, revenue and recoupment.
        </p>
      </div>

      {!configured ? (
        <ConfigNotice />
      ) : error ? (
        <EmptyState tone="warning" title="Films are unavailable" description={error} />
      ) : films.length === 0 ? (
        <EmptyState
          title="No signed films yet"
          description="Once a submission is marked signed and a film record is created, it will appear here."
        />
      ) : (
        <div className="overflow-x-auto border border-line-strong bg-surface">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line-strong text-[0.65rem] tracking-[0.1em] text-slate uppercase">
                <th className="px-4 py-3 font-normal">Title</th>
                <th className="px-4 py-3 font-normal">Genre</th>
                <th className="px-4 py-3 font-normal">Status</th>
                <th className="px-4 py-3 font-normal">Release Year</th>
                <th className="px-4 py-3 font-normal">Filmmaker</th>
                <th className="px-4 py-3 font-normal">Investment</th>
                <th className="px-4 py-3 font-normal">Recouped</th>
              </tr>
            </thead>
            <tbody>
              {films.map((film) => (
                <tr key={film.id} className="border-b border-line last:border-b-0 hover:bg-ivory/5">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/films/${film.id}`}
                      className="font-display text-base text-ivory no-underline hover:text-warm-metal"
                    >
                      {film.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate">{film.genre ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="border border-line-strong px-2.5 py-1 text-[0.65rem] tracking-[0.08em] text-slate uppercase">
                      {film.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate">{film.release_year ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">{film.filmmaker_name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">
                    {film.release_investment !== null ? formatCurrency(film.release_investment) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate">{formatCurrency(film.recouped_amount ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
