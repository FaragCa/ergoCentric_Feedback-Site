# Chair Recommendation Review

A flashcard-style app where a subject-matter expert reviews AI ergonomic-chair
recommendations. For each of the 35 participants the reviewer sees the front &
side photos, the body measurements, and the **AI-recommended ErgoCentric product
code broken into its parts** (Series, Color, Model, Mechanism, Seat, Air Lumbar,
Arms). Each part is a dropdown of the real options, so the reviewer can **validate
the code as-is or edit any part**; the app auto-detects what changed and asks for
a one-line explanation of why. Progress is saved and can be picked up again later;
there is no password — the reviewer just types their email.

Because the feedback is stored in a shared database, **you can log in later with
your own email on the same link and see everything the technician submitted**,
and export it all to CSV.

---

## How the reviewer uses it

1. Open the link, type an email, click **Start reviewing**.
2. For each person: look at the photos + measurements and the **AI recommended
   code**. The same code appears as a set of dropdowns pre-set to the AI's choice.
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

The code follows the ErgoCentric scheme, e.g. `t-MBMESH-SG-TMBMSS-TALSC-TCL360`:

| Segment  | Component  | Example      |
|----------|------------|--------------|
| `t`      | Series     | tCentric     |
| `MB`     | Color      | Midnight Black |
| `MESH`   | Model      | Mesh         |
| `SG`     | Mechanism  | Synchro Glide |
| `TMBMSS` | Seat size  | Small mesh   |
| `TALSC`  | Air Lumbar | Air Lumbar 2 (built-in, black) |
| `TCL360` | Arms       | Height, lateral & swivel |

The option lists for Mechanism, Seat, Air Lumbar and Arms are transcribed exactly
from your diagram (see `lib/options.ts`) and are proper dropdowns.

**The AI recommendation is placeholder logic** — the source data had no codes, so
each person is seeded as a tCentric mesh chair with the **seat size derived from
their measurements** (buttock-to-knee depth) and the mechanism nudged to Plus-Size
Multi-Tilt for very heavy users; everything else matches the sample defaults. Edit
the rules in `data/participants.json` (each person has an `"ai"` object) to change
what the AI proposes.

> **Series, Color and Model** had no option list in the diagram, so they are shown
> as **editable text fields** seeded with the sample values (`t` / `MB` / `MESH`),
> with the Series names offered as suggestions. Send me the real Color/Model codes
> and Series-code list and they become fixed dropdowns like the rest. To wire this
> yourself: add the options to `lib/options.ts` and move those keys out of
> `FREE_TEXT`.

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
