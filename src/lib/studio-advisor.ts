/** Studio advisor defaults — public conversion path & operating promises. */
export const STUDIO_ADVISOR = {
  /** Educate first; submit after model/process. Better slate quality > form spam. */
  heroPrimaryCta: {
    href: "/#model",
    label: "Understand the Model",
  },
  heroSecondaryCta: {
    href: "/submit",
    label: "Submit Your Film",
  },
  /**
   * Operational aim only — not a guarantee. Keep staffing able to hit this.
   * Change here if capacity changes.
   */
  responseAimDays: 14,
  responseAimLabel: "We aim to respond within 14 days",
  deskLabel: "Acquisitions desk",
  deskBlurb:
    "Submissions are reviewed by people who can actually reply — not a black-hole portal. Selective by design.",
  /** Hot pink Neon signal stays — distinctive, fun, high-energy. */
  accent: "neon-pink",
} as const;
