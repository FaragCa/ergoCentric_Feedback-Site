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

const HASH_KEY = "chair-feedback:v1";

// ---- Backend selection --------------------------------------------------
// If Upstash/Vercel-KV env vars are present we use Redis (shared, persistent,
// works on Vercel across all visitors). Otherwise we fall back to a local
// JSON file so `npm run dev` works with zero setup.
function getRedis(): Redis | null {
  const url =
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return new Redis({ url, token });
  return null;
}

const LOCAL_FILE = path.join(process.cwd(), ".data", "feedback.json");

function readLocal(): Record<string, Feedback> {
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeLocal(all: Record<string, Feedback>) {
  fs.mkdirSync(path.dirname(LOCAL_FILE), { recursive: true });
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(all, null, 2));
}

// ---- Public API ---------------------------------------------------------
export async function getAllFeedback(): Promise<Record<string, Feedback>> {
  const redis = getRedis();
  if (redis) {
    const raw = (await redis.hgetall<Record<string, Feedback>>(HASH_KEY)) || {};
    return raw;
  }
  return readLocal();
}

export async function saveFeedback(fb: Feedback): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.hset(HASH_KEY, { [fb.participantId]: fb });
    return;
  }
  const all = readLocal();
  all[fb.participantId] = fb;
  writeLocal(all);
}

export function isSharedBackendConfigured(): boolean {
  return getRedis() !== null;
}
