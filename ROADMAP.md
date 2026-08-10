# Deal Analyzer — Build Roadmap

## Context

The real estate investing group needs a shared web app to replace the
`deal-analyzer-worksheet.xlsx` spreadsheet for evaluating wholesale/flip
deals. Two source documents exist in this folder:

- `deal-analyzer-app-spec.md` — describes a simplified MAO (Max Allowable
  Offer) wholesale formula.
- `deal-analyzer-worksheet.xlsx` — the group's actual working spreadsheet,
  which is significantly more detailed: property info, financing costs
  (up to 3 mortgages/liens with points & interest), monthly holding costs,
  buying transaction costs, selling transaction costs, and a full net
  profit / ROI snapshot.

v1 targets the **full flip-deal model from the Excel file** (not the
simplified spec version), since that's what the group actually uses
today. The xlsx contains a worked example (123 Main St, Cleveland) with
known-correct outputs — that becomes the test fixture (see `CLAUDE.md`)
so every iteration can be checked for correctness, not just "does it
render."

Decisions locked in:
- **Frontend/backend split**: React frontend + Google Sheets as the shared
  datastore (no custom server).
- **Auth**: none for v1 (unlisted URL). Designed so a shared passcode can
  be bolted on later without a rearchitecture.
- **AI feature**: none for v1 — revisit once the core calculator works.
- Build in small, independently testable iterations — no big-bang steps.

## Architecture

**Frontend**: Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui for
a premium look with minimal custom CSS — cards, inputs, tables, tabs,
dialogs all come pre-styled and accessible. Icons via `lucide-react`. No
Next.js needed — there's no server-rendered content and no backend
functions to host, since Google Sheets + Apps Script plays that role
instead.

**State**: plain React state/hooks for the calculator form. No Redux/
Zustand — the app is small enough that prop drilling / a couple of context
providers (deals list, settings) is simpler and easier for future
non-expert contributors to read.

**Calculation engine**: all formulas live in one isolated module,
`src/lib/calculations.ts`, pure functions with no React/UI dependencies.
This is the highest-risk part of the app (money math) — see the golden
test fixture in `CLAUDE.md`, checked to the cent on every change.

**Shared storage**: a dedicated Google Sheet ("Deal Analyzer — Deals") with
one row per saved deal, fronted by a **Google Apps Script Web App** bound
to that sheet. The script exposes `doGet` (list/get deals), `doPost`
(create/update a deal), and delete/archive (via `doPost` with an action
param, since Apps Script Web Apps only support GET/POST), returns JSON,
and deploys with "Anyone with the link" access — no credentials to
manage, no server to host, and it's genuinely just "React talking to a
Google Sheet." Known gotchas are in `CLAUDE.md`.

**Hosting**: static frontend deployed to Vercel (free tier, zero-config
for a Vite app, easy custom domain later).

## Known Risks & Tradeoffs (accepted for v1)

- **No-auth means the API isn't really private, just unlisted.** Since
  the Apps Script endpoint is called directly from browser JS, its URL is
  visible to anyone who opens devtools on the page — not just people
  who received the link. Fine for a small trusted group; revisit if the
  app ever gets a wider audience.
- **Apps Script has daily execution quotas** on consumer Google accounts.
  A non-issue at this group's scale, but worth knowing if usage ever
  grows a lot.
- **Backups**: Google Sheets' built-in version history is the backup
  mechanism for v1 — no separate export/backup step planned.

## Step-by-Step Iterations

Each step ends with a concrete test before moving on. See `CLAUDE.md` for
the working agreement (one step per turn, model choice, `/cost` habits).

1. **Scaffold** — Vite + React + TS + Tailwind + shadcn/ui, deployed to
   Vercel. Test: blank branded shell loads at a public URL, on both
   desktop and phone widths. ✅ **Done.**
2. **Calculator UI, part 1: Property + Pricing inputs** ✅ **Done.** —
   evaluator name,
   date, address, sq ft, units, occupied, description, status (New /
   Under Contract / Passed / Closed), ARV, as-is value, repair cost,
   purchase price, hold months. Client-side only, no persistence yet.
   Includes: basic validation (required fields, non-negative numbers),
   inline help text sourced from the xlsx's "Definitions" tab (it's
   already-written plain-English copy for every field — reuse it rather
   than writing new copy), and draft-autosave to `localStorage` as you
   type, so a dropped call or app switch mid-entry doesn't lose data.
   These three patterns (validation, tooltip source, draft-autosave)
   carry forward into every input section added in Steps 3–7. Test:
   enter the sample deal's inputs, confirm Purchase+Repair total is
   correct; kill the tab mid-entry and confirm the draft reloads.
3. **Financing Costs section** ✅ **Done.** — up to 3 mortgage/lien slots (amount,
   points, interest rate) with computed points cost, interest cost, and
   totals. Test against the $6,266.67 total financing figure.
4. **Holding Costs section** ✅ **Done.** — taxes, HOA, insurance, utilities (gas/
   water/electric/misc), misc — monthly + total-over-hold-period. Test
   against $387.50/mo, $775 total.
5. **Buying + Selling Transaction Costs sections** ✅ **Done.** Test against
   $1,837.50 buying / $11,700 selling.
6. **Deal Summary & ROI panel** ✅ **Done.** — net profit, cost-per-sqft, down payment
   required, committed capital, Purchase+Rehab ROI, fully-loaded ROI, and
   a green/yellow/red deal-quality flag against a user-editable ROI
   threshold. Test: full end-to-end run of the sample deal matches all
   golden values above.
7. **Editable defaults / settings panel** ✅ **Done.** — closing-cost assumptions,
   default hold period, ROI threshold — stored in `localStorage` for now.
   Test: change a default, confirm it flows into a fresh calculation.
8. **Google Sheet + Apps Script backend** ✅ **Done.** — create the "Deals" sheet,
   write the Apps Script with `doGet`/`doPost` (create, update, delete/
   archive via an action param), deploy as Web App. Test independently
   of the frontend via `curl`/Postman: list returns `[]`, post appends a
   row, delete/update mutate the right row.
9. **Wire up Save Deal** ✅ **Done.** from the React form to the Apps Script endpoint.
   Test: save the sample deal, confirm the row appears correctly in the
   Google Sheet.
10. **Deals List view** ✅ **Done.** — fetch & display saved deals (mobile-friendly
    table/card list), with sort (date, ROI) and search/filter (by
    address, by status, and evaluator — a simple self-service "find my
    deals" filter instead of real login). Test: list reflects what's
    actually in the sheet, including deals added manually in Sheets;
    filtering by status and searching by address both narrow correctly.
11. **Deal detail + Comparison view** ✅ **Done.** — open a saved deal, select 2–3
    deals to compare side by side. Test with 3 distinct saved sample
    deals.
12. **Edit + Delete/Archive a saved deal** ✅ **Done.** — from the detail view, edit
    any field and re-save (updates the existing Sheet row, doesn't
    duplicate it) or delete/archive it. Test: edit the sample deal's
    repair cost, confirm the Sheet row updates in place and MAO/ROI
    recompute; delete a test deal, confirm it's gone from the list.
13. **Notes field per deal** + empty/loading/error states polish.
14. **Sensitivity check** — ±10% ARV/repair swing shown on deal detail.
    Test against hand-computed ±10% values for the sample deal.
15. **Visual & mobile polish pass** — typography, spacing, color system;
    confirm numeric fields bring up the phone's number pad
    (`inputMode="decimal"`); responsive check on real phone viewport
    sizes.
16. **Ship** — walk the group through it, save 1–2 real in-flight deals
    together as a live test.

## Deferred (not in v1, revisit later)

- Auth (shared passcode is a small addition to the Apps Script + a login
  gate component whenever you want it).
- AI-assisted input (e.g., paste a listing description to auto-fill
  fields) — easy to slot in as its own iteration once the core tool is in
  daily use, using a cheap model to keep costs low.

## Verification

- Unit tests (Vitest) on `calculations.ts` against the golden fixture in
  `CLAUDE.md`, run after every iteration that touches math.
- Manual browser check (desktop + mobile viewport) after every UI-facing
  step.
- Apps Script endpoints tested directly (curl/Postman) before wiring the
  frontend to them, so backend bugs aren't confused with frontend bugs.
