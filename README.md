# Chair Recommendation Review

A flashcard-style app where a subject-matter expert reviews AI ergonomic-chair
recommendations. It is loaded with **50 real assessment entries** (from
`50_sample_chair_codes`, cross-referenced by Entry Id with `final_1500_dataset_v2`).
For each entry the reviewer sees the assessment **photos**, the person's **body
measurements**, their **seating preferences**, **health conditions**, and their
**complaint about their current chair** — plus the **AI-recommended ErgoCentric
product code broken into its parts** (Series, Model, Mechanism, Seat, Air Lumbar,
Arms, Gas lift, Caster). Each part is a dropdown of the real options, so the
reviewer can **validate the code as-is or edit any part**; the app auto-detects
what changed and asks for a one-line explanation of why. Progress is saved and can
be picked up later; no password — the reviewer just types their email.

Because the feedback is stored in a shared database, **you can log in later with
your own email on the same link and see everything the technician submitted**,
and export it all to CSV.

---

## How the reviewer uses it

1. Open the link, type an email, click **Start reviewing**.
2. For each entry: look at the photos, measurements, preferences, health
   conditions and the person's complaint, and the **AI recommended code**. The
   same code appears as a set of dropdowns pre-set to the AI's choice.
3. If it's right, just **Validate & next**. If not, change any dropdown(s) — the
   code rebuilds live, the app lists exactly what you changed (e.g. *Mechanism:
   SG → ST*), and you write a one-sentence **why**. Then **Save edit & next**.
4. The numbered squares at the top jump to any card and are colour-coded
   (green = validated, blue = edited). You can go back and change any answer.
5. **Export CSV** downloads, per person: AI code, final code, validated/edited,
   the list of changes, the explanation, reviewer email, and timestamp.

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

## About the product code

The **AI recommended code comes straight from your data** — the
`ML Suggested Full Chair Code` column of `50_sample_chair_codes`. Each code is
parsed into its parts, e.g. `T-MBMESH-SG-TMBMS-TALSC-TCL360-125MMLT-NC`:

| Segment    | Component     | Example                          |
|------------|---------------|----------------------------------|
| `T`        | Series        | tCentric                         |
| `MBMESH`   | Model/finish  | Mesh, Midnight Black (omitted for foam) |
| `SG`       | Mechanism     | Synchro Glide                    |
| `TMBMS`    | Seat size     | Large mesh                       |
| `TALSC`    | Air Lumbar    | Air Lumbar 2 (built-in, black)   |
| `TCL360`   | Arms          | Height, lateral & swivel         |
| `125MMLT`  | Gas lift      | 125 mmLT pneumatic               |
| `NC`       | Caster        | Dual wheel nylon                 |

All option lists (Mechanism, Seat, Air Lumbar, Arms, Gas lift, Caster/Glide) are
transcribed from your diagram — see `lib/options.ts`. All 50 codes re-build back
to their exact original string. **Series** is an editable field (seeded `T`/`AIR2`)
because the diagram gave no series-code list; the **Model** segment is a dropdown
(foam = no code, or `MBMESH`). Send the real series / model / colour code lists and
they become fixed dropdowns too.

## Data & a caveat on photos

`data/participants.json` holds the 50 entries: measurements, preferences, health
conditions, the current-chair complaint, image paths, and the parsed AI code.

**Only 24 of the 50 entries have photos.** The source dataset's image links were
either **truncated** (e.g. `…/2021/12/1`) or **already deleted** from ergocentric.com
(older uploads return 404). The 24 recoverable photos were downloaded, resized, and
self-hosted in `public/images/`. Entries with no photo show a clean placeholder and
are still fully reviewable. If you have those images elsewhere, drop them in
`public/images/` as `e<EntryId>-1.jpeg` (and `-2`, `-3`) and they'll appear.

---

## Project layout

```
app/page.tsx            Login + code-builder review UI
app/api/feedback/route.ts   GET all feedback / POST one validation-or-edit
lib/options.ts          All product-code component options (from the diagram)
lib/store.ts            Redis (shared) with local-file fallback
data/participants.json  The 35 participants + measurements + AI selections
public/images/          Resized front/side photos (~130 KB each)
```
