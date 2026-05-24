---
name: gmail-attachments-to-drive
description: Use this skill whenever you need an email attachment available outside Gmail — to reference, link, share, or file. The standard Gmail integrations don't expose attachment download; this skill works around that via a pre-deployed Apps Script that uploads attachments to Drive based on a Gmail label. Trigger whenever the user mentions tickets, receipts, invoices, contracts, boarding passes, or any emailed document they want to work with elsewhere.
---

# Gmail attachments to Drive (via label)

A pre-deployed Apps Script ([github.com/LSRCT/Gmail-MCP-Attachments](https://github.com/LSRCT/Gmail-MCP-Attachments)) bridges Gmail to Drive: when a Gmail thread has the `DriveUpload` label, every real attachment is uploaded to `EmailAttachments` in Drive within ~60 seconds, named `gmsg-{threadId}__{originalFilename}`. Label is removed after upload.

## Workflow

1. Find the thread via `Gmail:search_threads`.
2. Get the `DriveUpload` label ID once via `Gmail:list_labels`.
3. Apply the label with `Gmail:label_thread`.
4. Do other work for ~30s (parsing, drafting, etc.).
5. Find the file via `Google Drive:search_files` with `title contains 'gmsg-{threadId}'`. Use the returned `viewUrl`.

## When there's no file

Some emails embed everything inline (QR codes, HTML-only tickets). The Drive search returns empty. Fall back to linking the Gmail message itself:

```
https://mail.google.com/mail/u/0/#inbox/{threadId}
```

Rule: search Drive after labeling. Found → use `viewUrl`. Not found → Gmail URL. One retry after ~30s, then commit.

## If the script isn't installed

A search for `title contains 'gmsg-'` returning nothing across multiple threads means the script isn't deployed. Point the user to the repo for setup; don't try this workflow without it.
