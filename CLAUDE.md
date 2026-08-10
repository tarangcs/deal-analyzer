# Deal Analyzer

Shared web app for the real estate group to evaluate wholesale/flip deals,
replacing `deal-analyzer-worksheet.xlsx`. Full build roadmap and step
checklist: `ROADMAP.md` in this repo.

## Stack

- Vite + React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui (`base-nova`
  style, `@base-ui/react` primitives, Geist Variable font).
- No backend server: Google Sheets is the shared datastore, fronted by a
  Google Apps Script Web App (`doGet`/`doPost`).
- Hosting: Vercel (static frontend).
- No auth in v1 (unlisted URL) — see "Known Risks" in the plan file.

## Gotcha: shadcn CLI + `@/` alias

`npx shadcn@latest add <component>` in this repo writes files to a
literal `./@/components/ui/...` directory instead of resolving the `@/`
alias to `src/`. After every `shadcn add`, move the new files into
`src/components/ui/` (or `src/lib/`) and `rm -rf ./@`. Check for this
before assuming a newly added component is where the CLI claims.

## Gotcha: two GitHub remotes, only one deploys

Vercel's project ("deal-analyzer-app-1", live at
https://deal-analyzer-app-1.vercel.app/) is connected to
`tarangcs/deal-analyzer-app-1`, NOT `tarangcs/deal-analyzer` (the repo
this project was originally pushed to — it's a mirror created by an
earlier Vercel import mishap). Both remotes are configured locally:

```
origin  https://github.com/tarangcs/deal-analyzer.git
app1    https://github.com/tarangcs/deal-analyzer-app-1.git
```

**Push to both on every commit** (`git push origin main && git push app1
main`) until this gets consolidated into a single repo. Pushing only to
`origin` will NOT deploy — confirmed the hard way (a full commit sat
unbuilt with zero deployment attempts in Vercel's dashboard until a
fresh push to `app1` triggered it). Also note: GitHub→Vercel webhook
delivery has been observed to silently miss an event once already — if
a push to `app1` doesn't produce a new deployment within ~2 minutes, an
empty commit (`git commit --allow-empty`) + push is a reliable
workaround.

## Gotcha: dark mode is OS-preference-only, not class-based

This app has no manual theme toggle — dark mode should just follow the
visitor's OS/browser preference. The shadcn scaffold's generated CSS
assumed a class-based toggle instead (`@custom-variant dark (&:is(.dark
*));` plus a `.dark { ... }` selector block), which needs a literal
`.dark` class added to an ancestor element — nothing in this app ever
adds one, so dark mode silently never activated regardless of system
setting. Fixed in `src/index.css` by deleting the `@custom-variant`
line and wrapping the dark variable values in
`@media (prefers-color-scheme: dark) { :root { ... } }` instead. If a
manual toggle is ever added later, this needs to flip back to the
class-based approach.

Relatedly: native form widgets (checkboxes, date pickers, scrollbars)
default to light rendering even against a dark page background unless
the page opts in via the `color-scheme` CSS property. `:root` now sets
`color-scheme: light dark;` so those widgets pick the right variant.

## Commands

- `npm run dev` — dev server
- `npm run build` — `tsc -b && vite build`
- `npm run lint` — oxlint
- `npm run preview` — preview production build

## Working agreement

- **One roadmap step per turn.** Implement → test → commit → stop. Don't
  batch multiple roadmap steps into one turn.
- Stay on Sonnet 5 (default model) for implementation. No Explore/Plan/
  general-purpose subagents for this repo — it's small enough that direct
  reads/edits are cheaper.
- At the end of each verified/committed step, remind the user to run
  `/cost` and check usage before starting the next step, and suggest
  `/clear` once a step is committed.

## Calculation engine

All money-math formulas live in `src/lib/calculations.ts` as pure
functions with no React dependency. They're checked against this golden
fixture (from the xlsx's real worked example, 123 Main St, Cleveland OH)
to the cent, every time the calculations module changes:

```
Inputs:
  ARV: $250,000   Purchase Price: $175,000   Repair: $10,000   Hold: 2 months
  1st mortgage: $130,000 / 2 pts / 12%
  2nd mortgage: $25,000 / 2 pts / 4%
  Misc mortgage: $10,000 / 2 pts / 12%
  Property tax: $1,200/yr   Insurance: $1,050/yr
  Utilities: gas $75, water $75, electric $50 (monthly)
  Escrow/attorney (buying): $900   Title ins/search: 0.25% of purchase
  Escrow/attorney (selling): $900   Recording: $500
  Realtor fees: 3% of ARV   Transfer/conveyance: 0.12% of ARV
  Home warranty: $500   Staging: $1,500   Marketing: $500

Expected outputs:
  Total Financing Costs:        $6,266.67
  Total Monthly Holding Costs:  $387.50   (→ $775 over the 2-month hold)
  Total Buying Costs:           $1,837.50
  Total Selling Costs:          $11,700.00
  Estimated Net Profit:         $44,420.83
  Purchase+Rehab ROI:           24.01%
  Estimated ROI (fully loaded): 21.61%
```

## Google Apps Script backend (Steps 8+)

- Deployed and verified working (Step 8). Web App URL — needed for Step
  9's frontend fetch calls:
  `https://script.google.com/macros/s/AKfycbwqRJ-jeE4wUjVIVYNjBk2EMgbfGoz3e4JTHxcaNwcvFWQxDgPlA6XrITyX15PJIdklAA/exec`
  Not a secret to guard like a password — see "Known tradeoffs" below —
  but it's the single access point to the shared data, so don't post it
  outside this repo/team.
- Source lives at `google-apps-script/Code.gs`, deployed by hand via
  script.google.com (no CLI for this). See
  `google-apps-script/README.md` for full deploy steps.
- Whichever Google account hosts the "Deal Analyzer — Deals" Sheet + its
  bound Apps Script owns the deployment.
- **After every Apps Script code edit, a new Web App version must be
  manually deployed** for the live endpoint to pick up the change —
  confirmed the hard way twice during Step 8 (Save alone does nothing to
  the live URL; it's Deploy → Manage deployments → pencil icon → New
  version → Deploy).
- **curl vs. real clients**: `curl -L` on a POST to the `/exec` URL
  reliably shows a "Page Not Found" Google Drive error page, even though
  the request executes and writes correctly server-side every time —
  confirmed by checking via a follow-up GET. This is specific to how
  curl follows Apps Script's double-redirect response delivery; a real
  browser's `fetch()` (what Step 9 will use) hasn't shown this problem
  in Apps Script's documented behavior. When testing this backend with
  curl, verify effects via a follow-up GET rather than trusting the
  POST response body.
- `doPost` from `fetch` needs the `text/plain` content-type workaround for
  Apps Script's CORS handling.
- Sheet schema: a few indexed columns (id, evaluatorName, propertyAddress,
  status, date, arv, purchasePrice, estimatedNetProfit,
  estimatedRoiPercent, dealQuality, notes, archived) for the Step 10
  list/search view, plus one `dealJson` column holding the full `Deal`
  object — so Deal shape changes don't need a Sheet migration. `update`
  only touches `dealJson` when the request actually includes a `deal`
  field (a partial update, e.g. just `notes`, must not wipe it out —
  this was a real bug, caught and fixed during Step 8 verification).

## Known tradeoffs (v1, accepted — see plan file for detail)

- No auth: the Apps Script URL is visible in browser devtools to anyone
  who loads the page, not just people who received the link.
- Google Sheets' built-in version history is the only backup mechanism.
