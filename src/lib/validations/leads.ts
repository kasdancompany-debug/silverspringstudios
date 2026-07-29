import { z } from "zod";

const trimmedString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const honeypotField = z
  .string()
  .max(0, "Invalid submission.")
  .optional()
  .or(z.literal(""));

const emailField = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .max(320);

const requiredConsent = z.literal(true, {
  errorMap: () => ({
    message: "You must confirm this to continue.",
  }),
});

export const PRIMARY_ROLE_VALUES = [
  "Filmmaker",
  "Producer",
  "Director",
  "Festival programmer",
  "Student",
  "Other",
] as const;

export const FILM_STAGE_VALUES = [
  "Script/development",
  "In production",
  "Post-production",
  "Festival circuit",
  "Seeking distribution",
  "Previously released",
] as const;

export const GENRE_INTEREST_VALUES = [
  "Horror",
  "Thriller",
  "Documentary",
  "Drama",
  "Sci-Fi",
  "Other",
] as const;

export const newsletterSchema = z.object({
  firstName: trimmedString(1, 120, "First name"),
  email: emailField,
  primaryRole: z.enum(PRIMARY_ROLE_VALUES, {
    errorMap: () => ({ message: "Please select a primary role." }),
  }),
  filmStage: z.enum(FILM_STAGE_VALUES, {
    errorMap: () => ({ message: "Please select a film stage." }),
  }),
  genreInterest: z.enum(GENRE_INTEREST_VALUES, {
    errorMap: () => ({ message: "Please select a genre interest." }),
  }),
  consent: requiredConsent,
  honeypot: honeypotField,
  source: z.string().trim().max(120).optional(),
  partnerSlug: z.string().trim().max(120).optional(),
});

export const leadMagnetSchema = z.object({
  firstName: trimmedString(1, 120, "First name"),
  email: emailField,
  primaryRole: z.enum(PRIMARY_ROLE_VALUES, {
    errorMap: () => ({ message: "Please select a primary role." }),
  }),
  filmStage: z.enum(FILM_STAGE_VALUES, {
    errorMap: () => ({ message: "Please select a film stage." }),
  }),
  consent: requiredConsent,
  honeypot: honeypotField,
  resourceSlug: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) =>
      value && value.length > 0 ? value : "distribution-readiness-checklist",
    ),
  source: z.string().trim().max(120).optional(),
  partnerSlug: z.string().trim().max(120).optional(),
});

export type NewsletterInput = z.infer<typeof newsletterSchema>;
export type LeadMagnetInput = z.infer<typeof leadMagnetSchema>;
