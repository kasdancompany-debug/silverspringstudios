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
    "We review completed features for digital and streaming release — packaging first, platforms second, no theatrical fantasy.",
  positioning: {
    channel: "streaming and digital platforms",
    promise: "A finished film should look intentional on the platforms where people actually watch.",
  },
} as const;
