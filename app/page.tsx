"use client";

import { useEffect, useMemo, useState } from "react";
import participants from "@/data/participants.json";
import {
  MECHANISM, AIR_LUMBAR, ARMS, SEAT_GROUPS, SERIES_NAMES,
  COMPONENT_LABELS, buildCode, labelFor, Option, OptionGroup,
  ComponentKey, Selections,
} from "@/lib/options";

type Measurement = { label: string; value: number | null };
type Participant = {
  id: string; name: string; height: string | null; weight: string | null;
  measurements: Measurement[]; frontImage: string | null; sideImage: string | null;
  ai: Selections;
};
type Change = { component: string; from: string; to: string };
type Feedback = {
  participantId: string; status: "validated" | "edited"; finalCode: string;
  finalSelections: Selections; changes: Change[]; explanation: string;
  reviewerEmail: string; updatedAt: number;
};

const PEOPLE = participants as Participant[];
const EMAIL_KEY = "chair-review-email";
const ORDER: ComponentKey[] = ["series", "color", "model", "mechanism", "seat", "airLumbar", "arms"];

export default function Page() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setEmail(localStorage.getItem(EMAIL_KEY)); setReady(true); }, []);
  if (!ready) return null;
  if (!email) return <Login onLogin={(e) => { localStorage.setItem(EMAIL_KEY, e); setEmail(e); }} />;
  return <Reviewer email={email} onLogout={() => { localStorage.removeItem(EMAIL_KEY); setEmail(null); }} />;
}

function Login({ onLogin }: { onLogin: (email: string) => void }) {
  const [val, setVal] = useState("");
  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val.trim());
  const go = () => valid && onLogin(val.trim().toLowerCase());
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h1>Chair Recommendation Review</h1>
        <p>Enter your email to start (or continue) reviewing. No password needed — your email just saves your progress and signs your feedback.</p>
        <label className="field-label" htmlFor="email">Email address</label>
        <input id="email" className="text-input" type="email" placeholder="you@example.com"
          value={val} onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()} autoFocus />
        <button className="btn btn-block" disabled={!valid} onClick={go}>Start reviewing →</button>
      </div>
    </div>
  );
}

function Reviewer({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({});
  const [shared, setShared] = useState(true);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [sel, setSel] = useState<Selections | null>(null);
  const [explanation, setExplanation] = useState("");
  const [saving, setSaving] = useState(false);
  const [showErr, setShowErr] = useState(false);

  const current = PEOPLE[idx];

  useEffect(() => {
    fetch("/api/feedback").then((r) => r.json())
      .then((d) => { setFeedback(d.feedback || {}); setShared(!!d.sharedBackend); })
      .catch(() => {});
  }, []);

  // Load selections for the current card: saved edit if present, else AI default.
  useEffect(() => {
    const fb = feedback[current.id];
    setSel(fb?.finalSelections ? { ...fb.finalSelections } : { ...current.ai });
    setExplanation(fb?.explanation ?? "");
    setShowErr(false);
  }, [idx, feedback, current.id, current.ai]);

  const changes: Change[] = useMemo(() => {
    if (!sel) return [];
    return ORDER.filter((k) => sel[k] !== current.ai[k]).map((k) => ({
      component: COMPONENT_LABELS[k],
      from: labelFor(k, current.ai[k]),
      to: labelFor(k, sel[k]),
    }));
  }, [sel, current.ai]);

  const status: "validated" | "edited" = changes.length ? "edited" : "validated";
  const reviewedCount = useMemo(() => PEOPLE.filter((p) => feedback[p.id]).length, [feedback]);

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(null), 1800); }
  function setField(k: ComponentKey, v: string) { setSel((s) => (s ? { ...s, [k]: v } : s)); setShowErr(false); }
  function resetToAi() { setSel({ ...current.ai }); setExplanation(""); setShowErr(false); }

  async function save(goNext: boolean) {
    if (!sel) return;
    if (status === "edited" && !explanation.trim()) { setShowErr(true); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: current.id, status, finalCode: buildCode(sel),
          finalSelections: sel, changes, explanation: explanation.trim(), reviewerEmail: email,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "save failed");
      setFeedback((prev) => ({ ...prev, [current.id]: d.feedback }));
      flash(status === "edited" ? "Saved edit ✓" : "Validated ✓");
      if (goNext && idx < PEOPLE.length - 1) setIdx(idx + 1);
    } catch (e: any) { flash(e.message || "Could not save"); }
    finally { setSaving(false); }
  }

  function exportCsv() {
    const rows = [["Name", "AI recommended code", "Final code", "Status", "Changes", "Explanation", "Reviewer", "Updated At"]];
    for (const p of PEOPLE) {
      const fb = feedback[p.id];
      const changeText = (fb?.changes || []).map((c) => `${c.component}: ${c.from} → ${c.to}`).join("; ");
      rows.push([
        p.name, buildCode(p.ai), fb?.finalCode ?? "", fb?.status ?? "",
        changeText, fb?.explanation ?? "", fb?.reviewerEmail ?? "",
        fb ? new Date(fb.updatedAt).toISOString() : "",
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "chair-review-feedback.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  if (!sel) return null;
  const existing = feedback[current.id];
  const aiCode = buildCode(current.ai);
  const liveCode = buildCode(sel);

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
            const cls = fb ? fb.status : "";
            return (
              <div key={p.id} className={`dot ${cls} ${i === idx ? "current" : ""}`}
                title={`${p.name}${fb ? " · " + fb.status : ""}`} onClick={() => setIdx(i)}>
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
            <div className="sub">Height <b>{current.height || "—"}</b> · Weight <b>{current.weight || "—"}</b></div>

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

            {/* AI recommended code (reference) */}
            <div className="ai-code-banner">
              <span className="k">AI recommended code</span>
              <span className="v">{aiCode}</span>
            </div>

            {/* Live edited code */}
            <div className={`live-code ${status === "edited" ? "edited" : ""}`}>
              <span className="k">{status === "edited" ? "Your edited code" : "Current code"}</span>
              <span className="v">{liveCode}</span>
            </div>

            {/* Component dropdowns */}
            <div className="builder">
              <div className="builder-title">Validate or edit each part of the code</div>
              {ORDER.map((k) => (
                <ComponentField
                  key={k} k={k} value={sel[k]} aiValue={current.ai[k]}
                  onChange={(v) => setField(k, v)} />
              ))}
            </div>

            {/* Changes summary */}
            {changes.length > 0 ? (
              <div className="changes">
                <div className="changes-title">What you changed</div>
                <ul>
                  {changes.map((c, i) => (
                    <li key={i}><b>{c.component}</b>: {c.from} → <b>{c.to}</b></li>
                  ))}
                </ul>
                <label className="field-label" htmlFor="why">Explain why (one sentence)</label>
                <textarea id="why" className="reason-area" placeholder="e.g. Hip width is 22 in, so a wider Plus-size seat fits better than the AI's standard."
                  value={explanation} onChange={(e) => { setExplanation(e.target.value); if (e.target.value.trim()) setShowErr(false); }} />
                {showErr && <div className="reason-req">An explanation is required when you change the code.</div>}
              </div>
            ) : (
              <div className="validate-note">No changes — you are validating the AI recommendation as correct. (You may add an optional note below.)
                <textarea className="reason-area" style={{ marginTop: 8 }} placeholder="Optional note…"
                  value={explanation} onChange={(e) => setExplanation(e.target.value)} />
              </div>
            )}

            <div className="save-row">
              <button className="btn" disabled={saving} onClick={() => save(true)}>
                {saving ? "Saving…" : status === "edited" ? "Save edit & next →" : "Validate & next →"}
              </button>
              <button className="btn btn-ghost" disabled={saving} onClick={() => save(false)}>Save</button>
              {changes.length > 0 && <button className="btn btn-ghost" onClick={resetToAi}>Reset to AI</button>}
            </div>
            {existing && (
              <div className="saved-meta">
                <b>Saved</b> · {existing.status} · <code>{existing.finalCode}</code> · by {existing.reviewerEmail} · {new Date(existing.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        <div className="nav">
          <button className="btn btn-ghost" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</button>
          <span className="saved-meta">{idx + 1} of {PEOPLE.length}</span>
          <button className="btn btn-ghost" disabled={idx === PEOPLE.length - 1} onClick={() => setIdx(idx + 1)}>Next →</button>
        </div>
      </div>

      {zoom && <div className="modal" onClick={() => setZoom(null)}><img src={zoom} alt="zoom" /></div>}
      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

/* ---- One component row: dropdown (documented) or text input (free) ---- */
function ComponentField({ k, value, aiValue, onChange }: {
  k: ComponentKey; value: string; aiValue: string; onChange: (v: string) => void;
}) {
  const changed = value !== aiValue;
  return (
    <div className={`field-row ${changed ? "changed" : ""}`}>
      <label className="field-name">
        {COMPONENT_LABELS[k]}
        {changed && <span className="changed-badge">edited</span>}
      </label>
      {k === "mechanism" && <SelectFlat value={value} options={MECHANISM} onChange={onChange} />}
      {k === "airLumbar" && <SelectFlat value={value} options={AIR_LUMBAR} onChange={onChange} />}
      {k === "arms" && <SelectFlat value={value} options={ARMS} onChange={onChange} />}
      {k === "seat" && <SelectGrouped value={value} groups={SEAT_GROUPS} onChange={onChange} />}
      {(k === "series" || k === "color" || k === "model") && (
        <div className="free-field">
          <input className="text-input" list={`dl-${k}`} value={value}
            onChange={(e) => onChange(e.target.value)} />
          {k === "series" && (
            <datalist id="dl-series">
              {SERIES_NAMES.map((n) => <option key={n} value={n} />)}
            </datalist>
          )}
          {k === "color" && <datalist id="dl-color"><option value="MB" /></datalist>}
          {k === "model" && <datalist id="dl-model"><option value="MESH" /><option value="FOAM" /></datalist>}
          <span className="free-hint">code segment (editable)</span>
        </div>
      )}
    </div>
  );
}

function SelectFlat({ value, options, onChange }: { value: string; options: Option[]; onChange: (v: string) => void }) {
  const known = options.some((o) => o.code === value);
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {!known && <option value={value}>{value} (current)</option>}
      {options.map((o) => <option key={o.code} value={o.code}>{o.code} — {o.label}</option>)}
    </select>
  );
}

function SelectGrouped({ value, groups, onChange }: { value: string; groups: OptionGroup[]; onChange: (v: string) => void }) {
  const known = groups.some((g) => g.options.some((o) => o.code === value));
  return (
    <select className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {!known && <option value={value}>{value} (current)</option>}
      {groups.map((g) => (
        <optgroup key={g.group} label={g.group}>
          {g.options.map((o) => <option key={o.code} value={o.code}>{o.code} — {o.label}</option>)}
        </optgroup>
      ))}
    </select>
  );
}
