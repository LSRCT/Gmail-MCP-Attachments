/**
 * Apps Script: sync labeled-email attachments to Drive.
 *
 * Apply the "DriveUpload" label to any Gmail thread. Within ~1 minute,
 * every (non-inline) attachment is uploaded to the "EmailAttachments"
 * folder in Drive, named with the thread ID. Label is removed on success.
 *
 * Deploy: paste, click Run, authorize. Done.
 * Uninstall: delete the trigger from the Triggers panel in the editor.
 */

const FOLDER_NAME = 'EmailAttachments';
const LABEL_NAME  = 'DriveUpload';
const MAX_THREADS = 50;
const MAX_BYTES   = 25 * 1024 * 1024; // 25 MB

function syncLabeledEmailsToDrive() {
  ensureTrigger_();

  const label   = GmailApp.getUserLabelByName(LABEL_NAME) || GmailApp.createLabel(LABEL_NAME);
  const folder  = getOrCreateFolder_(FOLDER_NAME);
  const threads = label.getThreads(0, MAX_THREADS);

  let uploaded = 0, skipped = 0, errors = 0;

  for (const thread of threads) {
    let threadHadFailures = false;

    try {
      const threadId = thread.getId();

      for (const msg of thread.getMessages()) {
        const attachments = msg.getAttachments({
          includeInlineImages: false,
          includeAttachments:  true
        }).filter(a => a.getSize() > 0 && a.getSize() <= MAX_BYTES);

        for (const att of attachments) {
          const safeName = `gmsg-${threadId}__${sanitize_(att.getName())}`;

          if (folder.getFilesByName(safeName).hasNext()) {
            skipped++;
            continue;
          }

          try {
            folder.createFile(att.copyBlob().setName(safeName));
            uploaded++;
          } catch (innerErr) {
            errors++;
            threadHadFailures = true;
            Logger.log(`Upload failed for "${safeName}": ${innerErr.message}`);
          }
        }
      }

      if (!threadHadFailures) thread.removeLabel(label);
    } catch (err) {
      errors++;
      Logger.log(`Thread ${thread.getId()} failed: ${err.message}`);
    }
  }

  Logger.log(`Uploaded: ${uploaded}, Skipped (dup): ${skipped}, Errors: ${errors}`);
}

function ensureTrigger_() {
  const exists = ScriptApp.getProjectTriggers()
    .some(t => t.getHandlerFunction() === 'syncLabeledEmailsToDrive');
  if (!exists) {
    ScriptApp.newTrigger('syncLabeledEmailsToDrive').timeBased().everyMinutes(1).create();
    Logger.log('Trigger installed: every 1 minute.');
  }
}

function getOrCreateFolder_(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}

function sanitize_(name) {
  return String(name).replace(/[\/\\]/g, '_').slice(0, 150);
}
