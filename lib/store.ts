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
 * Placeholder store — NO persistent backend yet.
 *
 * Feedback is kept in memory only, so it lives for the life of the running
 * server process and is NOT shared across visitors or deploys. This is a
 * deliberate clean slate: swap the two functions below for Supabase (or any
 * other store) when you wire persistence in.
 * ========================================================================= */

const memory: FeedbackMap = {};

export async function getAllFeedback(): Promise<FeedbackMap> {
  return memory;
}

export async function saveFeedback(fb: Feedback): Promise<void> {
  memory[fb.participantId] = fb;
}

export function isSharedBackendConfigured(): boolean {
  return false;
}
