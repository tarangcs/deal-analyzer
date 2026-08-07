# Deal Analyzer App — Build Spec

Purpose: a shared tool for our real estate investing group to quickly evaluate
wholesale/flip deals using the standard offer formula, save deals, and compare
them as a team.

## Core Formula

```
Max Allowable Offer (MAO) =
    ARV
    − Repair Cost
    − Holding Costs
    − Closing Costs
    − Target Assignment Fee / Profit Margin
```

- **ARV** (After Repair Value) — what the property is worth fully renovated.
  Sourced from a realtor / comps.
- **Repair Cost** — sourced from a contractor estimate.
- **Holding Costs** — mortgage, property taxes, insurance, utilities,
  maintenance, for the estimated holding period (input: monthly cost × number
  of months).
- **Closing Costs** — combined buying + selling transaction costs (commonly
  estimated as a % of ARV, e.g. 8–10% combined — should be user-editable).
- **Target Assignment Fee** — the wholesaler's desired profit; this is what's
  being solved for, or can be entered as a fixed dollar amount or % of deal.

## Required Inputs

| Field | Type | Notes |
|---|---|---|
| Property address / nickname | text | for labeling saved deals |
| ARV | currency | |
| Repair cost | currency | |
| Monthly holding cost | currency | mortgage+taxes+insurance+utilities+maintenance |
| Holding period (months) | number | default 3 |
| Closing cost % | percent | default 8% of ARV, editable |
| Target assignment fee | currency or % | default $10,000 or 10% |

## Outputs

- **Maximum Allowable Offer (MAO)** — the headline number
- **Total holding cost** (monthly × months)
- **Total closing cost** (% × ARV)
- **Projected ROI %** — assignment fee ÷ total cash needed (or ÷ MAO) — clarify
  which denominator the group wants; workshop convention was 10%+ = good deal
- **Deal quality flag** — e.g. green/yellow/red based on ROI thresholds
  (customizable, not hardcoded — group should be able to adjust the 10%
  threshold)

## Nice-to-Have Features

- **Save/list deals** — so the group can see everyone's analyzed properties in
  one place (shared storage, not just per-person)
- **Comparison view** — side-by-side of 2–3 saved deals
- **Editable defaults** — closing cost %, holding period, target fee/ROI
  threshold should all be adjustable, not hardcoded, since these vary by
  market and by how the group wants to operate
- **Notes field per deal** — free text for context (seller situation, contract
  status, who's working the lead)
- **Simple sensitivity check** — show how MAO changes if ARV or repair
  estimate is off by ±10%, since those are usually the least certain inputs

## Data & Sharing Considerations

- This is meant to be used by multiple group members — plan for shared,
  not just per-user, storage of saved deals so everyone can see the list.
- No sensitive personal data involved (property addresses and cost estimates
  only) — fine to keep lightweight.

## Design Notes

- Keep it simple and utilitarian — this is a working tool for quick deal
  triage, not a marketing site. Clarity of numbers matters more than visual
  flourish.
- Should work well on mobile, since deals often get evaluated in the field or
  on a phone while talking to a seller.
- Should be simple enough for non-technical group members (day jobs in
  accounting, IT, real estate) to use without instructions.

## Source Context

Formula and terminology taken from the Real Success wholesaling workshop
(ARV / Repair Cost / Holding Costs / Closing Costs → Max Offer; target ROI
10%+ cited as "good"). Comparable free tools already in use for reference:
DealCheck (dealcheck.io), Realeflow's free spreadsheet.
