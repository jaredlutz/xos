export type LearnSection = { heading: string; body: string[] };
export type LearnTopic = {
  slug: string;
  title: string;
  description: string;
  sections: LearnSection[];
};

export const learnTopics: LearnTopic[] = [
  {
    slug: "getting-started",
    title: "Getting started with xOS",
    description: "What xOS is and how CEO mode (Command Center vs Hyperfocus) works.",
    sections: [
      {
        heading: "What is xOS?",
        body: [
          "xOS is your CEO operating system: a decision-first layer that connects Commitments → Proof → Slippage → Decision Queue. It keeps the most important decisions and commitments in one place so you can clear them without losing context.",
        ],
      },
      {
        heading: "Two modes: Command Center and Hyperfocus",
        body: [
          "Use the CEO mode toggle (top right) to switch between two dashboard views.",
          "Command Center (CEO mode OFF): Operations view. You see CEO Actions Today, Live Scoreboard (KPIs), Momentum Risks (signals), Proof Inbox, and Operating Rhythm. Best for running the business and scanning what needs attention.",
          "Hyperfocus (CEO mode ON): Decision view. You see a focus banner (“You have X decisions to clear”), the Decision Queue (up to 7), Slippage, Proof Inbox, and a compact Commitments snapshot. KPIs and signals are hidden so you can focus on deciding.",
        ],
      },
      {
        heading: "Your preference is saved",
        body: [
          "CEO mode is stored in the database and synced to your browser. Turn it on when you want to focus on decisions; turn it off when you want the full operations view.",
        ],
      },
    ],
  },
  {
    slug: "dashboard",
    title: "The dashboard",
    description: "Command Center and Hyperfocus layouts and what each section does.",
    sections: [
      {
        heading: "Command Center (CEO mode OFF)",
        body: [
          "CEO Actions Today: Top OPEN actions for you, sorted by due date and impact. Each card shows title, why it matters, impact, due date, owner, and buttons (e.g. View decision, Add reason).",
          "Live Scoreboard: Four tiles — Capital, Marketing, Sales, Platform — with KPI values and deltas. If a KPI isn’t wired yet, you’ll see “Not wired yet” and a link to add KPIs (admin).",
          "Momentum Risks: OPEN signals ordered by severity (HIGH → LOW). Each shows title, severity badge, description, and a link to the related commitment or decision.",
          "Proof Inbox: Proofs awaiting verification (CEO/EXEC only). Verify or reject with a note.",
          "Operating Rhythm: Today’s date, next L10 (from env), and the top 3 commitments by priority/blast radius.",
        ],
      },
      {
        heading: "Hyperfocus (CEO mode ON)",
        body: [
          "Focus banner: “You have X decisions to clear” so you know how many are in the queue.",
          "Decision Queue: Up to 7 decisions. Open any to see options and select one (with a confirm step).",
          "Slippage: Commitments that are late and need a reason. Add a reason from the card or from the commitment detail page.",
          "Proof Inbox: Same as Command Center (when you have CEO/EXEC role).",
          "Commitments snapshot: Compact count/summary so you’re aware without switching to the full list.",
        ],
      },
    ],
  },
  {
    slug: "commitments",
    title: "Commitments",
    description: "What commitments are, how to filter and read them, and how to handle slippage.",
    sections: [
      {
        heading: "What are commitments?",
        body: [
          "Commitments are outcomes owned by a person (owner) for a system, with a due date, blast radius, and priority. They come from your tools (e.g. webhooks) or can be managed in xOS.",
        ],
      },
      {
        heading: "List view",
        body: [
          "On the Commitments page you can filter by owner, system, blast radius, and sort by due date or priority. “Due soon” appears when due_date is within 3 days and status is ACTIVE; “Overdue” when due_date is in the past.",
        ],
      },
      {
        heading: "Detail and slippage",
        body: [
          "Open a commitment to see its timeline and any proofs or slippage. If a commitment has slipped (past due) and no reason has been recorded, you’ll see an inline form to submit a slippage reason. Submitting updates the slippage row and keeps the team unblocked.",
        ],
      },
    ],
  },
  {
    slug: "decisions",
    title: "Decisions",
    description: "The decision queue, how to choose an option, and what happens after.",
    sections: [
      {
        heading: "Decision queue",
        body: [
          "Decisions are items that need your choice. The list shows the decision name, linked commitment (if any), system, and Age (time since created). In Hyperfocus, up to 7 are shown on the dashboard.",
        ],
      },
      {
        heading: "Choosing an option",
        body: [
          "Open a decision to see context and options. When you click an option, a confirmation modal asks you to confirm. After you confirm, your selection is recorded in the activity log and the decision status becomes DECIDED.",
        ],
      },
      {
        heading: "After you decide",
        body: [
          "The decision is marked DECIDED and the selected option is stored. Activity is visible in the timeline so the team can see what was chosen and when.",
        ],
      },
    ],
  },
  {
    slug: "proof-and-slippage",
    title: "Proof and slippage",
    description: "Submitting proof, verifying it (CEO/EXEC), and why slippage reasons matter.",
    sections: [
      {
        heading: "Proof",
        body: [
          "Proof is evidence that a commitment is done or on track (e.g. URL, metric, screenshot). It can be submitted via webhooks or in-app. CEO and EXEC can verify or reject proof in the Proof Inbox; verified proof supports accountability.",
        ],
      },
      {
        heading: "Slippage",
        body: [
          "When a commitment is past due, a slippage record is created. Recording a reason (why it slipped) is required to unblock tracking and escalation. You can add the reason from the dashboard Slippage card or from the commitment detail page.",
        ],
      },
    ],
  },
  {
    slug: "admin",
    title: "Admin: KPIs, signals, CEO actions",
    description: "Who can manage KPIs, signals, and CEO actions, and how they show up on the dashboard.",
    sections: [
      {
        heading: "Access",
        body: [
          "Admin (KPIs, Signals, CEO Actions) is restricted to CEO and EXEC. Other roles are redirected from /admin to the dashboard.",
        ],
      },
      {
        heading: "KPIs",
        body: [
          "KPI metrics power the Live Scoreboard. Each metric has a key (e.g. capital.pipeline_usd, marketing.forms_today), label, value, optional delta, and period. Create or edit them under Admin → KPIs. The dashboard uses fixed keys for the four tiles; add metrics with those keys to “wire” the scoreboard.",
        ],
      },
      {
        heading: "Signals",
        body: [
          "Signals are risks or opportunities (e.g. MOMENTUM_RISK, PIPELINE_RISK) with severity and optional links to a commitment, decision, or system. OPEN signals appear in Momentum Risks on the Command Center. Manage them under Admin → Signals.",
        ],
      },
      {
        heading: "CEO actions",
        body: [
          "CEO actions are items that need your attention: title, why it matters, impact label, due date, owner, and optional action buttons (e.g. open decision, open commitment). OPEN actions appear in CEO Actions Today. Manage them under Admin → CEO Actions.",
        ],
      },
    ],
  },
];

const slugToTopic = new Map(learnTopics.map((t) => [t.slug, t]));
export function getTopic(slug: string): LearnTopic | undefined {
  return slugToTopic.get(slug);
}
export function getAllSlugs(): string[] {
  return learnTopics.map((t) => t.slug);
}

export const tutorialOrder: string[] = [
  "getting-started",
  "dashboard",
  "commitments",
  "decisions",
  "proof-and-slippage",
  "admin",
];
