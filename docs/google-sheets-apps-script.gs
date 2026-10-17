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
  "Received at", "Approved", "Name", "Rating", "Event", "Comment", "Review ID"
];
const CONTENT_HEADERS = ["Type", "ID", "Name", "Price", "Description", "URL", "Alt text", "Updated at"];

function setupSheets() {
  const spreadsheet = getSpreadsheet_();
  ensureSheet_(spreadsheet, "Enquiries", ENQUIRY_HEADERS);
  const reviews = ensureSheet_(spreadsheet, "Reviews", REVIEW_HEADERS);
  ensureHeaders_(reviews, REVIEW_HEADERS);
  ensureReviewIds_(reviews);
  ensureSheet_(spreadsheet, "Site Content", CONTENT_HEADERS);
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
        new Date(), true, safe_(data.name), Number(data.rating), safe_(data.event), safe_(data.comment), Utilities.getUuid()
      ]);
      return json_({ status: "saved" });
    }
    if (payload.event === "delete_review") {
      const sheet = spreadsheet.getSheetByName("Reviews");
      const row = findRow_(sheet, 7, safe_(data.id));
      if (row < 2) return json_({ error: "review_not_found" });
      sheet.deleteRow(row);
      return json_({ status: "saved" });
    }
    if (payload.event === "upsert_service") {
      upsertContent_(spreadsheet, "service", data);
      return json_({ status: "saved" });
    }
    if (payload.event === "upsert_image") {
      upsertContent_(spreadsheet, "image", data);
      return json_({ status: "saved" });
    }
    return json_({ error: "unsupported_event" });
  } finally {
    lock.releaseLock();
  }
}

function doGet(event) {
  if (!isAuthorised_(event)) return json_({ error: "unauthorised", reviews: [] });
  const view = event.parameter.view;
  if (view === "site_content") {
    setupSheets();
    const rows = getSpreadsheet_().getSheetByName("Site Content").getDataRange().getValues().slice(1);
    return json_({
      services: rows.filter(row => row[0] === "service").map(row => ({ id: safe_(row[1]), name: safe_(row[2]), price: safe_(row[3]), description: safe_(row[4]) })),
      images: rows.filter(row => row[0] === "image").map(row => ({ id: safe_(row[1]), url: safe_(row[5]), alt: safe_(row[6]) }))
    });
  }
  if (view !== "reviews" && view !== "approved_reviews" && view !== "admin_reviews") return json_({ status: "ok" });
  setupSheets();
  const sheet = getSpreadsheet_().getSheetByName("Reviews");
  const rows = sheet.getDataRange().getValues().slice(1);
  const reviews = rows
    .map(row => ({ id: view === "admin_reviews" ? safe_(row[6]) : undefined, name: safe_(row[2]), rating: Number(row[3]), event: safe_(row[4]), comment: safe_(row[5]) }))
    .filter(review => review.name && review.comment && review.rating >= 1 && review.rating <= 5)
    .reverse();
  return json_({ reviews: reviews });
}

function ensureHeaders_(sheet, headers) {
  const current = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), headers.length)).getValues()[0];
  headers.forEach((header, index) => {
    if (!current[index]) sheet.getRange(1, index + 1).setValue(header).setFontWeight("bold");
  });
}

function ensureReviewIds_(sheet) {
  if (sheet.getLastRow() < 2) return;
  const range = sheet.getRange(2, 7, sheet.getLastRow() - 1, 1);
  const values = range.getValues().map(row => [row[0] || Utilities.getUuid()]);
  range.setValues(values);
}

function findRow_(sheet, column, value) {
  if (!value || sheet.getLastRow() < 2) return -1;
  const values = sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getDisplayValues();
  const index = values.findIndex(row => row[0] === value);
  return index < 0 ? -1 : index + 2;
}

function upsertContent_(spreadsheet, type, data) {
  const sheet = spreadsheet.getSheetByName("Site Content");
  const id = safe_(data.id);
  if (!id) throw new Error("Content ID is required.");
  let row = -1;
  if (sheet.getLastRow() >= 2) {
    const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getDisplayValues();
    const index = rows.findIndex(item => item[0] === type && item[1] === id);
    if (index >= 0) row = index + 2;
  }
  const values = [[type, id, safe_(data.name), safe_(data.price), safe_(data.description), safe_(data.url), safe_(data.alt), new Date()]];
  if (row < 2) sheet.appendRow(values[0]);
  else sheet.getRange(row, 1, 1, CONTENT_HEADERS.length).setValues(values);
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
