import type { ReactNode } from "react";
import { AlertTriangle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  icon,
  tone = "neutral",
  className,
  children,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  tone?: "neutral" | "warning";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center border border-dashed border-line-strong bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <span className={cn("mb-4", tone === "warning" ? "text-warm-metal" : "text-slate")}>
        {icon ?? (tone === "warning" ? <AlertTriangle size={22} strokeWidth={1.5} /> : <Inbox size={22} strokeWidth={1.5} />)}
      </span>
      <p className="font-display text-xl text-ivory">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate">{description}</p>
      ) : null}
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}

export function ConfigNotice({ message }: { message?: string }) {
  return (
    <EmptyState
      tone="warning"
      title="Supabase is not configured"
      description={
        message ??
        "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in your environment to connect the admin dashboard to live data. This screen renders safely without them so you can demo the interface."
      }
    />
  );
}
