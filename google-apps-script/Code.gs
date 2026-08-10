// Deal Analyzer backend — bound to the "Deal Analyzer — Deals" Google Sheet.
// Deployed as a Web App (Execute as: Me, Who has access: Anyone). See
// google-apps-script/README.md for deployment steps.
//
// Sheet columns are a mix of indexed fields (for the list/search view) and
// one JSON blob column holding the full Deal object (for detail/edit), so
// the Sheet doesn't need a migration every time the Deal shape grows.

const SHEET_NAME = 'Deals';
const HEADERS = [
  'id', 'createdAt', 'updatedAt',
  'evaluatorName', 'propertyAddress', 'status', 'date',
  'arv', 'purchasePrice', 'estimatedNetProfit', 'estimatedRoiPercent', 'dealQuality',
  'notes', 'archived', 'dealJson',
];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function rowToRecord_(headers, row) {
  const obj = {};
  headers.forEach(function (h, i) { obj[h] = row[i]; });
  obj.archived = obj.archived === true || obj.archived === 'true';
  try {
    obj.deal = JSON.parse(obj.dealJson || '{}');
  } catch (err) {
    obj.deal = {};
  }
  delete obj.dealJson;
  return obj;
}

function findRowIndexById_(sheet, id) {
  const data = sheet.getDataRange().getValues();
  const idCol = HEADERS.indexOf('id');
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === id) return i + 1; // 1-indexed sheet row
  }
  return -1;
}

/** GET: list all deals (including archived — the frontend filters). */
function doGet(e) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return jsonResponse_([]);
  const headers = data[0];
  const rows = data.slice(1).map(function (row) {
    return rowToRecord_(headers, row);
  });
  return jsonResponse_(rows);
}

/**
 * POST: create / update / archive / delete, routed by body.action, since
 * Web Apps only support GET and POST (no PUT/DELETE). Body is JSON; the
 * frontend must send it as text/plain to avoid an unsupported CORS
 * preflight (Apps Script doesn't care what Content-Type claims — it just
 * reads the raw body).
 *
 * Expected body shapes:
 *   { action: 'create', deal: {...}, evaluatorName, propertyAddress,
 *     status, date, arv, purchasePrice, estimatedNetProfit,
 *     estimatedRoiPercent, dealQuality, notes }
 *   { action: 'update', id, ...same fields as create }
 *   { action: 'archive', id, archived: true|false }
 *   { action: 'delete', id }
 */
function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const sheet = getSheet_();

  if (action === 'create') {
    const now = new Date().toISOString();
    const id = Utilities.getUuid();
    const row = HEADERS.map(function (h) {
      if (h === 'id') return id;
      if (h === 'createdAt' || h === 'updatedAt') return now;
      if (h === 'dealJson') return JSON.stringify(body.deal || {});
      if (h === 'archived') return false;
      return body[h] !== undefined ? body[h] : '';
    });
    sheet.appendRow(row);
    return jsonResponse_({ ok: true, id: id });
  }

  if (action === 'update') {
    const rowIndex = findRowIndexById_(sheet, body.id);
    if (rowIndex === -1) return jsonResponse_({ ok: false, error: 'not found' });
    const now = new Date().toISOString();
    HEADERS.forEach(function (h, colIndex) {
      if (h === 'id' || h === 'createdAt') return;
      if (h === 'updatedAt') {
        sheet.getRange(rowIndex, colIndex + 1).setValue(now);
        return;
      }
      if (h === 'dealJson') {
        // Only touch the stored deal blob if this update actually included
        // one — a partial update (e.g. just "notes") must not wipe it out.
        if (body.deal !== undefined) {
          sheet.getRange(rowIndex, colIndex + 1).setValue(JSON.stringify(body.deal));
        }
        return;
      }
      if (body[h] !== undefined) {
        sheet.getRange(rowIndex, colIndex + 1).setValue(body[h]);
      }
    });
    return jsonResponse_({ ok: true });
  }

  if (action === 'archive') {
    const rowIndex = findRowIndexById_(sheet, body.id);
    if (rowIndex === -1) return jsonResponse_({ ok: false, error: 'not found' });
    const archivedCol = HEADERS.indexOf('archived') + 1;
    sheet.getRange(rowIndex, archivedCol).setValue(body.archived !== false);
    return jsonResponse_({ ok: true });
  }

  if (action === 'delete') {
    const rowIndex = findRowIndexById_(sheet, body.id);
    if (rowIndex === -1) return jsonResponse_({ ok: false, error: 'not found' });
    sheet.deleteRow(rowIndex);
    return jsonResponse_({ ok: true });
  }

  return jsonResponse_({ ok: false, error: 'unknown action: ' + action });
}
