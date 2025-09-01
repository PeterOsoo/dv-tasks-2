/**
 * 🔗 Slack webhook URL for QA notifications.
 * ⚠️ Do NOT commit your real URL to GitHub. 
 * Instead, replace this with your actual webhook in a private copy,
 * or store it securely (e.g., in PropertiesService).
 */
const QA_WEBHOOK_URL = "YOUR_QA_SLACK_WEBHOOK_URL_HERE";

/**
 * Sends the active row's task details to the QA Slack channel.
 * Requires:
 *  - "data" sheet
 *  - Task link present in Column K
 *
 * @param {string} [additionalInfo] - Optional extra context to include in the message.
 */
function sendQATaskToSlack(additionalInfo = "") {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("data");
  const row = sheet.getActiveRange().getRow();
  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Extract task details
  const componentName = rowData[3] || "";                  // Column D
  const taskTitle     = rowData[4] || "Untitled Task";     // Column E
  const taskNotes     = rowData[9] || "No notes provided"; // Column J
  const taskLink      = rowData[10] || "";                 // Column K

  if (!taskLink) {
    SpreadsheetApp.getUi().alert("⚠️ Task link (Column K) is required before sending to QA Slack.");
    return;
  }

  // Build Slack message
  const message =
    `*Component:* ${componentName}\n` +
    `*Task:* ${taskTitle}\n` +
    `*Notes:* ${taskNotes}\n` +
    (additionalInfo ? `*Additional Info:* ${additionalInfo}\n` : "") +
    `🔗 <${taskLink}|Open Task>`;

  const payload = { text: message };

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    UrlFetchApp.fetch(QA_WEBHOOK_URL, options);
    ss.toast(`✅ QA Slack message sent for: ${taskTitle}`, "Done", 3);
  } catch (err) {
    SpreadsheetApp.getUi().alert("❌ Failed to send QA Slack message. Check the webhook URL.");
    console.error(err);
  }
}
