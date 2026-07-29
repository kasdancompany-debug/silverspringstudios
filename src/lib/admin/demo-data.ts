import "server-only";

import { addDays, subDays } from "date-fns";
import { slugify } from "@/lib/utils";
import type {
  CommercialOutlook,
  RightsReadinessLevel,
  StrategicFit,
  SubmissionStatus,
  TechnicalReadiness,
} from "@/lib/constants";
import type {
  EmailTemplate,
  Film,
  ReleaseEconomics,
  Scorecard,
  Submission,
  SubmissionContact,
  SubmissionExpectations,
  SubmissionFile,
  SubmissionFilm,
  SubmissionMaterials,
  SubmissionNote,
  SubmissionRights,
  SubmissionStatusHistory,
} from "@/types/database";
import type {
  CountBucket,
  DashboardMetrics,
  EmailLogItem,
  FilmDetail,
  FilmListItem,
  FunnelReports,
  ReviewerOption,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListResult,
} from "@/lib/admin/data";

// ---------------------------------------------------------------------------
// Deterministic fixed ids — stable across renders/deploys so demo links
// (e.g. /admin/submissions/{id}) never change between requests.
// ---------------------------------------------------------------------------

const ENTITY_PREFIX = {
  submission: "de111111",
  contact: "de222222",
  film: "de333333",
  rights: "de444444",
  materials: "de555555",
  expectations: "de666666",
  note: "de777777",
  history: "de888888",
  filmRecord: "de999999",
  reviewer: "deaaaaaa",
  template: "debbbbbb",
} as const;

function mkId(entity: keyof typeof ENTITY_PREFIX, n: number, sub = 0): string {
  const suffix = (n * 100 + sub).toString().padStart(12, "0");
  return `${ENTITY_PREFIX[entity]}-0000-4000-8000-${suffix}`;
}

function iso(d: Date): string {
  return d.toISOString();
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// A fixed "now" per module load keeps the funnel dates internally
// consistent within a single server process without needing a database.
const NOW = new Date();

function daysAgo(n: number): Date {
  return subDays(NOW, n);
}

function inDays(n: number): Date {
  return addDays(NOW, n);
}

// ---------------------------------------------------------------------------
// Reviewers
// ---------------------------------------------------------------------------

export const DEMO_REVIEWERS: ReviewerOption[] = [
  { id: mkId("reviewer", 1), full_name: "Priya Anand", email: "priya.anand@ssp-demo.example" },
  { id: mkId("reviewer", 2), full_name: "Marcus Webb", email: "marcus.webb@ssp-demo.example" },
];

function reviewerName(n?: 1 | 2 | null): string | null {
  if (!n) return null;
  return DEMO_REVIEWERS[n - 1]?.full_name ?? null;
}

function reviewerId(n?: 1 | 2 | null): string | null {
  if (!n) return null;
  return DEMO_REVIEWERS[n - 1]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Scorecard helper
// ---------------------------------------------------------------------------

const CRITERIA_KEYS = [
  "concept_hook",
  "execution",
  "technical_quality",
  "audience_clarity",
  "key_art_potential",
  "trailer_potential",
  "cast_subject_value",
  "rights_readiness",
  "filmmaker_collaboration",
  "commercial_fit",
] as const;

function sc(values: number[]): Scorecard {
  const entries = CRITERIA_KEYS.map((key, i) => [key, values[i] ?? 5]);
  return Object.fromEntries(entries) as Scorecard;
}

function scoreTotal(scorecard: Scorecard | null | undefined): number | null {
  if (!scorecard) return null;
  return Object.values(scorecard).reduce((sum, value) => sum + value, 0);
}

// ---------------------------------------------------------------------------
// Seed definitions
// ---------------------------------------------------------------------------

interface HistoryStep {
  status: SubmissionStatus;
  daysAgo: number;
  note?: string;
  reviewer?: 1 | 2;
}

interface NoteSeed {
  text: string;
  daysAgo: number;
  reviewer?: 1 | 2;
  isInternal?: boolean;
}

interface Seed {
  n: number;
  refSuffix: string;
  status: SubmissionStatus;
  submittedDaysAgo: number;
  title: string;
  format: "feature" | "documentary" | "limited_series" | "other";
  genre: string;
  secondaryGenre?: string;
  runtime: number;
  year: number;
  country: string;
  language: string;
  budgetRange: string;
  logline: string;
  synopsis: string;
  director: string;
  producers: string;
  cast: string;
  festivalHistory?: string;
  notableAwards?: string;
  targetAudience: string;
  comparableFilms?: string;
  audienceRationale: string;
  filmmakerName: string;
  filmmakerEmail: string;
  filmmakerCity: string;
  filmmakerProvince: string;
  filmmakerCountry: string;
  filmmakerCompany?: string;
  roleOnFilm: string;
  howHeard: string;
  reviewer?: 1 | 2;
  scorecard?: Scorecard;
  recommendation?: string;
  estRevLow?: number;
  estRevBase?: number;
  estRevHigh?: number;
  investmentCap?: number;
  keyConcerns?: string;
  requiredFollowUp?: string;
  acquisitionDecision?: string;
  declineReason?: string;
  commercialOutlook?: CommercialOutlook;
  strategicFit?: StrategicFit;
  rightsReadiness?: RightsReadinessLevel;
  technicalReadiness?: TechnicalReadiness;
  internalTags?: string[];
  followUpInDays?: number;
  meetingInDays?: number;
  lastContactDaysAgo?: number;
  nextAction?: string;
  offerSummaryDraft?: string;
  economics?: ReleaseEconomics;
  screenerPasswordSet?: boolean;
  history: HistoryStep[];
  notes?: NoteSeed[];
  hasFilmRecord?: boolean;
}

const SEEDS: Seed[] = [
  {
    n: 1,
    refSuffix: "D00001",
    status: "submitted",
    submittedDaysAgo: 3,
    title: "The Hollow Orchard",
    format: "feature",
    genre: "Horror",
    runtime: 94,
    year: 2026,
    country: "Canada",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "A family inherits a failing orchard where the harvest asks for more than fruit.",
    synopsis:
      "After their estranged aunt's death, three siblings return to the family orchard to sell the land, only to discover the trees have kept a decades-old bargain alive — one that now expects payment from them.",
    director: "Renata Osei",
    producers: "Renata Osei, Colm Fitzgerald",
    cast: "Dana Whitfield, Samuel Achebe, Lior Nakamura",
    festivalHistory: "Submitted to Fantasia (pending)",
    targetAudience: "Genre audiences 18–34 who follow elevated horror",
    audienceRationale:
      "Strong pre-release social following from the director's prior short film, which screened at three genre festivals.",
    filmmakerName: "Renata Osei",
    filmmakerEmail: "renata.osei@hollow-orchard-demo.example",
    filmmakerCity: "Halifax",
    filmmakerProvince: "Nova Scotia",
    filmmakerCountry: "Canada",
    filmmakerCompany: "Salt Pine Pictures",
    roleOnFilm: "Director / Producer",
    howHeard: "Festival referral",
    internalTags: ["horror", "canada"],
    history: [{ status: "submitted", daysAgo: 3 }],
  },
  {
    n: 2,
    refSuffix: "D00002",
    status: "initial_review",
    submittedDaysAgo: 33,
    title: "Static Bloom",
    format: "feature",
    genre: "Science Fiction",
    runtime: 101,
    year: 2025,
    country: "United States",
    language: "English",
    budgetRange: "$500,000 – $1,000,000",
    logline: "A radio astronomer discovers a signal that only blooms flowers, not answers.",
    synopsis:
      "When a small-town radio observatory picks up a repeating signal that causes nearby plant life to grow at impossible speed, the scientist who found it must decide whether to report it before her funding — and her sanity — run out.",
    director: "Theo Marchetti",
    producers: "Ines Calloway",
    cast: "Josephine Reyes, Aaron Bell",
    targetAudience: "Adult science fiction audiences who favor ideas over spectacle",
    comparableFilms: "Arrival, Another Earth",
    audienceRationale: "Strong festival-circuit potential given the low-budget, high-concept execution.",
    filmmakerName: "Ines Calloway",
    filmmakerEmail: "ines.calloway@staticbloom-demo.example",
    filmmakerCity: "Albuquerque",
    filmmakerProvince: "New Mexico",
    filmmakerCountry: "United States",
    roleOnFilm: "Producer",
    howHeard: "Filmmaker Instagram ad",
    reviewer: 1,
    internalTags: ["sci-fi", "us"],
    history: [
      { status: "submitted", daysAgo: 33 },
      { status: "initial_review", daysAgo: 28, reviewer: 1 },
    ],
    notes: [
      {
        text: "Concept is strong; waiting on a working screener link before scheduling a full review.",
        daysAgo: 27,
        reviewer: 1,
      },
    ],
  },
  {
    n: 3,
    refSuffix: "D00003",
    status: "screener_review",
    submittedDaysAgo: 68,
    title: "Paper Saints",
    format: "documentary",
    genre: "Documentary",
    runtime: 82,
    year: 2025,
    country: "United Kingdom",
    language: "English",
    budgetRange: "$50,000 – $150,000",
    logline: "Three retired paper mill workers fight to turn their shuttered factory into a community archive.",
    synopsis:
      "Following the closure of a century-old paper mill, a small group of former workers spend two years converting the building into a public archive of the town's industrial history, clashing with developers along the way.",
    director: "Fiona Marsh",
    producers: "Fiona Marsh, Devon Okafor",
    cast: "Featuring Wendell Cross, Ida Pruitt, Marion Sato",
    festivalHistory: "Sheffield DocFest (official selection)",
    targetAudience: "Documentary audiences interested in labor history and community organizing",
    audienceRationale: "Festival laurel plus strong regional press coverage in the UK trade press.",
    filmmakerName: "Fiona Marsh",
    filmmakerEmail: "fiona.marsh@papersaints-demo.example",
    filmmakerCity: "Sheffield",
    filmmakerProvince: "South Yorkshire",
    filmmakerCountry: "United Kingdom",
    filmmakerCompany: "Marsh & Okafor Films",
    roleOnFilm: "Director",
    howHeard: "Recommended by a previously distributed filmmaker",
    reviewer: 1,
    scorecard: sc([6, 5, 6, 5, 6, 5, 6, 4, 6, 5]),
    recommendation: "Solid craft and a real festival laurel. Watching full screener before a final call.",
    commercialOutlook: "moderate",
    strategicFit: "good",
    rightsReadiness: "mostly_ready" as RightsReadinessLevel,
    internalTags: ["documentary", "festival-buzz"],
    history: [
      { status: "submitted", daysAgo: 68 },
      { status: "initial_review", daysAgo: 63, reviewer: 1 },
      { status: "screener_review", daysAgo: 58, reviewer: 1 },
    ],
    notes: [
      { text: "Festival laurel confirmed directly with Sheffield DocFest programming office.", daysAgo: 60, reviewer: 1 },
    ],
  },
  {
    n: 4,
    refSuffix: "D00004",
    status: "needs_information",
    submittedDaysAgo: 63,
    title: "Midnight Ledger",
    format: "feature",
    genre: "Crime",
    runtime: 108,
    year: 2025,
    country: "Canada",
    language: "English",
    budgetRange: "$1,000,000 – $3,000,000",
    logline: "A forensic accountant uncovers her own firm's ties to a decades-old disappearance.",
    synopsis:
      "When a routine audit turns up an account that shouldn't exist, an ambitious forensic accountant follows the money into a cold case her own mentor may have helped bury.",
    director: "Callum Rees",
    producers: "Callum Rees, Naomi Vetch",
    cast: "Priyanka Sethi, Grant Okafor, Belle Sorensen",
    targetAudience: "Adult crime-thriller audiences",
    audienceRationale: "Strong genre cast attachments and a marketable one-line hook.",
    filmmakerName: "Naomi Vetch",
    filmmakerEmail: "naomi.vetch@midnightledger-demo.example",
    filmmakerCity: "Toronto",
    filmmakerProvince: "Ontario",
    filmmakerCountry: "Canada",
    filmmakerCompany: "Vetch Media Group",
    roleOnFilm: "Producer",
    howHeard: "Google search",
    reviewer: 2,
    screenerPasswordSet: false,
    internalTags: ["crime", "canada", "follow-up-soon"],
    nextAction: "Waiting on a working screener password before continuing review.",
    followUpInDays: 5,
    lastContactDaysAgo: 12,
    history: [
      { status: "submitted", daysAgo: 63 },
      { status: "initial_review", daysAgo: 58, reviewer: 2 },
      {
        status: "needs_information",
        daysAgo: 53,
        reviewer: 2,
        note: "Screener password provided does not work; requested an updated private link.",
      },
    ],
    notes: [
      { text: "Emailed filmmaker twice about the screener password with no reply yet.", daysAgo: 12, reviewer: 2 },
    ],
  },
  {
    n: 5,
    refSuffix: "D00005",
    status: "meeting_requested",
    submittedDaysAgo: 93,
    title: "Salt and Static",
    format: "feature",
    genre: "Thriller",
    runtime: 97,
    year: 2025,
    country: "Australia",
    language: "English",
    budgetRange: "$500,000 – $1,000,000",
    logline: "A lighthouse keeper's final shift is interrupted by a survivor who isn't telling the whole story.",
    synopsis:
      "On her last night before the lighthouse is automated, a keeper pulls a shipwreck survivor from the rocks — and slowly realizes the woman's account of the wreck doesn't match what washed ashore.",
    director: "Willa Tran",
    producers: "Willa Tran, Desmond Okoye",
    cast: "Freya Lindqvist, Desmond Okoye",
    festivalHistory: "Melbourne Genre Nights (audience award)",
    targetAudience: "Adult thriller audiences who favor tense, character-driven stories",
    audienceRationale: "Audience award winner with strong word-of-mouth momentum coming off its festival run.",
    filmmakerName: "Willa Tran",
    filmmakerEmail: "willa.tran@saltandstatic-demo.example",
    filmmakerCity: "Hobart",
    filmmakerProvince: "Tasmania",
    filmmakerCountry: "Australia",
    roleOnFilm: "Director / Producer",
    howHeard: "Festival referral",
    reviewer: 1,
    scorecard: sc([8, 8, 7, 8, 8, 8, 7, 7, 8, 9]),
    recommendation: "One of the strongest submissions this quarter. Recommend prioritizing a call this week.",
    estRevLow: 40000,
    estRevBase: 90000,
    estRevHigh: 180000,
    investmentCap: 3500,
    commercialOutlook: "strong",
    strategicFit: "excellent",
    rightsReadiness: "ready" as RightsReadinessLevel,
    technicalReadiness: "ready" as TechnicalReadiness,
    internalTags: ["thriller", "festival-buzz", "priority-review"],
    meetingInDays: 4,
    nextAction: "Confirm meeting time and prep talking points on release timing.",
    lastContactDaysAgo: 6,
    history: [
      { status: "submitted", daysAgo: 93 },
      { status: "initial_review", daysAgo: 88, reviewer: 1 },
      { status: "screener_review", daysAgo: 82, reviewer: 1 },
      {
        status: "meeting_requested",
        daysAgo: 74,
        reviewer: 1,
        note: "Strong reviewer consensus — requesting an introductory call.",
      },
    ],
    notes: [
      { text: "Audience-award win independently verified via the festival's published results.", daysAgo: 80, reviewer: 1 },
      { text: "Filmmaker confirmed availability for a call next week.", daysAgo: 6, reviewer: 1 },
    ],
  },
  {
    n: 6,
    refSuffix: "D00006",
    status: "declined",
    submittedDaysAgo: 128,
    title: "The Quiet Machine",
    format: "feature",
    genre: "Dark Comedy",
    runtime: 89,
    year: 2025,
    country: "United States",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "An office worker automates his own job so thoroughly that no one notices he's stopped coming in.",
    synopsis:
      "A mid-level analyst spends a year quietly building scripts to automate his entire job, only to discover that vanishing from the company was easier than figuring out what to do with the life he got back.",
    director: "Priya Nandakumar",
    producers: "Priya Nandakumar",
    cast: "Owen Castellanos, Marisol Vance",
    targetAudience: "Adult comedy audiences who enjoy deadpan, workplace-satire humor",
    audienceRationale: "Niche but devoted festival audience for workplace satire in this vein.",
    filmmakerName: "Priya Nandakumar",
    filmmakerEmail: "priya.nandakumar@quietmachine-demo.example",
    filmmakerCity: "Austin",
    filmmakerProvince: "Texas",
    filmmakerCountry: "United States",
    roleOnFilm: "Director / Writer",
    howHeard: "Filmmaker Facebook group",
    reviewer: 2,
    scorecard: sc([4, 4, 5, 4, 3, 4, 4, 5, 4, 4]),
    recommendation: "Well-executed but a narrow audience for our current release slate.",
    keyConcerns: "Limited crossover appeal outside of a small workplace-satire niche.",
    acquisitionDecision: "Pass — slate capacity, not quality.",
    declineReason: "Not a fit for our current slate capacity.",
    commercialOutlook: "limited",
    strategicFit: "weak",
    internalTags: ["dark-comedy", "us"],
    history: [
      { status: "submitted", daysAgo: 128 },
      { status: "initial_review", daysAgo: 123, reviewer: 2 },
      { status: "screener_review", daysAgo: 118, reviewer: 2 },
      {
        status: "declined",
        daysAgo: 112,
        reviewer: 2,
        note: "Not a fit for our current slate capacity.",
      },
    ],
  },
  {
    n: 7,
    refSuffix: "D00007",
    status: "declined",
    submittedDaysAgo: 152,
    title: "Glass Orchard Revisited",
    format: "feature",
    genre: "Independent Drama",
    runtime: 112,
    year: 2024,
    country: "Ireland",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "A sculptor returns to her childhood glasshouse to finish the piece her late father never could.",
    synopsis:
      "Twenty years after leaving home, a sculptor inherits her father's overgrown glasshouse studio and, in restoring it, confronts the reasons she left in the first place.",
    director: "Aoife Lynch",
    producers: "Aoife Lynch, Tomas Bergeron",
    cast: "Saoirse Kavanagh, Tomas Bergeron",
    festivalHistory: "Galway Film Fleadh (official selection)",
    targetAudience: "Adult drama audiences who follow festival-circuit independent film",
    audienceRationale: "Festival selection but a crowded comparable-title landscape this year.",
    filmmakerName: "Aoife Lynch",
    filmmakerEmail: "aoife.lynch@glassorchard-demo.example",
    filmmakerCity: "Galway",
    filmmakerProvince: "County Galway",
    filmmakerCountry: "Ireland",
    roleOnFilm: "Director",
    howHeard: "Sales agent introduction",
    reviewer: 1,
    scorecard: sc([6, 6, 6, 6, 4, 5, 5, 2, 6, 4]),
    recommendation: "Strong craft, but the rights position is too unresolved to move forward right now.",
    keyConcerns: "Chain of title unresolved for archival footage used in the final act.",
    acquisitionDecision: "Pass — rights risk outweighs upside at this time.",
    declineReason: "Rights position too unresolved to proceed.",
    commercialOutlook: "uncertain",
    strategicFit: "possible",
    rightsReadiness: "significant_concerns" as RightsReadinessLevel,
    internalTags: ["drama", "rights-risk"],
    history: [
      { status: "submitted", daysAgo: 152 },
      { status: "initial_review", daysAgo: 147, reviewer: 1 },
      { status: "screener_review", daysAgo: 141, reviewer: 1 },
      {
        status: "declined",
        daysAgo: 130,
        reviewer: 1,
        note: "Rights position too unresolved to proceed.",
      },
    ],
    notes: [
      { text: "Archival footage clearance could not be confirmed after two follow-up requests.", daysAgo: 135, reviewer: 1 },
    ],
  },
  {
    n: 8,
    refSuffix: "D00008",
    status: "offer_considered",
    submittedDaysAgo: 96,
    title: "Nightshade Radio",
    format: "feature",
    genre: "Horror",
    secondaryGenre: "Thriller",
    runtime: 91,
    year: 2025,
    country: "Canada",
    language: "English",
    budgetRange: "$500,000 – $1,000,000",
    logline: "A late-night call-in horror show starts receiving calls from listeners who haven't happened yet.",
    synopsis:
      "The host of a struggling late-night radio horror anthology starts taking calls describing local deaths — hours before they occur — and has to decide whether to go public before the next one is her own show's guest.",
    director: "Marcus Delvecchio",
    producers: "Marcus Delvecchio, Simone Achterberg",
    cast: "Simone Achterberg, Kwame Osei, Della Fontaine",
    festivalHistory: "Toronto After Dark (official selection)",
    notableAwards: "Best Sound Design, Toronto After Dark",
    targetAudience: "Genre audiences 18–40 who follow horror anthologies and podcasts",
    comparableFilms: "Late Night with the Devil",
    audienceRationale: "Strong comparable-title performance and a built-in podcast-adjacent marketing hook.",
    filmmakerName: "Marcus Delvecchio",
    filmmakerEmail: "marcus.delvecchio@nightshaderadio-demo.example",
    filmmakerCity: "Vancouver",
    filmmakerProvince: "British Columbia",
    filmmakerCountry: "Canada",
    filmmakerCompany: "Nightshade Collective",
    roleOnFilm: "Director / Producer",
    howHeard: "Referred by another distributed filmmaker",
    reviewer: 1,
    scorecard: sc([8, 8, 8, 8, 9, 9, 7, 8, 8, 9]),
    recommendation: "Excellent commercial hooks (key art, trailer, comparable-title performance). Move to offer stage.",
    estRevLow: 60000,
    estRevBase: 140000,
    estRevHigh: 260000,
    investmentCap: 3500,
    keyConcerns: "None material — standard deliverables checklist outstanding.",
    acquisitionDecision: "Recommend an offer — pending internal sign-off on release-investment terms.",
    commercialOutlook: "strong",
    strategicFit: "excellent",
    rightsReadiness: "ready" as RightsReadinessLevel,
    technicalReadiness: "minor_work_required" as TechnicalReadiness,
    internalTags: ["horror", "canada", "strong-key-art", "priority-review"],
    lastContactDaysAgo: 9,
    nextAction: "Finalize internal release-economics model before drafting the offer summary.",
    offerSummaryDraft:
      "INTERNAL DRAFT — Nightshade Radio (SSP-2026-D00008)\n\nRecommendation: proceed to a release-investment offer at the standard $3,500 cap (poster + trailer/publicity), 60/40 filmmaker/studio split after recoupment.\n\nThis is an internal planning draft only. It is not an offer and creates no obligation until a written agreement is signed.",
    economics: {
      expected_gross: 140000,
      platform_deductions: 42000,
      direct_expenses: 9000,
      release_investment: 3500,
      filmmaker_percent: 60,
      studio_percent: 40,
      case_low_gross: 60000,
      case_base_gross: 140000,
      case_high_gross: 260000,
      notes: "Internal planning estimate only — not a promise to the filmmaker.",
    },
    history: [
      { status: "submitted", daysAgo: 96 },
      { status: "initial_review", daysAgo: 91, reviewer: 1 },
      { status: "screener_review", daysAgo: 85, reviewer: 1 },
      { status: "meeting_requested", daysAgo: 75, reviewer: 1 },
      {
        status: "offer_considered",
        daysAgo: 58,
        reviewer: 1,
        note: "Reviewing potential release-investment terms internally.",
      },
    ],
    notes: [
      { text: "Intro call went well — filmmaker is enthusiastic and has clean rights.", daysAgo: 74, reviewer: 1 },
      { text: "Drafting internal release-economics model before proposing terms.", daysAgo: 9, reviewer: 1 },
    ],
  },
  {
    n: 9,
    refSuffix: "D00009",
    status: "agreement_sent",
    submittedDaysAgo: 128,
    title: "Concrete Choir",
    format: "documentary",
    genre: "Documentary",
    runtime: 87,
    year: 2025,
    country: "United States",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "A youth choir in a converted parking garage prepares for a citywide competition no one thinks they can win.",
    synopsis:
      "Over one competition season, a volunteer-run youth choir rehearsing in a converted downtown parking garage works to qualify for the state finals, guided by a conductor determined to prove the venue was never the point.",
    director: "Talia Brennan",
    producers: "Talia Brennan, Marcus Webb",
    cast: "Featuring the Concrete Choir ensemble",
    festivalHistory: "Full Frame Documentary Festival (official selection)",
    targetAudience: "Documentary and music-adjacent audiences",
    audienceRationale: "Emotionally resonant hook with strong community and music-education partnership potential.",
    filmmakerName: "Talia Brennan",
    filmmakerEmail: "talia.brennan@concretechoir-demo.example",
    filmmakerCity: "Baltimore",
    filmmakerProvince: "Maryland",
    filmmakerCountry: "United States",
    filmmakerCompany: "Brennan Documentary Works",
    roleOnFilm: "Director / Producer",
    howHeard: "Contacted us directly via the submission form",
    reviewer: 2,
    scorecard: sc([8, 8, 7, 9, 7, 8, 8, 9, 9, 8]),
    recommendation: "Clean rights, festival laurel, and a marketable community-partnership angle. Agreement sent.",
    estRevLow: 30000,
    estRevBase: 70000,
    estRevHigh: 130000,
    investmentCap: 3500,
    acquisitionDecision: "Offer accepted internally — distribution agreement drafted and sent.",
    commercialOutlook: "moderate",
    strategicFit: "excellent",
    rightsReadiness: "ready" as RightsReadinessLevel,
    technicalReadiness: "ready" as TechnicalReadiness,
    internalTags: ["documentary", "us", "strong-key-art"],
    lastContactDaysAgo: 14,
    nextAction: "Follow up if the countersigned agreement hasn't arrived within two weeks.",
    followUpInDays: 3,
    offerSummaryDraft:
      "INTERNAL DRAFT — Concrete Choir (SSP-2026-D00009)\n\nDistribution agreement sent at the standard $3,500 release-investment cap, 60/40 filmmaker/studio split after recoupment. Awaiting countersignature.",
    economics: {
      expected_gross: 70000,
      platform_deductions: 21000,
      direct_expenses: 6000,
      release_investment: 3500,
      filmmaker_percent: 60,
      studio_percent: 40,
      case_low_gross: 30000,
      case_base_gross: 70000,
      case_high_gross: 130000,
      notes: "Internal planning estimate only — not a promise to the filmmaker.",
    },
    history: [
      { status: "submitted", daysAgo: 128 },
      { status: "initial_review", daysAgo: 123, reviewer: 2 },
      { status: "screener_review", daysAgo: 116, reviewer: 2 },
      { status: "meeting_requested", daysAgo: 104, reviewer: 2 },
      { status: "offer_considered", daysAgo: 88, reviewer: 2 },
      {
        status: "agreement_sent",
        daysAgo: 68,
        reviewer: 2,
        note: "Draft distribution agreement sent for review.",
      },
    ],
    notes: [{ text: "Filmmaker's counsel is reviewing the draft agreement.", daysAgo: 14, reviewer: 2 }],
  },
  {
    n: 10,
    refSuffix: "D00010",
    status: "signed",
    submittedDaysAgo: 188,
    title: "The Long Static",
    format: "feature",
    genre: "Science Fiction",
    runtime: 104,
    year: 2025,
    country: "Canada",
    language: "English",
    budgetRange: "$500,000 – $1,000,000",
    logline: "A satellite repair technician on a dying station has one orbit left to decide what's worth saving.",
    synopsis:
      "The last technician aboard a decommissioned relay station has one final orbit before re-entry burns it up, and must choose which of the station's dying archives — scientific, personal, or otherwise — she can transmit home in time.",
    director: "Elin Kowalczyk",
    producers: "Elin Kowalczyk, Priya Anand",
    cast: "Noor Haddad, Desmond Price",
    festivalHistory: "Fantasia International Film Festival (official selection)",
    notableAwards: "Best Cinematography, Fantasia",
    targetAudience: "Science fiction audiences who favor character-driven, contained stories",
    comparableFilms: "Silent Running, Moon",
    audienceRationale: "Award-winning cinematography and a tight, contained premise well suited to digital release.",
    filmmakerName: "Elin Kowalczyk",
    filmmakerEmail: "elin.kowalczyk@longstatic-demo.example",
    filmmakerCity: "Montreal",
    filmmakerProvince: "Quebec",
    filmmakerCountry: "Canada",
    filmmakerCompany: "Relay Station Films",
    roleOnFilm: "Director",
    howHeard: "Festival referral",
    reviewer: 1,
    scorecard: sc([9, 9, 9, 8, 9, 8, 7, 9, 9, 8]),
    recommendation: "Signed. Strong festival pedigree and clean rights made this an easy yes.",
    estRevLow: 50000,
    estRevBase: 110000,
    estRevHigh: 200000,
    investmentCap: 3500,
    acquisitionDecision: "Signed — proceeding to onboarding and release planning.",
    commercialOutlook: "strong",
    strategicFit: "excellent",
    rightsReadiness: "ready" as RightsReadinessLevel,
    technicalReadiness: "ready" as TechnicalReadiness,
    internalTags: ["sci-fi", "canada", "strong-key-art"],
    lastContactDaysAgo: 20,
    offerSummaryDraft:
      "INTERNAL DRAFT — The Long Static (SSP-2026-D00010)\n\nSigned at the standard $3,500 release-investment cap, 60/40 filmmaker/studio split after recoupment.",
    economics: {
      expected_gross: 110000,
      platform_deductions: 33000,
      direct_expenses: 7500,
      release_investment: 3500,
      filmmaker_percent: 60,
      studio_percent: 40,
      case_low_gross: 50000,
      case_base_gross: 110000,
      case_high_gross: 200000,
      notes: "Internal planning estimate only — not a promise to the filmmaker.",
    },
    history: [
      { status: "submitted", daysAgo: 188 },
      { status: "initial_review", daysAgo: 183, reviewer: 1 },
      { status: "screener_review", daysAgo: 176, reviewer: 1 },
      { status: "meeting_requested", daysAgo: 163, reviewer: 1 },
      { status: "offer_considered", daysAgo: 145, reviewer: 1 },
      { status: "agreement_sent", daysAgo: 124, reviewer: 1 },
      {
        status: "signed",
        daysAgo: 108,
        reviewer: 1,
        note: "Converted to film record.",
      },
    ],
    notes: [{ text: "Countersigned agreement received and filed.", daysAgo: 108, reviewer: 1 }],
    hasFilmRecord: true,
  },
  {
    n: 11,
    refSuffix: "D00011",
    status: "signed",
    submittedDaysAgo: 218,
    title: "Harvest Moon Confidential",
    format: "feature",
    genre: "Crime",
    runtime: 99,
    year: 2024,
    country: "United States",
    language: "English",
    budgetRange: "$1,000,000 – $3,000,000",
    logline: "A small-town insurance investigator uncovers a decade of staged farm accidents.",
    synopsis:
      "A methodical insurance investigator sent to close out a routine claim in a farming county starts noticing the same names attached to too many \"accidents\" over the past ten years.",
    director: "Beatrix Solano",
    producers: "Beatrix Solano, Marcus Webb",
    cast: "Retha James, Julian Oyelaran, Constance Ridley",
    festivalHistory: "Cinequest (official selection)",
    targetAudience: "Adult crime-drama audiences",
    audienceRationale: "Slow-burn procedural with a marketable ensemble cast and rural-noir hook.",
    filmmakerName: "Beatrix Solano",
    filmmakerEmail: "beatrix.solano@harvestmoon-demo.example",
    filmmakerCity: "Des Moines",
    filmmakerProvince: "Iowa",
    filmmakerCountry: "United States",
    filmmakerCompany: "Solano Pictures",
    roleOnFilm: "Director / Producer",
    howHeard: "Sales agent introduction",
    reviewer: 2,
    scorecard: sc([8, 8, 7, 8, 7, 7, 8, 8, 7, 8]),
    recommendation: "Signed. Ensemble cast and procedural hook made this a strong strategic fit.",
    estRevLow: 45000,
    estRevBase: 95000,
    estRevHigh: 170000,
    investmentCap: 3500,
    acquisitionDecision: "Signed — proceeding to onboarding and release planning.",
    commercialOutlook: "moderate",
    strategicFit: "good",
    rightsReadiness: "ready" as RightsReadinessLevel,
    technicalReadiness: "ready" as TechnicalReadiness,
    internalTags: ["crime", "us"],
    lastContactDaysAgo: 40,
    economics: {
      expected_gross: 95000,
      platform_deductions: 28500,
      direct_expenses: 8000,
      release_investment: 3500,
      filmmaker_percent: 60,
      studio_percent: 40,
      case_low_gross: 45000,
      case_base_gross: 95000,
      case_high_gross: 170000,
      notes: "Internal planning estimate only — not a promise to the filmmaker.",
    },
    history: [
      { status: "submitted", daysAgo: 218 },
      { status: "initial_review", daysAgo: 213, reviewer: 2 },
      { status: "screener_review", daysAgo: 205, reviewer: 2 },
      { status: "meeting_requested", daysAgo: 190, reviewer: 2 },
      { status: "offer_considered", daysAgo: 170, reviewer: 2 },
      { status: "agreement_sent", daysAgo: 150, reviewer: 2 },
      {
        status: "signed",
        daysAgo: 135,
        reviewer: 2,
        note: "Converted to film record.",
      },
    ],
    hasFilmRecord: true,
  },
  {
    n: 12,
    refSuffix: "D00012",
    status: "archived",
    submittedDaysAgo: 248,
    title: "Vacant Frequencies",
    format: "feature",
    genre: "Thriller",
    runtime: 93,
    year: 2024,
    country: "United Kingdom",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "A pirate-radio host stumbles onto a frequency used to coordinate a string of local disappearances.",
    synopsis:
      "A late-night pirate-radio host broadcasting from a converted shipping container discovers her open frequency is being used to pass coded messages tied to a string of unsolved disappearances.",
    director: "Rowan Ashby",
    producers: "Rowan Ashby",
    cast: "Nadia Okonjo, Felix Bramwell",
    targetAudience: "Adult thriller audiences",
    audienceRationale: "Decent premise but limited materials made evaluation difficult.",
    filmmakerName: "Rowan Ashby",
    filmmakerEmail: "rowan.ashby@vacantfrequencies-demo.example",
    filmmakerCity: "Bristol",
    filmmakerProvince: "England",
    filmmakerCountry: "United Kingdom",
    roleOnFilm: "Director / Producer",
    howHeard: "Google search",
    reviewer: 2,
    scorecard: sc([5, 5, 5, 5, 4, 5, 4, 5, 3, 4]),
    keyConcerns: "Filmmaker went unresponsive after two rounds of information requests.",
    internalTags: ["thriller", "international"],
    history: [
      { status: "submitted", daysAgo: 248 },
      { status: "initial_review", daysAgo: 243, reviewer: 2 },
      {
        status: "needs_information",
        daysAgo: 236,
        reviewer: 2,
        note: "Requested an updated screener link and rights summary.",
      },
      {
        status: "archived",
        daysAgo: 170,
        reviewer: 2,
        note: "No response after repeated follow-up attempts — archived.",
      },
    ],
    notes: [
      { text: "Third follow-up email sent with no response; archiving for now.", daysAgo: 170, reviewer: 2 },
    ],
  },
  {
    n: 13,
    refSuffix: "D00013",
    status: "submitted",
    submittedDaysAgo: 1,
    title: "Winter Ledger",
    format: "feature",
    genre: "Independent Drama",
    runtime: 106,
    year: 2026,
    country: "Canada",
    language: "English",
    budgetRange: "$150,000 – $500,000",
    logline: "A bookkeeper for a struggling ski town discovers the numbers don't add up to a future for anyone.",
    synopsis:
      "As a small ski-resort town's books stop balancing season after season, its longtime bookkeeper has to decide whether to blow the whistle on the resort's owners or find some way to keep the town's one employer alive.",
    director: "Colette Duguay",
    producers: "Colette Duguay, Étienne Roy",
    cast: "Margaux Sinclair, Étienne Roy",
    festivalHistory: "Submitted to TIFF (pending)",
    targetAudience: "Adult drama audiences interested in small-town economic stories",
    audienceRationale: "Timely economic-anxiety themes with a strong regional festival hook.",
    filmmakerName: "Colette Duguay",
    filmmakerEmail: "colette.duguay@winterledger-demo.example",
    filmmakerCity: "Quebec City",
    filmmakerProvince: "Quebec",
    filmmakerCountry: "Canada",
    roleOnFilm: "Director",
    howHeard: "Festival referral",
    internalTags: ["drama", "canada"],
    history: [{ status: "submitted", daysAgo: 1 }],
  },
  {
    n: 14,
    refSuffix: "D00014",
    status: "initial_review",
    submittedDaysAgo: 14,
    title: "The Salt Line",
    format: "documentary",
    genre: "Documentary",
    runtime: 78,
    year: 2026,
    country: "Mexico",
    language: "Spanish",
    budgetRange: "$50,000 – $150,000",
    logline: "Salt-flat workers in Baja California organize the first cooperative in the region's history.",
    synopsis:
      "Over one harvest season, a group of salt-flat workers in Baja California California Sur attempt to form the region's first worker-owned cooperative, negotiating with buyers who have controlled prices for generations.",
    director: "Renata Ibarra",
    producers: "Renata Ibarra",
    cast: "Featuring the Salinas de Guerrero Negro cooperative members",
    targetAudience: "Documentary audiences interested in labor and cooperative economics",
    audienceRationale: "Timely labor-organizing story with strong visual texture from the salt flats.",
    filmmakerName: "Renata Ibarra",
    filmmakerEmail: "renata.ibarra@saltline-demo.example",
    filmmakerCity: "Guerrero Negro",
    filmmakerProvince: "Baja California Sur",
    filmmakerCountry: "Mexico",
    roleOnFilm: "Director / Producer",
    howHeard: "Contacted us directly via the submission form",
    reviewer: 1,
    internalTags: ["documentary", "international"],
    history: [
      { status: "submitted", daysAgo: 14 },
      { status: "initial_review", daysAgo: 9, reviewer: 1 },
    ],
  },
  {
    n: 15,
    refSuffix: "D00015",
    status: "needs_information",
    submittedDaysAgo: 158,
    title: "Static Choir",
    format: "other",
    genre: "Other",
    secondaryGenre: "Dark Comedy",
    runtime: 85,
    year: 2025,
    country: "Canada",
    language: "English",
    budgetRange: "Prefer not to say",
    logline: "A struggling community radio station holds an on-air talent show to save itself from shutting down.",
    synopsis:
      "Facing its final month on air, a volunteer-run community radio station in a fading mill town holds a chaotic, low-budget on-air talent competition as a last-ditch fundraiser — and a strange kind of send-off.",
    director: "Jasper Kellerman",
    producers: "Jasper Kellerman",
    cast: "Featuring local station volunteers and residents",
    targetAudience: "Audiences who enjoy quirky, community-driven mockumentary-style stories",
    audienceRationale: "Charming premise, but materials have been difficult to evaluate so far.",
    filmmakerName: "Jasper Kellerman",
    filmmakerEmail: "jasper.kellerman@staticchoir-demo.example",
    filmmakerCity: "Sudbury",
    filmmakerProvince: "Ontario",
    filmmakerCountry: "Canada",
    roleOnFilm: "Director",
    howHeard: "Filmmaker Facebook group",
    reviewer: 1,
    scorecard: sc([5, 4, 4, 5, 4, 5, 5, 5, 5, 4]),
    screenerPasswordSet: false,
    internalTags: ["dark-comedy", "canada", "needs-trailer"],
    nextAction: "Confirm working screener credentials before continuing review.",
    followUpInDays: 7,
    history: [
      { status: "submitted", daysAgo: 158 },
      { status: "initial_review", daysAgo: 153, reviewer: 1 },
      {
        status: "needs_information",
        daysAgo: 148,
        reviewer: 1,
        note: "Screener password did not work; requested updated credentials.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Record assembly
// ---------------------------------------------------------------------------

interface AssembledRecord {
  submission: Submission;
  contact: SubmissionContact;
  film: SubmissionFilm;
  rights: SubmissionRights;
  materials: SubmissionMaterials;
  expectations: SubmissionExpectations;
  files: (SubmissionFile & { signedUrl: string | null })[];
  notes: (SubmissionNote & { author_name: string | null })[];
  statusHistory: (SubmissionStatusHistory & { changed_by_name: string | null })[];
}

function assemble(seed: Seed): AssembledRecord {
  const submissionId = mkId("submission", seed.n);
  const submittedAtDate = daysAgo(seed.submittedDaysAgo);
  const submittedAt = iso(submittedAtDate);
  const lastHistoryDaysAgo = seed.history[seed.history.length - 1]?.daysAgo ?? seed.submittedDaysAgo;
  const updatedAt = iso(daysAgo(lastHistoryDaysAgo));

  const submission: Submission = {
    id: submissionId,
    reference_number: `SSP-2026-${seed.refSuffix}`,
    status: seed.status,
    draft_token: null,
    current_step: 6,
    assigned_reviewer_id: reviewerId(seed.reviewer),
    internal_score: scoreTotal(seed.scorecard),
    recommendation: seed.recommendation ?? null,
    estimated_revenue_low: seed.estRevLow ?? null,
    estimated_revenue_base: seed.estRevBase ?? null,
    estimated_revenue_high: seed.estRevHigh ?? null,
    proposed_investment_cap: seed.investmentCap ?? null,
    key_concerns: seed.keyConcerns ?? null,
    required_follow_up: seed.requiredFollowUp ?? null,
    acquisition_decision: seed.acquisitionDecision ?? null,
    decline_reason: seed.declineReason ?? null,
    scorecard: seed.scorecard ?? null,
    honeypot: null,
    ip_hash: null,
    submitted_at: submittedAt,
    created_at: submittedAt,
    updated_at: updatedAt,
    is_demo: true,
    follow_up_date: seed.followUpInDays !== undefined ? isoDate(inDays(seed.followUpInDays)) : null,
    meeting_date: seed.meetingInDays !== undefined ? iso(inDays(seed.meetingInDays)) : null,
    last_contact_at: seed.lastContactDaysAgo !== undefined ? iso(daysAgo(seed.lastContactDaysAgo)) : null,
    next_action: seed.nextAction ?? null,
    internal_tags: seed.internalTags ?? [],
    commercial_outlook: seed.commercialOutlook ?? null,
    strategic_fit: seed.strategicFit ?? null,
    rights_readiness_level: seed.rightsReadiness ?? null,
    technical_readiness: seed.technicalReadiness ?? null,
    offer_summary_draft: seed.offerSummaryDraft ?? null,
    economics: seed.economics ?? null,
  };

  const contact: SubmissionContact = {
    id: mkId("contact", seed.n),
    submission_id: submissionId,
    full_name: seed.filmmakerName,
    email: seed.filmmakerEmail,
    phone: null,
    company: seed.filmmakerCompany ?? null,
    city: seed.filmmakerCity,
    province_state: seed.filmmakerProvince,
    country: seed.filmmakerCountry,
    role_on_film: seed.roleOnFilm,
    website: null,
    imdb_profile: null,
    how_heard: seed.howHeard,
    created_at: submittedAt,
    updated_at: submittedAt,
  };

  const film: SubmissionFilm = {
    id: mkId("film", seed.n),
    submission_id: submissionId,
    title: seed.title,
    alternative_title: null,
    format: seed.format,
    genre: seed.genre,
    secondary_genre: seed.secondaryGenre ?? null,
    runtime_minutes: seed.runtime,
    completion_year: seed.year,
    country_of_origin: seed.country,
    primary_language: seed.language,
    subtitle_availability: "English SDH available on request",
    logline: seed.logline,
    synopsis: seed.synopsis,
    director: seed.director,
    producers: seed.producers,
    principal_cast: seed.cast,
    budget_range: seed.budgetRange,
    notable_awards: seed.notableAwards ?? null,
    festival_history: seed.festivalHistory ?? null,
    press_coverage: null,
    target_audience: seed.targetAudience,
    comparable_films: seed.comparableFilms ?? null,
    audience_rationale: seed.audienceRationale,
    created_at: submittedAt,
    updated_at: submittedAt,
  };

  const rights: SubmissionRights = {
    id: mkId("rights", seed.n),
    submission_id: submissionId,
    controls_rights: true,
    available_territories: "Worldwide, excluding domestic theatrical",
    rights_available: "All digital, VOD and AVOD rights",
    existing_agreements: null,
    previous_distributor: null,
    platform_availability: "Not currently available on any platform",
    current_sales_agent: null,
    music_clearance_status:
      seed.status === "declined" && seed.declineReason?.toLowerCase().includes("rights")
        ? "Archival music clearance unresolved for one sequence"
        : "Fully cleared for worldwide digital distribution",
    chain_of_title_status: "Complete and available on request",
    union_guild_obligations: null,
    existing_debts_liens: null,
    rights_available_date: isoDate(submittedAtDate),
    created_at: submittedAt,
    updated_at: submittedAt,
  };

  const materials: SubmissionMaterials = {
    id: mkId("materials", seed.n),
    submission_id: submissionId,
    screener_url: `https://screeners.ssp-demo.example/${slugify(seed.title)}`,
    screener_password: seed.screenerPasswordSet === false ? null : "demo-access-2026",
    trailer_url: `https://vimeo.com/demo/${seed.refSuffix.toLowerCase()}`,
    caption_availability: "English closed captions included",
    master_resolution: "1920x1080 ProRes 422 HQ",
    audio_configuration: "5.1 surround + stereo mix",
    prores_available: true,
    closed_caption_available: true,
    dialogue_list_available: true,
    music_cue_sheet_available: seed.n % 2 === 0,
    eo_insurance_status: "Bound through principal photography wrap",
    created_at: submittedAt,
    updated_at: submittedAt,
  };

  const expectations: SubmissionExpectations = {
    id: mkId("expectations", seed.n),
    submission_id: submissionId,
    primary_release_goal: "Broad digital and VOD release with festival-driven publicity",
    most_important_territory: `${seed.country} and United States`,
    existing_audience_size: "5,000–10,000 combined social followers",
    mailing_list_size: "1,200 subscribers",
    social_following: "8,400 across Instagram and TikTok",
    marketing_participation: "Available for interviews, social content and virtual Q&As",
    desired_release_timing: "Within 6–9 months of signing",
    revenue_expectations: null,
    partnership_success: "A wide release that reaches genre audiences beyond the festival circuit",
    additional_context: null,
    created_at: submittedAt,
    updated_at: submittedAt,
  };

  const notes = (seed.notes ?? []).map((note, index) => ({
    id: mkId("note", seed.n, index + 1),
    submission_id: submissionId,
    author_id: reviewerId(note.reviewer),
    note: note.text,
    is_internal: note.isInternal ?? true,
    created_at: iso(daysAgo(note.daysAgo)),
    updated_at: iso(daysAgo(note.daysAgo)),
    author_name: reviewerName(note.reviewer) ?? "System",
  }));

  const statusHistory = seed.history.map((step, index) => ({
    id: mkId("history", seed.n, index + 1),
    submission_id: submissionId,
    from_status: index === 0 ? null : seed.history[index - 1].status,
    to_status: step.status,
    changed_by: reviewerId(step.reviewer),
    note: step.note ?? null,
    created_at: iso(daysAgo(step.daysAgo)),
    changed_by_name: reviewerName(step.reviewer),
  }));

  // Most-recent-first, matching the ordering used by the live Supabase query.
  statusHistory.reverse();

  return {
    submission,
    contact,
    film,
    rights,
    materials,
    expectations,
    files: [],
    notes: notes.sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    statusHistory,
  };
}

const DEMO_RECORDS: AssembledRecord[] = SEEDS.map(assemble);

const DEMO_RECORDS_BY_ID = new Map(DEMO_RECORDS.map((record) => [record.submission.id, record]));

// ---------------------------------------------------------------------------
// Demo films (for submissions marked hasFilmRecord)
// ---------------------------------------------------------------------------

const DEMO_FILMS: Film[] = SEEDS.filter((seed) => seed.hasFilmRecord).map((seed) => {
  const record = DEMO_RECORDS_BY_ID.get(mkId("submission", seed.n))!;
  return {
    id: mkId("filmRecord", seed.n),
    submission_id: record.submission.id,
    title: record.film.title,
    slug: slugify(record.film.title),
    status: "signed",
    synopsis: record.film.synopsis,
    genre: record.film.genre,
    runtime_minutes: record.film.runtime_minutes,
    release_year: record.film.completion_year,
    filmmaker_profile_id: null,
    release_investment: record.submission.proposed_investment_cap ?? 3500,
    recouped_amount: 0,
    filmmaker_share_percent: record.submission.economics?.filmmaker_percent ?? 60,
    studio_share_percent: record.submission.economics?.studio_percent ?? 40,
    created_at: record.submission.updated_at,
    updated_at: record.submission.updated_at,
  };
});

const DEMO_FILMS_BY_SUBMISSION = new Map(DEMO_FILMS.map((film) => [film.submission_id, film]));

// ---------------------------------------------------------------------------
// Public helpers — list / detail / metrics / reports / films
// ---------------------------------------------------------------------------

function toListItem(record: AssembledRecord): import("@/types/database").SubmissionListItem {
  const { submission, contact, film } = record;
  return {
    id: submission.id,
    reference_number: submission.reference_number,
    status: submission.status,
    internal_score: submission.internal_score,
    submitted_at: submission.submitted_at,
    created_at: submission.created_at,
    assigned_reviewer_id: submission.assigned_reviewer_id,
    film_title: film.title,
    genre: film.genre,
    runtime_minutes: film.runtime_minutes,
    completion_year: film.completion_year,
    country_of_origin: film.country_of_origin,
    budget_range: film.budget_range,
    festival_history: film.festival_history,
    filmmaker_name: contact.full_name,
    filmmaker_email: contact.email,
    reviewer_name: reviewerName(
      submission.assigned_reviewer_id
        ? (DEMO_REVIEWERS.findIndex((r) => r.id === submission.assigned_reviewer_id) + 1 as 1 | 2)
        : undefined,
    ),
    is_demo: true,
    follow_up_date: submission.follow_up_date ?? null,
    meeting_date: submission.meeting_date ?? null,
    commercial_outlook: submission.commercial_outlook ?? null,
    next_action: submission.next_action ?? null,
  };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : 1;
  if (b === null || b === undefined) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b));
}

export function getDemoSubmissionsList(filters: SubmissionListFilters = {}): SubmissionListResult {
  let items = DEMO_RECORDS.map(toListItem);

  const countries = Array.from(
    new Set(items.map((item) => item.country_of_origin).filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));

  if (filters.status && filters.status !== "all") {
    items = items.filter((item) => item.status === filters.status);
  }
  if (filters.genre && filters.genre !== "all") {
    items = items.filter((item) => item.genre === filters.genre);
  }
  if (filters.country && filters.country !== "all") {
    items = items.filter((item) => item.country_of_origin === filters.country);
  }
  if (filters.dateFrom) {
    items = items.filter((item) => (item.submitted_at ?? item.created_at) >= `${filters.dateFrom}T00:00:00`);
  }
  if (filters.dateTo) {
    items = items.filter((item) => (item.submitted_at ?? item.created_at) <= `${filters.dateTo}T23:59:59`);
  }
  if (filters.search) {
    const needle = filters.search.trim().toLowerCase();
    if (needle) {
      items = items.filter((item) =>
        [item.reference_number, item.film_title, item.filmmaker_name, item.filmmaker_email]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(needle)),
      );
    }
  }

  const sortBy = filters.sortBy ?? "submitted_at";
  const dir = filters.sortDir === "asc" ? 1 : -1;
  items = [...items].sort((a, b) => {
    switch (sortBy) {
      case "internal_score":
        return compareValues(a.internal_score, b.internal_score) * dir;
      case "created_at":
        return compareValues(a.created_at, b.created_at) * dir;
      case "film_title":
        return compareValues(a.film_title, b.film_title) * dir;
      case "status":
        return compareValues(a.status, b.status) * dir;
      case "submitted_at":
      default:
        return compareValues(a.submitted_at ?? a.created_at, b.submitted_at ?? b.created_at) * dir;
    }
  });

  const total = items.length;
  const pageSize = filters.pageSize ?? 25;
  const page = Math.max(1, filters.page ?? 1);
  const start = (page - 1) * pageSize;
  const paged = items.slice(start, start + pageSize);

  return { items: paged, total, countries };
}

export function getDemoSubmissionDetail(id: string): SubmissionDetail | null {
  const record = DEMO_RECORDS_BY_ID.get(id);
  if (!record) return null;

  const reviewerIdx = record.submission.assigned_reviewer_id
    ? DEMO_REVIEWERS.findIndex((r) => r.id === record.submission.assigned_reviewer_id) + 1
    : 0;

  return {
    submission: record.submission,
    contact: record.contact,
    film: record.film,
    rights: record.rights,
    materials: record.materials,
    expectations: record.expectations,
    files: record.files,
    notes: record.notes,
    statusHistory: record.statusHistory,
    reviewerName: reviewerIdx ? reviewerName(reviewerIdx as 1 | 2) : null,
  };
}

export function getDemoReviewers(): ReviewerOption[] {
  return DEMO_REVIEWERS;
}

export function getDemoDashboardMetrics(): DashboardMetrics {
  const byStatus = (status: SubmissionStatus) =>
    DEMO_RECORDS.filter((record) => record.submission.status === status).length;

  const reviewDiffsMs: number[] = [];
  for (const record of DEMO_RECORDS) {
    const submittedStep = record.statusHistory.find((h) => h.to_status === "submitted");
    const nextStep = record.statusHistory.find((h) => h.from_status === "submitted");
    if (submittedStep && nextStep) {
      const diff = new Date(nextStep.created_at).getTime() - new Date(submittedStep.created_at).getTime();
      if (diff > 0) reviewDiffsMs.push(diff);
    }
  }

  let averageResponseTimeLabel = "Not enough data yet";
  if (reviewDiffsMs.length) {
    const avgMs = reviewDiffsMs.reduce((sum, value) => sum + value, 0) / reviewDiffsMs.length;
    const avgDays = avgMs / (1000 * 60 * 60 * 24);
    averageResponseTimeLabel =
      avgDays < 1 ? `${Math.max(1, Math.round(avgMs / (1000 * 60 * 60)))} hrs` : `${avgDays.toFixed(1)} days`;
  }

  return {
    newSubmissions: byStatus("submitted"),
    awaitingScreenerReview: byStatus("screener_review"),
    needsInformation: byStatus("needs_information"),
    meetingsRequested: byStatus("meeting_requested"),
    offersUnderConsideration: byStatus("offer_considered"),
    signedTitles: byStatus("signed"),
    declinedTitles: byStatus("declined"),
    averageResponseTimeLabel,
    averageResponseTimeSampleSize: reviewDiffsMs.length,
    hasDemoData: true,
  };
}

function bucketAndSort(counts: Map<string, number>, limit = 12): CountBucket[] {
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function monthLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function getDemoFunnelReports(): FunnelReports {
  const REACHED_MEETING: SubmissionStatus[] = [
    "meeting_requested",
    "offer_considered",
    "agreement_sent",
    "signed",
    "onboarding",
    "released",
  ];
  const REACHED_AGREEMENT: SubmissionStatus[] = ["agreement_sent", "signed", "onboarding", "released"];
  const ACTIVE_PIPELINE: SubmissionStatus[] = [
    "submitted",
    "initial_review",
    "screener_review",
    "needs_information",
    "meeting_requested",
    "offer_considered",
    "agreement_sent",
  ];

  const byMonth = new Map<string, number>();
  const bySource = new Map<string, number>();
  const byGenre = new Map<string, number>();
  const byCountry = new Map<string, number>();
  const declineReasons = new Map<string, number>();
  const byReviewer = new Map<string, number>();

  let meetingOrLater = 0;
  let agreementOrLater = 0;
  let signedCount = 0;
  let declinedCount = 0;
  let projectedExposure = 0;

  for (const record of DEMO_RECORDS) {
    const { submission, film, contact } = record;

    const monthKey = monthLabel(submission.submitted_at ?? submission.created_at);
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + 1);

    const source = contact.how_heard?.trim() || "Not provided";
    bySource.set(source, (bySource.get(source) ?? 0) + 1);

    const genre = film.genre?.trim() || "Unspecified";
    byGenre.set(genre, (byGenre.get(genre) ?? 0) + 1);

    const country = film.country_of_origin?.trim() || "Unspecified";
    byCountry.set(country, (byCountry.get(country) ?? 0) + 1);

    if (submission.status === "declined") {
      declinedCount += 1;
      const reason = submission.decline_reason?.trim() || "No reason on file";
      declineReasons.set(reason, (declineReasons.get(reason) ?? 0) + 1);
    }

    if (["signed", "onboarding", "released"].includes(submission.status)) {
      signedCount += 1;
      const reviewerIdx = submission.assigned_reviewer_id
        ? DEMO_REVIEWERS.findIndex((r) => r.id === submission.assigned_reviewer_id) + 1
        : 0;
      const name = (reviewerIdx ? reviewerName(reviewerIdx as 1 | 2) : null) ?? "Unassigned";
      byReviewer.set(name, (byReviewer.get(name) ?? 0) + 1);
    }

    if (REACHED_MEETING.includes(submission.status)) meetingOrLater += 1;
    if (REACHED_AGREEMENT.includes(submission.status)) agreementOrLater += 1;

    if (ACTIVE_PIPELINE.includes(submission.status)) {
      projectedExposure += submission.proposed_investment_cap ?? submission.economics?.release_investment ?? 0;
    }
  }

  const totalSubmissions = DEMO_RECORDS.length;
  const decisionedCount = signedCount + declinedCount;
  const acceptanceRate = decisionedCount > 0 ? signedCount / decisionedCount : 0;

  const monthsSorted = Array.from(byMonth.entries())
    .map(([label, count]) => ({ label, count, sortKey: new Date(label).getTime() || 0 }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .slice(-12)
    .map(({ label, count }) => ({ label, count }));

  return {
    isDemoData: true,
    totalSubmissions,
    submissionsByMonth: monthsSorted,
    submissionsBySource: bucketAndSort(bySource),
    submissionsByGenre: bucketAndSort(byGenre),
    submissionsByCountry: bucketAndSort(byCountry),
    acceptanceRate,
    decisionedCount,
    avgReviewTimeLabel: getDemoDashboardMetrics().averageResponseTimeLabel,
    declineReasons: bucketAndSort(declineReasons),
    meetingConversionRate: totalSubmissions > 0 ? meetingOrLater / totalSubmissions : 0,
    agreementConversionRate: totalSubmissions > 0 ? agreementOrLater / totalSubmissions : 0,
    acquisitionsByReviewer: bucketAndSort(byReviewer),
    projectedInvestmentExposure: projectedExposure,
  };
}

export function getDemoFilms(): FilmListItem[] {
  return DEMO_FILMS.map((film) => ({ ...film, filmmaker_name: null }));
}

export function getDemoFilmDetail(id: string): FilmDetail | null {
  const film = DEMO_FILMS.find((f) => f.id === id);
  if (!film) return null;

  return {
    film,
    filmmakerName: null,
    releases: [],
    revenueStatements: [],
    expenses: [],
    documents: [],
    payments: [],
    updates: [],
  };
}

export function getDemoFilmBySubmissionId(submissionId: string): Film | null {
  return DEMO_FILMS_BY_SUBMISSION.get(submissionId) ?? null;
}

export function getDemoEmailLog(): EmailLogItem[] {
  return [];
}

// ---------------------------------------------------------------------------
// Email templates (mirrors the seed rows in
// supabase/migrations/003_acquisitions_dashboard.sql so demo mode and a
// freshly-migrated database show identical copy).
// ---------------------------------------------------------------------------

interface TemplateSeed {
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  body_text: string;
  description: string;
}

const TEMPLATE_SEEDS: TemplateSeed[] = [
  {
    slug: "submission_received",
    name: "Submission received",
    subject: "We received {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>Thank you for submitting <em>{{film_title}}</em> to Silver Spring Studios. We have received your materials and added them to our review queue.</p><p><strong>Reference:</strong> {{reference_number}}</p><p>Receiving this submission does not create a distribution agreement or obligation on either side.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nThank you for submitting "{{film_title}}" to Silver Spring Studios. We have received your materials and added them to our review queue.\n\nReference: {{reference_number}}\n\nReceiving this submission does not create a distribution agreement or obligation on either side.\n\nWarm regards,\nSilver Spring Studios',
    description: "Acknowledge receipt after triage begins.",
  },
  {
    slug: "additional_information_requested",
    name: "Additional information requested",
    subject: "Additional information needed — {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>Thank you again for submitting <em>{{film_title}}</em>. To continue our evaluation, we need a few additional items:</p><p>{{custom_message}}</p><p>Please reply to this email with the materials or clarifications when you can.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nThank you again for submitting "{{film_title}}". To continue our evaluation, we need a few additional items:\n\n{{custom_message}}\n\nPlease reply to this email with the materials or clarifications when you can.\n\nWarm regards,\nSilver Spring Studios',
    description: "Request missing materials or clarifications.",
  },
  {
    slug: "screener_password_problem",
    name: "Screener-password problem",
    subject: "Screener access issue — {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>We are reviewing <em>{{film_title}}</em>, but we are currently unable to access the private screener with the credentials provided.</p><p>{{custom_message}}</p><p>Could you please confirm the current screener link and password (or send an updated private link)?</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nWe are reviewing "{{film_title}}", but we are currently unable to access the private screener with the credentials provided.\n\n{{custom_message}}\n\nCould you please confirm the current screener link and password (or send an updated private link)?\n\nWarm regards,\nSilver Spring Studios',
    description: "Resolve screener access issues without exposing the password in the template body.",
  },
  {
    slug: "meeting_requested",
    name: "Meeting requested",
    subject: "Conversation request — {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>We have reviewed <em>{{film_title}}</em> and would like to schedule a direct conversation about expectations, strategy and possible next steps.</p><p>{{custom_message}}</p><p>Please reply with a few times that work for you over the coming days.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nWe have reviewed "{{film_title}}" and would like to schedule a direct conversation about expectations, strategy and possible next steps.\n\n{{custom_message}}\n\nPlease reply with a few times that work for you over the coming days.\n\nWarm regards,\nSilver Spring Studios',
    description: "Invite a discussion without implying acceptance.",
  },
  {
    slug: "still_under_consideration",
    name: "Still under consideration",
    subject: "Update on {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>A brief update: <em>{{film_title}}</em> remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.</p><p>{{custom_message}}</p><p>We will follow up when we have a clearer next step. Thank you for your patience.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nA brief update: "{{film_title}}" remains under consideration. Our team is still evaluating materials, rights position and potential fit with our slate.\n\n{{custom_message}}\n\nWe will follow up when we have a clearer next step. Thank you for your patience.\n\nWarm regards,\nSilver Spring Studios',
    description: "Courteous status update while review continues.",
  },
  {
    slug: "respectful_decline",
    name: "Respectful decline",
    subject: "Decision on {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>Thank you again for trusting us with <em>{{film_title}}</em>. After careful consideration, we will not be moving forward with distribution at this time.</p><p>{{custom_message}}</p><p>This decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nThank you again for trusting us with "{{film_title}}". After careful consideration, we will not be moving forward with distribution at this time.\n\n{{custom_message}}\n\nThis decision reflects our current slate capacity and priorities, not a judgment on the value of your work. We appreciate the opportunity to consider the film.\n\nWarm regards,\nSilver Spring Studios',
    description: "Clear, respectful decline with no false hope.",
  },
  {
    slug: "potential_offer_discussion",
    name: "Potential offer discussion",
    subject: "Next steps for {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>Following our review of <em>{{film_title}}</em>, we would like to discuss a possible distribution relationship and what a release partnership could look like.</p><p>{{custom_message}}</p><p>This conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nFollowing our review of "{{film_title}}", we would like to discuss a possible distribution relationship and what a release partnership could look like.\n\n{{custom_message}}\n\nThis conversation is exploratory. No offer is final until a written distribution agreement is reviewed and signed by both sides.\n\nWarm regards,\nSilver Spring Studios',
    description: "Open an offer conversation carefully — no guarantees.",
  },
  {
    slug: "agreement_sent",
    name: "Agreement sent",
    subject: "Distribution agreement for {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>Please find the draft distribution agreement for <em>{{film_title}}</em>. We encourage you to review it carefully, ideally with counsel.</p><p>{{custom_message}}</p><p>No release work begins until the agreement is signed by both parties.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nPlease find the draft distribution agreement for "{{film_title}}". We encourage you to review it carefully, ideally with counsel.\n\n{{custom_message}}\n\nNo release work begins until the agreement is signed by both parties.\n\nWarm regards,\nSilver Spring Studios',
    description: "Notify that a written agreement has been shared.",
  },
  {
    slug: "project_accepted",
    name: "Project accepted",
    subject: "Welcome — {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>We are pleased to confirm that we will move forward with <em>{{film_title}}</em> under the signed distribution agreement.</p><p>{{custom_message}}</p><p>Our next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nWe are pleased to confirm that we will move forward with "{{film_title}}" under the signed distribution agreement.\n\n{{custom_message}}\n\nOur next step is onboarding and release planning. We will be in touch shortly with deliverables and timeline details.\n\nWarm regards,\nSilver Spring Studios',
    description: "Confirm acceptance only after signature.",
  },
  {
    slug: "deliverables_requested",
    name: "Deliverables requested",
    subject: "Deliverables for {{film_title}} ({{reference_number}})",
    body_html:
      "<p>Dear {{filmmaker_name}},</p><p>To prepare the release for <em>{{film_title}}</em>, please provide the following deliverables:</p><p>{{custom_message}}</p><p>Reply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.</p><p>Warm regards,<br/>Silver Spring Studios</p>",
    body_text:
      'Dear {{filmmaker_name}},\n\nTo prepare the release for "{{film_title}}", please provide the following deliverables:\n\n{{custom_message}}\n\nReply to this email or use the shared folder instructions we send separately. Thank you for your collaboration.\n\nWarm regards,\nSilver Spring Studios',
    description: "Request post-agreement technical and publicity deliverables.",
  },
];

const DEMO_TIMESTAMP = iso(daysAgo(120));

export function getDemoEmailTemplates(): EmailTemplate[] {
  return TEMPLATE_SEEDS.map((seed, index) => ({
    id: mkId("template", index + 1),
    slug: seed.slug,
    name: seed.name,
    subject: seed.subject,
    body_html: seed.body_html,
    body_text: seed.body_text,
    description: seed.description,
    is_active: true,
    updated_by: null,
    created_at: DEMO_TIMESTAMP,
    updated_at: DEMO_TIMESTAMP,
  }));
}
