import type { Metadata } from "next";
import { getEmailTemplates } from "@/lib/admin/data";
import { ConfigNotice, EmptyState } from "@/components/admin/EmptyState";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

export const metadata: Metadata = { title: "Email Templates" };
export const dynamic = "force-dynamic";

export default async function AdminTemplatesPage() {
  const { data: templates, configured, error } = await getEmailTemplates();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-[0.2em] text-warm-metal uppercase">Communication</p>
        <h1 className="mt-2 font-display text-3xl text-ivory md:text-4xl">Email Templates</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          The ten operational templates used from a submission&apos;s Templates panel. Editing here changes
          what every reviewer sends — emails are still only ever sent by an explicit, individual click.
        </p>
      </div>

      {!configured ? (
        <ConfigNotice />
      ) : error ? (
        <EmptyState tone="warning" title="Templates are unavailable" description={error} />
      ) : (
        <EmailTemplateEditor templates={templates} />
      )}
    </div>
  );
}
