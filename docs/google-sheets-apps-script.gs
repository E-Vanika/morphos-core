/**
 * Monika Glam Up enquiry + review endpoint.
 *
 * 1. Create a Google Sheet, copy its ID from the URL, and create a project at
 *    https://script.google.com (Extensions > Apps Script also works).
 * 2. Paste this file. In Project Settings > Script properties, set WEBHOOK_KEY
 *    and SPREADSHEET_ID, then run setupSheets once.
 * 3. Deploy as a Web app (execute as you; access: anyone), then set
 *    GOOGLE_SHEETS_WEBHOOK_URL to the deployment URL plus ?key=YOUR_KEY.
 */

const ENQUIRY_HEADERS = [
  "Received at", "Status", "Name", "Mobile", "Service", "Event date",
  "Event time", "Event place", "Clients", "Details"
];
const REVIEW_HEADERS = [
  "Received at", "Approved", "Name", "Rating", "Event", "Comment"
];

function setupSheets() {
  const spreadsheet = getSpreadsheet_();
  ensureSheet_(spreadsheet, "Enquiries", ENQUIRY_HEADERS);
  ensureSheet_(spreadsheet, "Reviews", REVIEW_HEADERS);
}

function doPost(event) {
  if (!isAuthorised_(event)) return json_({ error: "unauthorised" });
  const payload = JSON.parse(event.postData.contents || "{}");
  const data = payload.data || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    setupSheets();
    const spreadsheet = getSpreadsheet_();
    if (payload.event === "new_enquiry") {
      spreadsheet.getSheetByName("Enquiries").appendRow([
        new Date(), "New", safe_(data.customer_name), safe_(data.phone),
        safe_(data.requested_service), safe_(data.event_date), safe_(data.event_time),
        safe_(data.event_place), safe_(data.client_count), safe_(data.details)
      ]);
      return json_({ status: "saved" });
    }
    if (payload.event === "new_review") {
      spreadsheet.getSheetByName("Reviews").appendRow([
        new Date(), false, safe_(data.name), Number(data.rating), safe_(data.event), safe_(data.comment)
      ]);
      return json_({ status: "pending" });
    }
    return json_({ error: "unsupported_event" });
  } finally {
    lock.releaseLock();
  }
}

function doGet(event) {
  if (!isAuthorised_(event)) return json_({ error: "unauthorised", reviews: [] });
  if (event.parameter.view !== "approved_reviews") return json_({ status: "ok" });
  setupSheets();
  const sheet = getSpreadsheet_().getSheetByName("Reviews");
  const rows = sheet.getDataRange().getValues().slice(1);
  const reviews = rows
    .filter(row => row[1] === true || String(row[1]).toLowerCase() === "true")
    .map(row => ({ name: safe_(row[2]), rating: Number(row[3]), event: safe_(row[4]), comment: safe_(row[5]) }))
    .filter(review => review.name && review.comment && review.rating >= 1 && review.rating <= 5)
    .reverse()
    .slice(0, 20);
  return json_({ reviews: reviews });
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }
  return sheet;
}

function getSpreadsheet_() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (spreadsheetId) return SpreadsheetApp.openById(spreadsheetId);
  const active = SpreadsheetApp.getActive();
  if (!active) throw new Error("Set SPREADSHEET_ID in Project Settings > Script properties.");
  return active;
}

function isAuthorised_(event) {
  const expected = PropertiesService.getScriptProperties().getProperty("WEBHOOK_KEY");
  return Boolean(expected && event && event.parameter && event.parameter.key === expected);
}

function safe_(value) {
  const text = value == null ? "" : String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
