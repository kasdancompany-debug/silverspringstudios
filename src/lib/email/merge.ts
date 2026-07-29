export interface EmailMergeFields {
  filmmaker_name: string;
  film_title: string;
  reference_number: string;
  custom_message: string;
}

/**
 * Fills `{{field}}` merge tags in a template string. Shared between the
 * server-side send action and the client-side live preview so what an
 * admin previews is exactly what gets sent.
 */
export function mergeEmailTemplate(text: string, fields: EmailMergeFields): string {
  return text
    .replaceAll("{{filmmaker_name}}", fields.filmmaker_name || "there")
    .replaceAll("{{film_title}}", fields.film_title || "your film")
    .replaceAll("{{reference_number}}", fields.reference_number || "—")
    .replaceAll("{{custom_message}}", fields.custom_message || "");
}
