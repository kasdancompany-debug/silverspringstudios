import { z } from "zod";
import {
  BUDGET_RANGES,
  FILM_FORMATS,
  SUBMISSION_STATUSES,
} from "@/lib/constants";

const currentYear = new Date().getFullYear();

const requiredCheckbox = z.literal(true, {
  errorMap: () => ({
    message: "You must confirm this to continue.",
  }),
});

const optionalUrl = z
  .union([z.string().url({ message: "Please enter a valid URL." }), z.literal("")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const optionalNonEmptyString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

export const filmmakerSchema = z.object({
  full_name: trimmedString(1, 200, "Full name"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(320),
  phone: optionalNonEmptyString.pipe(z.string().max(50).optional()),
  company: optionalNonEmptyString.pipe(z.string().max(200).optional()),
  city: trimmedString(1, 120, "City"),
  province_state: trimmedString(1, 120, "Province or state"),
  country: trimmedString(1, 120, "Country"),
  role_on_film: trimmedString(1, 200, "Role on film"),
  website: optionalUrl,
  imdb_profile: optionalUrl,
  how_heard: trimmedString(1, 500, "How you heard about us"),
});

export const filmSchema = z.object({
  title: trimmedString(1, 300, "Film title"),
  alternative_title: optionalNonEmptyString.pipe(z.string().max(300).optional()),
  format: z.enum(FILM_FORMATS, {
    errorMap: () => ({ message: "Please select a valid format." }),
  }),
  genre: trimmedString(1, 120, "Genre"),
  secondary_genre: optionalNonEmptyString.pipe(z.string().max(120).optional()),
  runtime_minutes: z
    .number({
      required_error: "Runtime is required.",
      invalid_type_error: "Runtime must be a number.",
    })
    .int("Runtime must be a whole number.")
    .positive("Runtime must be greater than zero."),
  completion_year: z
    .number({
      required_error: "Completion year is required.",
      invalid_type_error: "Completion year must be a number.",
    })
    .int("Completion year must be a whole number.")
    .min(1900, "Completion year must be 1900 or later.")
    .max(currentYear + 1, `Completion year cannot be later than ${currentYear + 1}.`),
  country_of_origin: trimmedString(1, 120, "Country of origin"),
  primary_language: trimmedString(1, 120, "Primary language"),
  subtitle_availability: trimmedString(1, 500, "Subtitle availability"),
  logline: trimmedString(1, 500, "Logline").max(
    500,
    "Logline must be 500 characters or fewer.",
  ),
  synopsis: trimmedString(1, 5000, "Synopsis").max(
    5000,
    "Synopsis must be 5,000 characters or fewer.",
  ),
  director: trimmedString(1, 500, "Director"),
  producers: trimmedString(1, 500, "Producers"),
  principal_cast: trimmedString(1, 1000, "Principal cast or subjects"),
  budget_range: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: "Please select a valid budget range." }),
  }),
  notable_awards: optionalNonEmptyString.pipe(z.string().max(2000).optional()),
  festival_history: optionalNonEmptyString.pipe(z.string().max(2000).optional()),
  press_coverage: optionalNonEmptyString.pipe(z.string().max(2000).optional()),
  target_audience: trimmedString(1, 1000, "Target audience"),
  comparable_films: optionalNonEmptyString.pipe(z.string().max(1000).optional()),
  audience_rationale: trimmedString(1, 2000, "Audience rationale"),
});

export const rightsSchema = z.object({
  controls_rights: z.boolean({
    required_error: "Please indicate whether you control the rights.",
    invalid_type_error: "Please indicate whether you control the rights.",
  }),
  available_territories: trimmedString(1, 1000, "Available territories"),
  rights_available: trimmedString(1, 1000, "Rights available"),
  existing_agreements: optionalNonEmptyString.pipe(z.string().max(2000).optional()),
  previous_distributor: optionalNonEmptyString.pipe(z.string().max(500).optional()),
  platform_availability: optionalNonEmptyString.pipe(z.string().max(1000).optional()),
  current_sales_agent: optionalNonEmptyString.pipe(z.string().max(500).optional()),
  music_clearance_status: trimmedString(1, 500, "Music clearance status"),
  chain_of_title_status: trimmedString(1, 500, "Chain of title status"),
  union_guild_obligations: optionalNonEmptyString.pipe(z.string().max(1000).optional()),
  existing_debts_liens: optionalNonEmptyString.pipe(z.string().max(1000).optional()),
  rights_available_date: optionalNonEmptyString.pipe(z.string().max(120).optional()),
});

export const materialsSchema = z.object({
  screener_url: z
    .string()
    .trim()
    .url("Please enter a valid screener URL."),
  screener_password: optionalNonEmptyString.pipe(z.string().max(200).optional()),
  trailer_url: optionalUrl,
  caption_availability: trimmedString(1, 500, "Caption availability"),
  master_resolution: optionalNonEmptyString.pipe(z.string().max(200).optional()),
  audio_configuration: optionalNonEmptyString.pipe(z.string().max(200).optional()),
  prores_available: z.boolean().optional(),
  closed_caption_available: z.boolean().optional(),
  dialogue_list_available: z.boolean().optional(),
  music_cue_sheet_available: z.boolean().optional(),
  eo_insurance_status: optionalNonEmptyString.pipe(z.string().max(500).optional()),
});

export const expectationsSchema = z.object({
  primary_release_goal: trimmedString(1, 1000, "Primary release goal"),
  most_important_territory: trimmedString(1, 500, "Most important territory"),
  existing_audience_size: optionalNonEmptyString.pipe(z.string().max(500).optional()),
  mailing_list_size: optionalNonEmptyString.pipe(z.string().max(500).optional()),
  social_following: optionalNonEmptyString.pipe(z.string().max(500).optional()),
  marketing_participation: trimmedString(1, 1000, "Marketing participation"),
  desired_release_timing: trimmedString(1, 500, "Desired release timing"),
  revenue_expectations: optionalNonEmptyString.pipe(z.string().max(1000).optional()),
  partnership_success: trimmedString(1, 2000, "Partnership success criteria"),
  additional_context: optionalNonEmptyString.pipe(z.string().max(3000).optional()),
});

export const consentSchema = z.object({
  no_agreement_created: requiredCheckbox,
  no_obligation_to_review: requiredCheckbox,
  authority_to_share: requiredCheckbox,
  similar_projects_may_exist: requiredCheckbox,
  no_confidentiality: requiredCheckbox,
  read_terms_privacy: requiredCheckbox,
  information_accurate: requiredCheckbox,
});

export const fullSubmissionSchema = z.object({
  filmmaker: filmmakerSchema,
  film: filmSchema,
  rights: rightsSchema,
  materials: materialsSchema,
  expectations: expectationsSchema,
  consent: consentSchema,
});

export const draftSubmissionSchema = z.object({
  filmmaker: filmmakerSchema.partial().optional(),
  film: filmSchema.partial().optional(),
  rights: rightsSchema.partial().optional(),
  materials: materialsSchema.partial().optional(),
  expectations: expectationsSchema.partial().optional(),
  consent: z
    .object({
      no_agreement_created: z.boolean().optional(),
      no_obligation_to_review: z.boolean().optional(),
      authority_to_share: z.boolean().optional(),
      similar_projects_may_exist: z.boolean().optional(),
      no_confidentiality: z.boolean().optional(),
      read_terms_privacy: z.boolean().optional(),
      information_accurate: z.boolean().optional(),
    })
    .optional(),
  current_step: z.number().int().min(1).max(6).optional(),
});

export const contactFormSchema = z.object({
  name: trimmedString(1, 200, "Name"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(320),
  subject: trimmedString(1, 300, "Subject"),
  message: trimmedString(10, 5000, "Message"),
  honeypot: z
    .string()
    .max(0, "Invalid submission.")
    .optional()
    .or(z.literal("")),
});

const scoreValue = z
  .number({
    required_error: "Score is required.",
    invalid_type_error: "Score must be a number.",
  })
  .int("Score must be a whole number.")
  .min(0, "Score must be between 0 and 10.")
  .max(10, "Score must be between 0 and 10.");

export const scorecardSchema = z.object({
  concept_hook: scoreValue,
  execution: scoreValue,
  technical_quality: scoreValue,
  audience_clarity: scoreValue,
  key_art_potential: scoreValue,
  trailer_potential: scoreValue,
  cast_subject_value: scoreValue,
  rights_readiness: scoreValue,
  filmmaker_collaboration: scoreValue,
  commercial_fit: scoreValue,
});

export const adminUpdateSchema = z
  .object({
    status: z.enum(SUBMISSION_STATUSES, {
      errorMap: () => ({ message: "Please select a valid status." }),
    }),
    assigned_reviewer_id: z.string().uuid().nullable().optional(),
    internal_score: z
      .number()
      .min(0, "Internal score must be between 0 and 100.")
      .max(100, "Internal score must be between 0 and 100.")
      .nullable()
      .optional(),
    recommendation: z.string().trim().max(2000).nullable().optional(),
    estimated_revenue_low: z.number().nonnegative().nullable().optional(),
    estimated_revenue_base: z.number().nonnegative().nullable().optional(),
    estimated_revenue_high: z.number().nonnegative().nullable().optional(),
    proposed_investment_cap: z.number().nonnegative().nullable().optional(),
    key_concerns: z.string().trim().max(5000).nullable().optional(),
    required_follow_up: z.string().trim().max(5000).nullable().optional(),
    acquisition_decision: z.string().trim().max(2000).nullable().optional(),
    decline_reason: z.string().trim().max(5000).nullable().optional(),
    scorecard: scorecardSchema.optional(),
    status_note: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => {
      if (data.status !== "declined") return true;
      return Boolean(data.decline_reason?.trim());
    },
    {
      message: "A decline reason is required when declining a submission.",
      path: ["decline_reason"],
    },
  );

export type FilmmakerInput = z.infer<typeof filmmakerSchema>;
export type FilmInput = z.infer<typeof filmSchema>;
export type RightsInput = z.infer<typeof rightsSchema>;
export type MaterialsInput = z.infer<typeof materialsSchema>;
export type ExpectationsInput = z.infer<typeof expectationsSchema>;
export type ConsentInput = z.infer<typeof consentSchema>;
export type FullSubmissionInput = z.infer<typeof fullSubmissionSchema>;
export type DraftSubmissionInput = z.infer<typeof draftSubmissionSchema>;
export type ContactFormInput = z.infer<typeof contactFormSchema>;
export type ScorecardInput = z.infer<typeof scorecardSchema>;
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>;
