export const SITE = {
  name: "Silver Spring Studios",
  tagline: "Independent Film Distribution",
  description:
    "Silver Spring Studios is an independent film distributor with a personal approach to packaging and releasing completed films for digital and streaming platforms.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://silverspringstudios.vercel.app",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "silverspringfilms@gmail.com",
  adminEmail:
    process.env.ADMIN_NOTIFICATION_EMAIL ?? "silverspringfilms@gmail.com",
  twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? "",
} as const;

/** Internal planning defaults for admin tools only — never surface as public price list. */
export const RELEASE_INVESTMENT = {
  posterDesign: 2000,
  trailerAndPublicity: 1500,
  total: 3500,
  filmmakerSharePercent: 60,
  studioSharePercent: 40,
} as const;

export const SUBMISSION_STATUSES = [
  "draft",
  "submitted",
  "initial_review",
  "screener_review",
  "needs_information",
  "meeting_requested",
  "declined",
  "offer_considered",
  "agreement_sent",
  "signed",
  "onboarding",
  "released",
  "archived",
] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  initial_review: "Initial Review",
  screener_review: "Screener Review",
  needs_information: "Needs Information",
  meeting_requested: "Meeting Requested",
  declined: "Declined",
  offer_considered: "Offer Considered",
  agreement_sent: "Agreement Sent",
  signed: "Signed",
  onboarding: "Onboarding",
  released: "Released",
  archived: "Archived",
};

export const GENRES = [
  "Horror",
  "Thriller",
  "Science Fiction",
  "Documentary",
  "Crime",
  "Dark Comedy",
  "Independent Drama",
  "Action",
  "Mystery",
  "Fantasy",
  "Coming of Age",
  "Psychological",
  "Experimental",
  "Other",
] as const;

export const FILM_FORMATS = [
  "feature",
  "documentary",
  "limited_series",
  "other",
] as const;

export const BUDGET_RANGES = [
  "Under $50,000",
  "$50,000 – $150,000",
  "$150,000 – $500,000",
  "$500,000 – $1,000,000",
  "$1,000,000 – $3,000,000",
  "Over $3,000,000",
  "Prefer not to say",
] as const;

export const SCORECARD_CRITERIA = [
  { key: "concept_hook", label: "Concept and hook" },
  { key: "execution", label: "Execution" },
  { key: "technical_quality", label: "Technical quality" },
  { key: "audience_clarity", label: "Audience clarity" },
  { key: "key_art_potential", label: "Key-art potential" },
  { key: "trailer_potential", label: "Trailer potential" },
  { key: "cast_subject_value", label: "Cast or subject value" },
  { key: "rights_readiness", label: "Rights readiness" },
  { key: "filmmaker_collaboration", label: "Filmmaker collaboration" },
  { key: "commercial_fit", label: "Commercial fit" },
] as const;

/** Categorical selectors — separate from the 0–10 scorecard. Never auto-decide acquisition. */
export const COMMERCIAL_OUTLOOK = [
  { value: "very_limited", label: "Very limited" },
  { value: "limited", label: "Limited" },
  { value: "uncertain", label: "Uncertain" },
  { value: "moderate", label: "Moderate" },
  { value: "strong", label: "Strong" },
] as const;

export const STRATEGIC_FIT = [
  { value: "poor", label: "Poor" },
  { value: "weak", label: "Weak" },
  { value: "possible", label: "Possible" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
] as const;

export const RIGHTS_READINESS_LEVELS = [
  { value: "not_ready", label: "Not ready" },
  { value: "significant_concerns", label: "Significant concerns" },
  { value: "more_information_required", label: "More information required" },
  { value: "mostly_ready", label: "Mostly ready" },
  { value: "ready", label: "Ready" },
] as const;

export const TECHNICAL_READINESS_LEVELS = [
  { value: "not_deliverable", label: "Not deliverable" },
  { value: "major_work_required", label: "Major work required" },
  { value: "moderate_work_required", label: "Moderate work required" },
  { value: "minor_work_required", label: "Minor work required" },
  { value: "ready", label: "Ready" },
] as const;

export type CommercialOutlook = (typeof COMMERCIAL_OUTLOOK)[number]["value"];
export type StrategicFit = (typeof STRATEGIC_FIT)[number]["value"];
export type RightsReadinessLevel = (typeof RIGHTS_READINESS_LEVELS)[number]["value"];
export type TechnicalReadiness = (typeof TECHNICAL_READINESS_LEVELS)[number]["value"];

export const EMAIL_TEMPLATE_SLUGS = [
  "submission_received",
  "additional_information_requested",
  "screener_password_problem",
  "meeting_requested",
  "still_under_consideration",
  "respectful_decline",
  "potential_offer_discussion",
  "agreement_sent",
  "project_accepted",
  "deliverables_requested",
] as const;

export type EmailTemplateSlug = (typeof EMAIL_TEMPLATE_SLUGS)[number];

export const INTERNAL_TAG_OPTIONS = [
  "horror",
  "thriller",
  "sci-fi",
  "documentary",
  "crime",
  "dark-comedy",
  "drama",
  "festival-buzz",
  "rights-risk",
  "strong-key-art",
  "needs-trailer",
  "canada",
  "us",
  "international",
  "follow-up-soon",
  "priority-review",
] as const;

export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15 MB
export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "text/vtt",
  "application/x-subrip", // .srt, sometimes reported with this MIME type
  "text/plain", // .srt is often reported as plain text by the OS/browser
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
] as const;

export const ALLOWED_UPLOAD_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".pdf",
  ".vtt",
  ".srt",
  ".docx",
] as const;

export interface StepMeta {
  key: "filmmaker" | "film" | "rights" | "materials" | "expectations" | "consent";
  name: string;
  shortLabel: string;
  /** A rough sense of length/effort for this section — never a time promise. */
  estimate: string;
}

export const STEP_META: readonly StepMeta[] = [
  {
    key: "filmmaker",
    name: "Filmmaker",
    shortLabel: "Filmmaker",
    estimate: "About 8 fields",
  },
  {
    key: "film",
    name: "Film",
    shortLabel: "Film",
    estimate: "Longer section — logline and synopsis",
  },
  {
    key: "rights",
    name: "Rights & History",
    shortLabel: "Rights",
    estimate: "About 10 fields",
  },
  {
    key: "materials",
    name: "Materials",
    shortLabel: "Materials",
    estimate: "A screener link, plus optional files",
  },
  {
    key: "expectations",
    name: "Expectations",
    shortLabel: "Expectations",
    estimate: "About 6 required fields — audience metrics optional",
  },
  {
    key: "consent",
    name: "Review & Consent",
    shortLabel: "Review",
    estimate: "A final read-through before sending",
  },
] as const;

export const NAV_LINKS = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/what-we-look-for", label: "What We Look For" },
  { href: "/filmmakers", label: "For Filmmakers" },
  { href: "/resources", label: "Resources" },
  { href: "/checklist", label: "Checklist" },
  { href: "/about", label: "About" },
  { href: "/our-approach", label: "Our Approach" },
  { href: "/contact", label: "Contact" },
] as const;

/** Matches public.outreach_lead_status in migration 004. */
export const OUTREACH_LEAD_STATUSES = [
  "discovered",
  "research_needed",
  "qualified",
  "contacted",
  "replied",
  "meeting",
  "invited_to_submit",
  "submitted",
  "not_interested",
  "follow_up_later",
  "disqualified",
] as const;

export type OutreachLeadStatus = (typeof OUTREACH_LEAD_STATUSES)[number];

export const OUTREACH_LEAD_STATUS_LABELS: Record<OutreachLeadStatus, string> = {
  discovered: "Discovered",
  research_needed: "Research Needed",
  qualified: "Qualified",
  contacted: "Contacted",
  replied: "Replied",
  meeting: "Meeting",
  invited_to_submit: "Invited to Submit",
  submitted: "Submitted",
  not_interested: "Not Interested",
  follow_up_later: "Follow Up Later",
  disqualified: "Disqualified",
};

export const OUTREACH_MESSAGE_STATUSES = [
  "draft",
  "pending_approval",
  "approved",
  "sent",
  "cancelled",
] as const;

export type OutreachMessageStatus = (typeof OUTREACH_MESSAGE_STATUSES)[number];

export const OUTREACH_MESSAGE_STATUS_LABELS: Record<OutreachMessageStatus, string> = {
  draft: "Draft",
  pending_approval: "Pending Approval",
  approved: "Approved",
  sent: "Sent",
  cancelled: "Cancelled",
};

export const PARTNER_TYPES = [
  { value: "festival", label: "Festival" },
  { value: "film_school", label: "Film school" },
  { value: "producer_org", label: "Producer organization" },
  { value: "genre_community", label: "Genre community" },
  { value: "other", label: "Other" },
] as const;
