import type { OutreachLeadStatus } from "@/lib/constants";
import type {
  OutreachFollowUp,
  OutreachLead,
  OutreachMessage,
  OutreachReply,
} from "@/types/database";

const now = "2026-07-20T15:00:00.000Z";

export const DEMO_OUTREACH_LEADS: OutreachLead[] = [
  {
    id: "demo-lead-01",
    filmmaker_name: "Maya Chen",
    film_title: "Saltwater Static",
    email: "maya.chen@example.com",
    website: "https://mayachen.example",
    festival: "Midnight Circuit",
    genre: "Horror",
    completion_year: 2025,
    country: "Canada",
    source_url: "https://midnightcircuit.example/films/saltwater-static",
    why_it_may_fit:
      "Tight runtime horror with a clear hook and Canadian rights control. Festival audience responded well to the trailer cut.",
    personalized_note:
      "Maya — Saltwater Static stood out at Midnight Circuit for its cold coastal dread and disciplined runtime. If you are exploring digital release, we would welcome a screener conversation.",
    status: "qualified",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: "midnight-circuit",
    assigned_to: null,
    next_follow_up_at: "2026-08-05",
    last_contacted_at: null,
    submission_id: null,
    import_batch_id: "demo-batch-a",
    created_at: "2026-06-01T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-02",
    filmmaker_name: "Jonas Berg",
    film_title: "Freight",
    email: "jonas.berg@example.com",
    website: null,
    festival: "Toronto Independent",
    genre: "Thriller",
    completion_year: 2024,
    country: "Canada",
    source_url: "https://tiff.example/freight",
    why_it_may_fit: "Contained thriller with strong nocturnal photography; producer org referral.",
    personalized_note: "Jonas — Freight’s night-shift pressure feels built for digital discovery.",
    status: "contacted",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: "prairie-producers-collective",
    assigned_to: null,
    next_follow_up_at: "2026-07-30",
    last_contacted_at: "2026-07-10T18:00:00.000Z",
    submission_id: null,
    import_batch_id: "demo-batch-a",
    created_at: "2026-05-12T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-03",
    filmmaker_name: "Aisha Okonkwo",
    film_title: "After the Signal",
    email: "aisha.okonkwo@example.com",
    website: "https://aishaokonkwo.example",
    festival: null,
    genre: "Science Fiction",
    completion_year: 2025,
    country: "United States",
    source_url: "https://coldopen.example/after-the-signal",
    why_it_may_fit: "Lo-fi sci-fi with a distinct visual language; Cold Open community mention.",
    personalized_note: null,
    status: "research_needed",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: "cold-open-horror",
    assigned_to: null,
    next_follow_up_at: null,
    last_contacted_at: null,
    submission_id: null,
    import_batch_id: null,
    created_at: "2026-07-01T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-04",
    filmmaker_name: "Elena Varga",
    film_title: "Glass Orchard",
    email: "elena.varga@example.com",
    website: null,
    festival: "Northern Lens Showcase",
    genre: "Independent Drama",
    completion_year: 2026,
    country: "Canada",
    source_url: null,
    why_it_may_fit: "Thesis feature with faculty endorsement; rights appear clean.",
    personalized_note:
      "Elena — congratulations on the Northern Lens showcase. When your master and captions are lined up, we would be glad to review Glass Orchard.",
    status: "invited_to_submit",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: "northern-lens-film-school",
    assigned_to: null,
    next_follow_up_at: "2026-08-15",
    last_contacted_at: "2026-07-18T14:00:00.000Z",
    submission_id: null,
    import_batch_id: "demo-batch-b",
    created_at: "2026-04-20T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-05",
    filmmaker_name: "Chris Nguyen",
    film_title: "Red Shift Motel",
    email: "chris.nguyen@example.com",
    website: "https://redshiftmotel.example",
    festival: "Sitges",
    genre: "Horror",
    completion_year: 2023,
    country: "United States",
    source_url: "https://sitges.example/red-shift-motel",
    why_it_may_fit: "Proven festival run; prior aggregator interest fell through on deliverables.",
    personalized_note: null,
    status: "replied",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: null,
    assigned_to: null,
    next_follow_up_at: "2026-07-28",
    last_contacted_at: "2026-07-15T16:30:00.000Z",
    submission_id: null,
    import_batch_id: "demo-batch-a",
    created_at: "2026-03-08T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-06",
    filmmaker_name: "Samir Patel",
    film_title: "Ledger Room",
    email: "samir.patel@example.com",
    website: null,
    festival: "Hot Docs",
    genre: "Documentary",
    completion_year: 2025,
    country: "Canada",
    source_url: "https://hotdocs.example/ledger-room",
    why_it_may_fit: "Investigative doc with clear subject access; archival licenses partially cleared.",
    personalized_note: "Samir — Ledger Room’s finance-world access is rare for this scale of production.",
    status: "meeting",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: null,
    assigned_to: null,
    next_follow_up_at: "2026-08-01",
    last_contacted_at: "2026-07-22T11:00:00.000Z",
    submission_id: null,
    import_batch_id: null,
    created_at: "2026-05-28T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-07",
    filmmaker_name: "Riley Thompson",
    film_title: "Soft Launch",
    email: "riley.thompson@example.com",
    website: "https://softlaunchfilm.example",
    festival: null,
    genre: "Dark Comedy",
    completion_year: 2024,
    country: "United Kingdom",
    source_url: null,
    why_it_may_fit: "Dark comedy with strong social clips; rights unclear on music bed.",
    personalized_note: null,
    status: "follow_up_later",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: null,
    assigned_to: null,
    next_follow_up_at: "2026-09-01",
    last_contacted_at: "2026-06-01T12:00:00.000Z",
    submission_id: null,
    import_batch_id: "demo-batch-b",
    created_at: "2026-02-14T12:00:00.000Z",
    updated_at: now,
  },
  {
    id: "demo-lead-08",
    filmmaker_name: "Nina Alvarez",
    film_title: "Border Light",
    email: "nina.alvarez@example.com",
    website: null,
    festival: "SXSW",
    genre: "Crime",
    completion_year: 2025,
    country: "United States",
    source_url: "https://sxsw.example/border-light",
    why_it_may_fit: "Crime drama with festival heat; filmmaker asked for invite link.",
    personalized_note:
      "Nina — thank you for the SXSW note. Here is our submission path when you are ready: /submit?outreach=demo-lead-08",
    status: "discovered",
    festival_id: null,
    film_school_id: null,
    producer_org_id: null,
    partner_slug: null,
    assigned_to: null,
    next_follow_up_at: null,
    last_contacted_at: null,
    submission_id: null,
    import_batch_id: null,
    created_at: "2026-07-25T12:00:00.000Z",
    updated_at: now,
  },
];

export const DEMO_OUTREACH_MESSAGES: OutreachMessage[] = [
  {
    id: "demo-msg-01",
    lead_id: "demo-lead-02",
    campaign_id: null,
    subject: "Freight — digital release conversation",
    body: "Hi Jonas,\n\nWe saw Freight at Toronto Independent and appreciated the nocturnal craft. If you are open to a boutique digital release conversation, we would welcome a look at your screener and rights summary.\n\nBest,\nSilver Spring Studios Acquisitions",
    status: "sent",
    approved_by: null,
    approved_at: "2026-07-09T12:00:00.000Z",
    sent_by: null,
    sent_at: "2026-07-10T18:00:00.000Z",
    created_by: null,
    created_at: "2026-07-08T12:00:00.000Z",
    updated_at: "2026-07-10T18:00:00.000Z",
  },
  {
    id: "demo-msg-02",
    lead_id: "demo-lead-04",
    campaign_id: null,
    subject: "Glass Orchard — invitation to submit",
    body: "Hi Elena,\n\nFollowing the Northern Lens showcase, we would like to invite Glass Orchard into our acquisitions review when materials are ready.\n\nSubmit here: /submit?partner=northern-lens-film-school&outreach=demo-lead-04\n\nSilver Spring Studios",
    status: "approved",
    approved_by: null,
    approved_at: "2026-07-17T10:00:00.000Z",
    sent_by: null,
    sent_at: null,
    created_by: null,
    created_at: "2026-07-16T12:00:00.000Z",
    updated_at: "2026-07-17T10:00:00.000Z",
  },
  {
    id: "demo-msg-03",
    lead_id: "demo-lead-01",
    campaign_id: null,
    subject: "Saltwater Static — acquisitions note",
    body: "Hi Maya,\n\nDraft outreach for approval.",
    status: "draft",
    approved_by: null,
    approved_at: null,
    sent_by: null,
    sent_at: null,
    created_by: null,
    created_at: "2026-07-19T12:00:00.000Z",
    updated_at: "2026-07-19T12:00:00.000Z",
  },
];

export const DEMO_OUTREACH_FOLLOW_UPS: OutreachFollowUp[] = [
  {
    id: "demo-fu-01",
    lead_id: "demo-lead-02",
    due_at: "2026-07-30",
    note: "Check whether Jonas replied to the Freight email.",
    completed_at: null,
    created_by: null,
    created_at: "2026-07-10T18:30:00.000Z",
  },
  {
    id: "demo-fu-02",
    lead_id: "demo-lead-05",
    due_at: "2026-07-28",
    note: "Schedule screener password handoff call.",
    completed_at: null,
    created_by: null,
    created_at: "2026-07-15T17:00:00.000Z",
  },
];

export const DEMO_OUTREACH_REPLIES: OutreachReply[] = [
  {
    id: "demo-reply-01",
    lead_id: "demo-lead-05",
    message_id: null,
    body: "Thanks for reaching out — happy to share a passworded Vimeo once we confirm territory availability.",
    received_at: "2026-07-15T16:00:00.000Z",
    logged_by: null,
    created_at: "2026-07-15T16:05:00.000Z",
  },
];

export type OutreachLeadDetail = {
  lead: OutreachLead;
  messages: OutreachMessage[];
  followUps: OutreachFollowUp[];
  replies: OutreachReply[];
};

/** Mutable in-memory store for demo-mode CRM mutations within a process. */
let demoLeads = [...DEMO_OUTREACH_LEADS];
let demoMessages = [...DEMO_OUTREACH_MESSAGES];
let demoFollowUps = [...DEMO_OUTREACH_FOLLOW_UPS];
let demoReplies = [...DEMO_OUTREACH_REPLIES];

export function listDemoOutreachLeads(status?: OutreachLeadStatus | "all"): OutreachLead[] {
  if (!status || status === "all") return [...demoLeads];
  return demoLeads.filter((lead) => lead.status === status);
}

export function getDemoOutreachLead(id: string): OutreachLeadDetail | null {
  const lead = demoLeads.find((row) => row.id === id);
  if (!lead) return null;
  return {
    lead,
    messages: demoMessages.filter((row) => row.lead_id === id),
    followUps: demoFollowUps.filter((row) => row.lead_id === id),
    replies: demoReplies.filter((row) => row.lead_id === id),
  };
}

export function upsertDemoLead(lead: OutreachLead): void {
  const index = demoLeads.findIndex((row) => row.id === lead.id);
  if (index >= 0) {
    demoLeads[index] = lead;
  } else {
    demoLeads = [lead, ...demoLeads];
  }
}

export function addDemoLeads(leads: OutreachLead[]): void {
  demoLeads = [...leads, ...demoLeads];
}

export function upsertDemoMessage(message: OutreachMessage): void {
  const index = demoMessages.findIndex((row) => row.id === message.id);
  if (index >= 0) {
    demoMessages[index] = message;
  } else {
    demoMessages = [message, ...demoMessages];
  }
}

export function addDemoFollowUp(followUp: OutreachFollowUp): void {
  demoFollowUps = [followUp, ...demoFollowUps];
}

export function addDemoReply(reply: OutreachReply): void {
  demoReplies = [reply, ...demoReplies];
}
