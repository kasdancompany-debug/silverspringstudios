import type { Metadata } from "next";
import { OutreachCsvImport } from "@/components/admin/OutreachCsvImport";

export const metadata: Metadata = { title: "Outreach CSV Import" };
export const dynamic = "force-dynamic";

export default function AdminOutreachImportPage() {
  return <OutreachCsvImport />;
}
