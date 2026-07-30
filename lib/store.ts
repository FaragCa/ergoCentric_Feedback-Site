import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

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
 * Backend selection, in priority order:
 *   1. GitHub repo  (GITHUB_TOKEN present)  -> feedback.json committed to a branch
 *   2. Upstash/KV   (redis env present)     -> shared key-value store
 *   3. Local file   (dev fallback)          -> .data/feedback.json (NOT shared)
 * ========================================================================= */

// ---------- 1. GitHub repo store ----------------------------------------
const GH = {
  token:
    process.env.GITHUB_TOKEN ||
    process.env.GH_TOKEN ||
    process.env.FEEDBACK_GH_TOKEN ||
    "",
  repo: process.env.GITHUB_REPO || "FaragCa/ergoCentric_Feedback-Site", // owner/repo
  branch: process.env.GITHUB_DATA_BRANCH || "feedback-store",
  baseBranch: process.env.GITHUB_PROD_BRANCH || "main",
  path: process.env.GITHUB_DATA_PATH || "feedback.json",
};

function ghEnabled(): boolean {
  return !!GH.token && /\S+\/\S+/.test(GH.repo);
}

function ghHeaders() {
  return {
    Authorization: `Bearer ${GH.token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "chair-feedback-app",
  };
}

const ghApi = (p: string) => `https://api.github.com/repos/${GH.repo}${p}`;

async function ghEnsureBranch(): Promise<void> {
  const check = await fetch(ghApi(`/git/ref/heads/${GH.branch}`), {
    headers: ghHeaders(), cache: "no-store",
  });
  if (check.ok) return;
  // create the data branch from the base branch's current HEAD
  const baseRef = await fetch(ghApi(`/git/ref/heads/${GH.baseBranch}`), {
    headers: ghHeaders(), cache: "no-store",
  });
  if (!baseRef.ok) throw new Error(`GitHub: base branch ${GH.baseBranch} not found`);
  const baseSha = (await baseRef.json()).object.sha as string;
  const create = await fetch(ghApi(`/git/refs`), {
    method: "POST", headers: ghHeaders(),
    body: JSON.stringify({ ref: `refs/heads/${GH.branch}`, sha: baseSha }),
  });
  if (!create.ok && create.status !== 422) {
    throw new Error(`GitHub: could not create ${GH.branch} (${create.status})`);
  }
}

async function ghGetFile(): Promise<{ map: FeedbackMap; sha: string | null }> {
  const res = await fetch(
    ghApi(`/contents/${encodeURIComponent(GH.path)}?ref=${GH.branch}`),
    { headers: ghHeaders(), cache: "no-store" }
  );
  if (res.status === 404) return { map: {}, sha: null };
  if (!res.ok) throw new Error(`GitHub read failed (${res.status})`);
  const data = await res.json();
  const json = Buffer.from(data.content || "", "base64").toString("utf8");
  let map: FeedbackMap = {};
  try { map = json.trim() ? JSON.parse(json) : {}; } catch { map = {}; }
  return { map, sha: data.sha as string };
}

async function ghGetAll(): Promise<FeedbackMap> {
  try {
    return (await ghGetFile()).map;
  } catch {
    return {};
  }
}

async function ghSave(fb: Feedback): Promise<void> {
  await ghEnsureBranch();
  // read-modify-write with a small retry for concurrent saves
  for (let attempt = 0; attempt < 4; attempt++) {
    const { map, sha } = await ghGetFile();
    map[fb.participantId] = fb;
    const content = Buffer.from(JSON.stringify(map, null, 2), "utf8").toString("base64");
    const body: Record<string, unknown> = {
      message: `feedback: ${fb.participantId} ${fb.status} by ${fb.reviewerEmail}`,
      content,
      branch: GH.branch,
    };
    if (sha) body.sha = sha;
    const put = await fetch(ghApi(`/contents/${encodeURIComponent(GH.path)}`), {
      method: "PUT", headers: ghHeaders(), body: JSON.stringify(body),
    });
    if (put.ok) return;
    if (put.status === 409 || put.status === 422) continue; // sha conflict -> retry
    throw new Error(`GitHub write failed (${put.status})`);
  }
  throw new Error("GitHub write failed after retries");
}

// ---------- 2. Upstash / Vercel KV --------------------------------------
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}
const HASH_KEY = "chair-feedback:v1";

// ---------- 3. Local file (dev only) ------------------------------------
const LOCAL_FILE = path.join(process.cwd(), ".data", "feedback.json");
function readLocal(): FeedbackMap {
  try { return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8")); } catch { return {}; }
}
function writeLocal(all: FeedbackMap) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(all, null, 2));
}

// ---------- Public API --------------------------------------------------
export async function getAllFeedback(): Promise<FeedbackMap> {
  if (ghEnabled()) return ghGetAll();
  const redis = getRedis();
  if (redis) return (await redis.hgetall<FeedbackMap>(HASH_KEY)) || {};
  return readLocal();
}

export async function saveFeedback(fb: Feedback): Promise<void> {
  if (ghEnabled()) return ghSave(fb);
  const redis = getRedis();
  if (redis) { await redis.hset(HASH_KEY, { [fb.participantId]: fb }); return; }
  const all = readLocal();
  all[fb.participantId] = fb;
  writeLocal(all);
}

export function isSharedBackendConfigured(): boolean {
  return ghEnabled() || getRedis() !== null;
}
