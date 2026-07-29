import type {
  OutreachLeadStatus,
  OutreachMessageStatus,
  SubmissionStatus,
} from "@/lib/constants";

export type ProfileRole = "admin" | "reviewer" | "filmmaker";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: ProfileRole;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  reference_number: string;
  status: SubmissionStatus;
  draft_token: string | null;
  current_step: number;
  assigned_reviewer_id: string | null;
  internal_score: number | null;
  recommendation: string | null;
  estimated_revenue_low: number | null;
  estimated_revenue_base: number | null;
  estimated_revenue_high: number | null;
  proposed_investment_cap: number | null;
  key_concerns: string | null;
  required_follow_up: string | null;
  acquisition_decision: string | null;
  decline_reason: string | null;
  scorecard: Scorecard | null;
  honeypot: string | null;
  ip_hash: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  is_demo?: boolean;
  follow_up_date?: string | null;
  meeting_date?: string | null;
  last_contact_at?: string | null;
  next_action?: string | null;
  internal_tags?: string[];
  commercial_outlook?: string | null;
  strategic_fit?: string | null;
  rights_readiness_level?: string | null;
  technical_readiness?: string | null;
  offer_summary_draft?: string | null;
  economics?: ReleaseEconomics | null;
  referral_source?: string | null;
  referral_medium?: string | null;
  referral_campaign?: string | null;
  referral_festival?: string | null;
  referral_school?: string | null;
  referral_partner?: string | null;
  referral_referrer?: string | null;
  outreach_contact_id?: string | null;
  partner_slug?: string | null;
}

export interface ReleaseEconomics {
  expected_gross: number;
  platform_deductions: number;
  direct_expenses: number;
  release_investment: number;
  filmmaker_percent: number;
  studio_percent: number;
  case_low_gross?: number;
  case_base_gross?: number;
  case_high_gross?: number;
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  description: string | null;
  is_active: boolean;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scorecard {
  concept_hook: number;
  execution: number;
  technical_quality: number;
  audience_clarity: number;
  key_art_potential: number;
  trailer_potential: number;
  cast_subject_value: number;
  rights_readiness: number;
  filmmaker_collaboration: number;
  commercial_fit: number;
}

export interface SubmissionContact {
  id: string;
  submission_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  province_state: string | null;
  country: string | null;
  role_on_film: string | null;
  website: string | null;
  imdb_profile: string | null;
  how_heard: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFilm {
  id: string;
  submission_id: string;
  title: string;
  alternative_title: string | null;
  format: string | null;
  genre: string | null;
  secondary_genre: string | null;
  runtime_minutes: number | null;
  completion_year: number | null;
  country_of_origin: string | null;
  primary_language: string | null;
  subtitle_availability: string | null;
  logline: string | null;
  synopsis: string | null;
  director: string | null;
  producers: string | null;
  principal_cast: string | null;
  budget_range: string | null;
  notable_awards: string | null;
  festival_history: string | null;
  press_coverage: string | null;
  target_audience: string | null;
  comparable_films: string | null;
  audience_rationale: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionRights {
  id: string;
  submission_id: string;
  controls_rights: boolean | null;
  available_territories: string | null;
  rights_available: string | null;
  existing_agreements: string | null;
  previous_distributor: string | null;
  platform_availability: string | null;
  current_sales_agent: string | null;
  music_clearance_status: string | null;
  chain_of_title_status: string | null;
  union_guild_obligations: string | null;
  existing_debts_liens: string | null;
  rights_available_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionMaterials {
  id: string;
  submission_id: string;
  screener_url: string | null;
  screener_password: string | null;
  trailer_url: string | null;
  caption_availability: string | null;
  master_resolution: string | null;
  audio_configuration: string | null;
  prores_available: boolean | null;
  closed_caption_available: boolean | null;
  dialogue_list_available: boolean | null;
  music_cue_sheet_available: boolean | null;
  eo_insurance_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionExpectations {
  id: string;
  submission_id: string;
  primary_release_goal: string | null;
  most_important_territory: string | null;
  existing_audience_size: string | null;
  mailing_list_size: string | null;
  social_following: string | null;
  marketing_participation: string | null;
  desired_release_timing: string | null;
  revenue_expectations: string | null;
  partnership_success: string | null;
  additional_context: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionFile {
  id: string;
  submission_id: string;
  file_type: "poster" | "epk" | "still" | "other";
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
}

export interface SubmissionNote {
  id: string;
  submission_id: string;
  author_id: string | null;
  note: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubmissionStatusHistory {
  id: string;
  submission_id: string;
  from_status: SubmissionStatus | null;
  to_status: SubmissionStatus;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

export interface Film {
  id: string;
  submission_id: string | null;
  title: string;
  slug: string;
  status: string;
  synopsis: string | null;
  genre: string | null;
  runtime_minutes: number | null;
  release_year: number | null;
  filmmaker_profile_id: string | null;
  release_investment: number | null;
  recouped_amount: number | null;
  filmmaker_share_percent: number | null;
  studio_share_percent: number | null;
  created_at: string;
  updated_at: string;
}

export interface FilmRelease {
  id: string;
  film_id: string;
  platform: string;
  territory: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmRevenueStatement {
  id: string;
  film_id: string;
  period_start: string;
  period_end: string;
  gross_receipts: number;
  deductions: number;
  net_receipts: number;
  statement_date: string;
  notes: string | null;
  document_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmExpense {
  id: string;
  film_id: string;
  category: string;
  description: string;
  amount: number;
  is_recoupable: boolean;
  incurred_date: string | null;
  approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface FilmDocument {
  id: string;
  film_id: string;
  title: string;
  document_type: string;
  file_path: string;
  visible_to_filmmaker: boolean;
  created_at: string;
  updated_at: string;
}

export type FilmPaymentStatus = "pending" | "completed" | "failed" | "cancelled";

export interface FilmPayment {
  id: string;
  film_id: string;
  amount: number;
  currency: string;
  payment_type: string;
  payment_method: string | null;
  reference_number: string | null;
  payment_date: string;
  status: FilmPaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmUpdateItem {
  id: string;
  film_id: string;
  title: string;
  body: string;
  update_type: string;
  published_at: string | null;
  visible_to_filmmaker: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubmissionListItem {
  id: string;
  reference_number: string;
  status: SubmissionStatus;
  internal_score: number | null;
  submitted_at: string | null;
  created_at: string;
  assigned_reviewer_id: string | null;
  film_title: string | null;
  genre: string | null;
  runtime_minutes: number | null;
  completion_year: number | null;
  country_of_origin: string | null;
  budget_range: string | null;
  festival_history: string | null;
  filmmaker_name: string | null;
  filmmaker_email: string | null;
  reviewer_name: string | null;
  is_demo?: boolean;
  follow_up_date?: string | null;
  meeting_date?: string | null;
  commercial_outlook?: string | null;
  next_action?: string | null;
}

export type PartnerType = "festival" | "film_school" | "producer_org" | "genre_community" | "other";

export interface PartnerPage {
  id: string;
  slug: string;
  partner_name: string;
  partner_type: PartnerType | string;
  headline: string | null;
  introduction: string | null;
  seeking: string | null;
  submission_cta_label: string | null;
  resource_download_slug: string | null;
  contact_email: string | null;
  contact_note: string | null;
  tracking_source: string | null;
  tracking_medium: string | null;
  tracking_campaign: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Festival {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FilmSchool {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProducerOrganization {
  id: string;
  name: string;
  org_type: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachLead {
  id: string;
  filmmaker_name: string;
  film_title: string | null;
  email: string | null;
  website: string | null;
  festival: string | null;
  genre: string | null;
  completion_year: number | null;
  country: string | null;
  source_url: string | null;
  why_it_may_fit: string | null;
  personalized_note: string | null;
  status: OutreachLeadStatus;
  festival_id: string | null;
  film_school_id: string | null;
  producer_org_id: string | null;
  partner_slug: string | null;
  assigned_to: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
  submission_id: string | null;
  import_batch_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscoveredFilm {
  id: string;
  title: string;
  filmmaker_name: string | null;
  genre: string | null;
  completion_year: number | null;
  country: string | null;
  festival: string | null;
  source_url: string | null;
  notes: string | null;
  lead_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  description: string | null;
  partner_slug: string | null;
  festival_id: string | null;
  status: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachMessage {
  id: string;
  lead_id: string;
  campaign_id: string | null;
  subject: string;
  body: string;
  status: OutreachMessageStatus;
  approved_by: string | null;
  approved_at: string | null;
  sent_by: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface OutreachReply {
  id: string;
  lead_id: string;
  message_id: string | null;
  body: string;
  received_at: string;
  logged_by: string | null;
  created_at: string;
}

export interface OutreachFollowUp {
  id: string;
  lead_id: string;
  due_at: string;
  note: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
}
