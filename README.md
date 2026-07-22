# Chair Recommendation Review

A flashcard-style app where a subject-matter expert reviews AI ergonomic-chair
recommendations. For each of the 35 participants the reviewer sees the front &
side photos, the body measurements, and **two chair codes** — the *original* and
the *AI recommended* — then **approves** or **disapproves** (with a one-line
reason). Progress is saved and can be picked up again later; there is no password
— the reviewer just types their email.

Because the feedback is stored in a shared database, **you can log in later with
your own email on the same link and see everything the technician submitted**,
and export it all to CSV.

---

## How the reviewer uses it

1. Open the link, type an email, click **Start reviewing**.
2. For each person: look at the photos + measurements, compare **Original code**
   vs **AI recommended** code.
3. Click **Approve** or **Disapprove**. Disapprove requires a short reason.
4. **Save & next** moves on. The numbered squares at the top jump to any card and
   are colour-coded (green = approved, red = disapproved). You can go back and
   edit any previous answer at any time.
5. **Export CSV** downloads every decision + reason.

---

## Deploy to Vercel (what you asked for)

### 1. Put this folder on GitHub
Push **this `app-build` folder** (not the parent folder with the huge original
photos) to a new GitHub repo.

```bash
cd app-build
git init
git add .
git commit -m "Chair recommendation review app"
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

### 2. Import into Vercel
- Go to **vercel.com → Add New → Project → import your GitHub repo**.
- Framework is auto-detected as **Next.js**. Click **Deploy**.
- You now have a live link. It already works — but in "demo mode" feedback is
  not yet shared (you'll see an amber banner). Do step 3 to turn on the shared
  database.

### 3. Turn on the shared database (so you can see the technician's answers)
In your Vercel project:
- Open the **Storage** tab → **Create Database** → choose **Upstash for Redis**
  (Marketplace, free tier) → connect it to this project.
- Vercel automatically adds the required environment variables
  (`KV_REST_API_URL` / `KV_REST_API_TOKEN`, or the `UPSTASH_REDIS_REST_*`
  equivalents) to the project.
- Go to **Deployments → … → Redeploy** so the new variables take effect.

That's it. The amber "demo mode" banner disappears and every reviewer's feedback
is now saved centrally. Share the link with the technician; log in yourself later
with your own email to review and **Export CSV**.

> No database = the app still runs, but feedback only lives in whoever's browser
> made it and is **not** shared. The database is what makes cross-person viewing
> work.

---

## Run it locally (optional)

```bash
npm install
npm run dev      # http://localhost:3000
```

Locally, with no database configured, feedback is saved to a file at
`.data/feedback.json` so you can try the full flow.

---

## About the chair codes  ⚠️ placeholder logic

The source Excel/photos contained **no chair codes**, so both codes are generated
from the body measurements as sensible placeholders:

- **Original code** — a coarse "legacy" rule using only height & weight.
- **AI recommended code** — a detailed rule using the 6 measurements (hip width,
  seat depth, shoulder width, weight).

Code format is `EG-<width A–D><depth 1–3>-<back L/H/X>`. The two rules disagree
for 29 of 35 people, which gives the reviewer real decisions to make.

**To use your real codes:** edit `data/participants.json` — each person has an
`"originalCode"` and `"aiCode"` field. Change the values, set `"codesDiffer"` to
`true`/`false` accordingly, commit, and push; Vercel redeploys automatically.

---

## Project layout

```
app/page.tsx            Login + flashcard review UI
app/api/feedback/route.ts   GET all feedback / POST one decision
lib/store.ts            Redis (shared) with local-file fallback
data/participants.json  The 35 participants + measurements + codes
public/images/          Resized front/side photos (~130 KB each)
```
