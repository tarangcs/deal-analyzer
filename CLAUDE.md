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

- Whichever Google account hosts the "Deal Analyzer — Deals" Sheet + its
  bound Apps Script owns the deployment.
- **After every Apps Script code edit, a new Web App version must be
  manually deployed** for the live endpoint to pick up the change — easy
  to forget and debug the wrong thing.
- `doPost` from `fetch` needs the `text/plain` content-type workaround for
  Apps Script's CORS handling.

## Known tradeoffs (v1, accepted — see plan file for detail)

- No auth: the Apps Script URL is visible in browser devtools to anyone
  who loads the page, not just people who received the link.
- Google Sheets' built-in version history is the only backup mechanism.
