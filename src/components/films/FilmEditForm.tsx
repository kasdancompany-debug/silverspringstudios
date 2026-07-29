"use client";

import { useState, useTransition } from "react";
import { updateFilmData } from "@/lib/actions/admin";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { Film } from "@/types/database";

const FILM_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "in_production", label: "In Production" },
  { value: "released", label: "Released" },
  { value: "on_hold", label: "On Hold" },
  { value: "archived", label: "Archived" },
];

function numberOrEmpty(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export function FilmEditForm({ film }: { film: Film }) {
  const [status, setStatus] = useState(film.status);
  const [synopsis, setSynopsis] = useState(film.synopsis ?? "");
  const [releaseInvestment, setReleaseInvestment] = useState(numberOrEmpty(film.release_investment));
  const [recoupedAmount, setRecoupedAmount] = useState(numberOrEmpty(film.recouped_amount));
  const [filmmakerShare, setFilmmakerShare] = useState(numberOrEmpty(film.filmmaker_share_percent));
  const [studioShare, setStudioShare] = useState(numberOrEmpty(film.studio_share_percent));
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFeedback(null);

    startTransition(async () => {
      const result = await updateFilmData(film.id, {
        status,
        synopsis: synopsis.trim() || null,
        release_investment: releaseInvestment ? Number(releaseInvestment) : null,
        recouped_amount: recoupedAmount ? Number(recoupedAmount) : null,
        filmmaker_share_percent: filmmakerShare ? Number(filmmakerShare) : null,
        studio_share_percent: studioShare ? Number(studioShare) : null,
      });

      setFeedback(
        result.success
          ? { type: "success", message: "Film updated." }
          : { type: "error", message: result.message ?? "Unable to update film." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={FILM_STATUS_OPTIONS}
        />
        <Input
          label="Release Investment"
          type="number"
          min={0}
          value={releaseInvestment}
          onChange={(event) => setReleaseInvestment(event.target.value)}
        />
        <Input
          label="Recouped Amount"
          type="number"
          min={0}
          value={recoupedAmount}
          onChange={(event) => setRecoupedAmount(event.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Filmmaker Share %"
            type="number"
            min={0}
            max={100}
            value={filmmakerShare}
            onChange={(event) => setFilmmakerShare(event.target.value)}
          />
          <Input
            label="Studio Share %"
            type="number"
            min={0}
            max={100}
            value={studioShare}
            onChange={(event) => setStudioShare(event.target.value)}
          />
        </div>
      </div>
      <Textarea label="Synopsis" rows={4} value={synopsis} onChange={(event) => setSynopsis(event.target.value)} />

      {feedback ? (
        <p className={feedback.type === "success" ? "text-sm text-success" : "text-sm text-danger"} role="status">
          {feedback.message}
        </p>
      ) : null}

      <Button type="submit" size="sm" variant="secondary" disabled={isPending}>
        {isPending ? "Saving…" : "Save Film Details"}
      </Button>
    </form>
  );
}
