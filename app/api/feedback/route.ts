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
  const {
    participantId, status, finalCode, finalSelections, changes, explanation, reviewerEmail,
  } = body || {};

  if (!participantId || !reviewerEmail) {
    return NextResponse.json({ error: "participantId and reviewerEmail are required" }, { status: 400 });
  }
  if (status !== "validated" && status !== "edited") {
    return NextResponse.json({ error: "status must be validated or edited" }, { status: 400 });
  }
  if (status === "edited" && !String(explanation || "").trim()) {
    return NextResponse.json({ error: "an explanation is required when you change the code" }, { status: 400 });
  }

  const fb: Feedback = {
    participantId,
    status,
    finalCode: String(finalCode || ""),
    finalSelections: finalSelections || {},
    changes: Array.isArray(changes) ? changes : [],
    explanation: String(explanation || "").trim(),
    reviewerEmail: String(reviewerEmail).trim().toLowerCase(),
    updatedAt: Date.now(),
  };
  await saveFeedback(fb);
  return NextResponse.json({ ok: true, feedback: fb });
}
