export type Change = { component: string; from: string; to: string };

export type Feedback = {
  participantId: string;
  status: "validated" | "edited";
  finalCode: string;
  finalSelections: Record<string, string>;
  changes: Change[];
  explanation: string;
  reviewerEmail: string;
  updatedAt: number;
};

type FeedbackMap = Record<string, Feedback>;

/* =========================================================================
 * Storage: Supabase when configured, else in-memory (local/dev, not shared).
 *
 * Set these env vars in Vercel to turn on shared, persistent saving:
 *   SUPABASE_URL                 e.g. https://abcdxyz.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    the secret "service_role" key (server only)
 *
 * And create the table once (Supabase -> SQL Editor):
 *   create table if not exists feedback (
 *     participant_id text primary key,
 *     data jsonb not null,
 *     updated_at timestamptz default now()
 *   );
 * ========================================================================= */

const SB_URL = process.env.SUPABASE_URL || "";
const SB_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  "";

function supabaseEnabled(): boolean {
  return !!SB_URL && !!SB_KEY;
}

function sbHeaders() {
  return {
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
    "Content-Type": "application/json",
  };
}

// In-memory fallback (single process; not shared) for local dev / unconfigured.
const memory: FeedbackMap = {};

export async function getAllFeedback(): Promise<FeedbackMap> {
  if (!supabaseEnabled()) return memory;
  try {
    const res = await fetch(`${SB_URL}/rest/v1/feedback?select=data`, {
      headers: sbHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return {};
    const rows: { data: Feedback }[] = await res.json();
    const map: FeedbackMap = {};
    for (const r of rows) if (r?.data?.participantId) map[r.data.participantId] = r.data;
    return map;
  } catch {
    return {};
  }
}

export async function saveFeedback(fb: Feedback): Promise<void> {
  if (!supabaseEnabled()) {
    memory[fb.participantId] = fb;
    return;
  }
  const res = await fetch(`${SB_URL}/rest/v1/feedback`, {
    method: "POST",
    headers: {
      ...sbHeaders(),
      // upsert on the participant_id primary key
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify([
      { participant_id: fb.participantId, data: fb, updated_at: new Date(fb.updatedAt).toISOString() },
    ]),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Supabase save failed (${res.status}) ${detail}`.trim());
  }
}

export function isSharedBackendConfigured(): boolean {
  return supabaseEnabled();
}
