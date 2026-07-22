import { NextRequest, NextResponse } from "next/server";
import { getAllFeedback, saveFeedback, isSharedBackendConfigured, Feedback } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = await getAllFeedback();
  return NextResponse.json({
    feedback: all,
    sharedBackend: isSharedBackendConfigured(),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { participantId, decision, reason, reviewerEmail } = body || {};

  if (!participantId || !reviewerEmail) {
    return NextResponse.json({ error: "participantId and reviewerEmail are required" }, { status: 400 });
  }
  if (decision !== "approved" && decision !== "disapproved") {
    return NextResponse.json({ error: "decision must be approved or disapproved" }, { status: 400 });
  }
  if (decision === "disapproved" && !String(reason || "").trim()) {
    return NextResponse.json({ error: "a reason is required when disapproving" }, { status: 400 });
  }

  const fb: Feedback = {
    participantId,
    decision,
    reason: String(reason || "").trim(),
    reviewerEmail: String(reviewerEmail).trim().toLowerCase(),
    updatedAt: Date.now(),
  };
  await saveFeedback(fb);
  return NextResponse.json({ ok: true, feedback: fb });
}
