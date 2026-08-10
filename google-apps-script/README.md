# Deal Analyzer — Apps Script backend

`Code.gs` is the source of truth, version-controlled here. Deployment
itself has to happen in Google's web UI (script.google.com) — there's no
CLI for this — so it's copy-pasted in manually rather than deployed from
this repo.

## Deploy steps

1. Create a new Google Sheet named **"Deal Analyzer — Deals"**. Leave it
   otherwise empty — the script creates its own `Deals` tab with headers
   on first run.
2. In that Sheet: **Extensions → Apps Script**. This opens a script
   project already bound to the Sheet.
3. Delete the default boilerplate in `Code.gs` (the editor's, not this
   one) and paste in the full contents of this repo's
   `google-apps-script/Code.gs`.
4. Save the project (any name is fine, e.g. "Deal Analyzer Backend").
5. **Deploy → New deployment**:
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (not "Anyone with Google account" — the
     app has no auth in v1, see `ROADMAP.md`'s Known Risks)
6. Authorize when prompted (first deploy only) — this is your own script
   accessing your own Sheet, so the "unverified app" warning is expected;
   proceed through it.
7. Copy the **Web app URL** from the deployment dialog. That's the
   endpoint the frontend will call in Step 9 — save it somewhere durable
   (it's needed for the app's env config).

## Gotcha: redeploying after edits

Editing `Code.gs` in the script editor does **not** update the live Web
App URL's behavior by itself. After any code change: **Deploy → Manage
deployments → (pencil icon on the active deployment) → New version →
Deploy**. Skipping this is the single most common "why isn't my change
showing up" trap with Apps Script.

## Verifying it works (no frontend needed)

Replace `<WEB_APP_URL>` with the URL from step 7:

```bash
# List (should return [] on a fresh sheet)
curl -s <WEB_APP_URL>

# Create
curl -s -X POST <WEB_APP_URL> \
  -H "Content-Type: text/plain" \
  -d '{
    "action": "create",
    "evaluatorName": "Jordan",
    "propertyAddress": "123 Main St, Cleveland, OH 44113",
    "status": "New",
    "date": "2026-01-01",
    "arv": 250000,
    "purchasePrice": 175000,
    "estimatedNetProfit": 44420.83,
    "estimatedRoiPercent": 21.61,
    "dealQuality": "good",
    "notes": "",
    "deal": { "property": { "arv": 250000 } }
  }'

# List again — should show the created row, and capture its "id"
curl -s <WEB_APP_URL>

# Update (swap <ID> for the id from above)
curl -s -X POST <WEB_APP_URL> \
  -H "Content-Type: text/plain" \
  -d '{"action":"update","id":"<ID>","notes":"updated via curl"}'

# Archive
curl -s -X POST <WEB_APP_URL> \
  -H "Content-Type: text/plain" \
  -d '{"action":"archive","id":"<ID>","archived":true}'

# Delete
curl -s -X POST <WEB_APP_URL> \
  -H "Content-Type: text/plain" \
  -d '{"action":"delete","id":"<ID>"}'
```

Note: even though these examples send `Content-Type: text/plain`
deliberately (matching what the frontend will do in Step 9 to avoid a
CORS preflight), `curl -d` with a JSON string works fine here since Apps
Script reads the raw body regardless of the declared content type.
