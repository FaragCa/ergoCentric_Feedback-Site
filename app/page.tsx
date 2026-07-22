"use client";

import { useEffect, useMemo, useState } from "react";
import participants from "@/data/participants.json";

type Measurement = { label: string; value: number | null };
type Participant = {
  id: string;
  name: string;
  height: string | null;
  weight: string | null;
  measurements: Measurement[];
  frontImage: string | null;
  sideImage: string | null;
  originalCode: string;
  aiCode: string;
  codesDiffer: boolean;
};
type Feedback = {
  participantId: string;
  decision: "approved" | "disapproved";
  reason: string;
  reviewerEmail: string;
  updatedAt: number;
};

const PEOPLE = participants as Participant[];
const EMAIL_KEY = "chair-review-email";

export default function Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setEmail(localStorage.getItem(EMAIL_KEY));
    setReady(true);
  }, []);

  if (!ready) return null;
  if (!email) return <Login onLogin={(e) => { localStorage.setItem(EMAIL_KEY, e); setEmail(e); }} />;
  return <Reviewer email={email} onLogout={() => { localStorage.removeItem(EMAIL_KEY); setEmail(null); }} />;
}

/* ---------------- Login ---------------- */
function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [val, setVal] = useState("");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim());
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Chair Recommendation Review</h1>
        <p>Enter your email to start (or continue) reviewing. No password needed — your email just saves your progress and signs your feedback.</p>
        <label className="field-label" htmlFor="email">Email address</label>
        <input
          id="email" className="text-input" type="email" placeholder="you@example.com"
          value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && valid) onLogin(val.trim().toLowerCase()); }}
          autoFocus
        />
        <button className="btn btn-block" disabled={!valid} onClick={() => onLogin(val.trim().toLowerCase())}>
          Start reviewing →
        </button>
      </div>
    </div>
  );
}

/* ---------------- Reviewer ---------------- */
function Reviewer({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [shared, setShared] = useState(true);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // draft decision state for the current card
  const [decision, setDecision] = useState<"approved" | "disapproved" | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [showReasonErr, setShowReasonErr] = useState(false);

  const current = PEOPLE[idx];

  useEffect(() => {
    fetch("/api/feedback")
      .then((r) => r.json())
      .then((d) => { setFeedback(d.feedback || {}); setShared(!!d.sharedBackend); })
      .catch(() => {});
  }, []);

  // load draft from saved feedback whenever the card changes
  useEffect(() => {
    const fb = feedback[current.id];
    setDecision(fb?.decision ?? null);
    setReason(fb?.reason ?? "");
    setShowReasonErr(false);
  }, [idx, feedback, current.id]);

  const reviewedCount = useMemo(
    () => PEOPLE.filter((p) => feedback[p.id]).length,
    [feedback]
  );

  function flashToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  async function save(goNext: boolean) {
    if (!decision) { flashToast("Pick Approve or Disapprove first"); return; }
    if (decision === "disapproved" && !reason.trim()) {
      setShowReasonErr(true);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: current.id, decision, reason: reason.trim(), reviewerEmail: email,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "save failed");
      setFeedback((prev) => ({ ...prev, [current.id]: d.feedback }));
      flashToast("Saved ✓");
      if (goNext && idx < PEOPLE.length - 1) setIdx(idx + 1);
    } catch (e: any) {
      flashToast(e.message || "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const existing = feedback[current.id];

  function exportCsv() {
    const rows = [[
      "Name", "Original Code", "AI Recommended Code", "Codes Differ",
      "Decision", "Reason", "Reviewer", "Updated At",
    ]];
    for (const p of PEOPLE) {
      const fb = feedback[p.id];
      rows.push([
        p.name, p.originalCode, p.aiCode, p.codesDiffer ? "yes" : "no",
        fb?.decision ?? "", fb?.reason ?? "", fb?.reviewerEmail ?? "",
        fb ? new Date(fb.updatedAt).toISOString() : "",
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "chair-review-feedback.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="topbar">
        <span className="title">🪑 Chair Recommendation Review</span>
        <span className="progress-pill">{reviewedCount} / {PEOPLE.length} reviewed</span>
        <div className="spacer" />
        <span className="who">{email}</span>
        <button className="btn btn-ghost" onClick={exportCsv}>Export CSV</button>
        <button className="btn btn-ghost" onClick={onLogout}>Log out</button>
      </div>

      {!shared && (
        <div className="warn-banner">
          Demo mode: feedback is saved locally only and will not be shared. Connect the database (see README) so results persist and are visible to everyone.
        </div>
      )}

      <div className="container">
        <div className="dots">
          {PEOPLE.map((p, i) => {
            const fb = feedback[p.id];
            const cls = fb ? fb.decision : "";
            return (
              <div
                key={p.id}
                className={`dot ${cls} ${i === idx ? "current" : ""}`}
                title={`${p.name}${fb ? " · " + fb.decision : ""}`}
                onClick={() => setIdx(i)}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="media">
            {current.frontImage ? (
              <div className="media-item">
                <img src={current.frontImage} alt={`${current.name} front`} onClick={() => setZoom(current.frontImage)} />
                <span className="media-tag">Front</span>
              </div>
            ) : <div className="no-image">No front image available</div>}
            {current.sideImage ? (
              <div className="media-item">
                <img src={current.sideImage} alt={`${current.name} side`} onClick={() => setZoom(current.sideImage)} />
                <span className="media-tag">Side</span>
              </div>
            ) : <div className="no-image">No side image available</div>}
          </div>

          <div className="detail">
            <h2>{current.name}</h2>
            <div className="sub">
              Height <b>{current.height || "—"}</b> · Weight <b>{current.weight || "—"}</b>
            </div>

            <table className="meas-table">
              <tbody>
                {current.measurements.map((m, i) => (
                  <tr key={i}>
                    <td className="label">{i + 1}. {m.label}</td>
                    <td className="val">{m.value ?? "—"}{m.value != null ? '"' : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="codes">
              <div className="code-box">
                <div className="k">Original code</div>
                <div className="v">{current.originalCode}</div>
              </div>
              <div className="code-box ai">
                <div className="k">AI recommended</div>
                <div className="v">{current.aiCode}</div>
              </div>
            </div>
            {current.codesDiffer
              ? <div className="diff-note">⚠ The AI recommendation differs from the original code.</div>
              : <div className="same-note">The AI recommendation matches the original code.</div>}

            <div className="decision">
              <div className="q">Do you approve the AI recommended code?</div>
              <div className="dbtns">
                <button
                  className={`dbtn approve ${decision === "approved" ? "active" : ""}`}
                  onClick={() => { setDecision("approved"); setShowReasonErr(false); }}
                >✓ Approve</button>
                <button
                  className={`dbtn disapprove ${decision === "disapproved" ? "active" : ""}`}
                  onClick={() => setDecision("disapproved")}
                >✕ Disapprove</button>
              </div>

              {decision === "disapproved" && (
                <div className="reason-wrap">
                  <textarea
                    placeholder="Briefly explain why (one sentence is fine)…"
                    value={reason}
                    onChange={(e) => { setReason(e.target.value); if (e.target.value.trim()) setShowReasonErr(false); }}
                  />
                  {showReasonErr && <div className="reason-req">A short explanation is required to disapprove.</div>}
                </div>
              )}

              <div className="save-row">
                <button className="btn" disabled={saving} onClick={() => save(true)}>
                  {saving ? "Saving…" : "Save & next →"}
                </button>
                <button className="btn btn-ghost" disabled={saving} onClick={() => save(false)}>Save</button>
                {existing && (
                  <span className="saved-meta">
                    <b>Saved</b> · {existing.decision} · by {existing.reviewerEmail} · {new Date(existing.updatedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="nav">
          <button className="btn btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</button>
          <span className="saved-meta">{idx + 1} of {PEOPLE.length}</span>
          <button className="btn btn-ghost" disabled={idx === PEOPLE.length - 1} onClick={() => setIdx(idx + 1)}>Next →</button>
        </div>
      </div>

      {zoom && (
        <div className="modal" onClick={() => setZoom(null)}>
          <img src={zoom} alt="zoom" />
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
