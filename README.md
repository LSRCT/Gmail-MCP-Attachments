# Gmail-MCP-Attachments

Workaround to enable AI agents to interact with gmail attachements.

## Problem
Stock gmail MCP has no way for llms to look at attachment data. (hopefully soon: https://github.com/modelcontextprotocol/servers/issues/4122)


## Workaround
- Agent labels mail with new "DriveUpload" label
- New google script uploads all attachments from labeled mails
- Agent can interact with file on drive

## Setup

1. New Apps Script project at [script.google.com](https://script.google.com), paste `syncLabeledEmailsToDrive.gs`.
2. Run `syncLabeledEmailsToDrive` once. Authorize.
   - The "Google hasn't verified this app" warning is unavoidable for personal scripts touching Gmail. Advanced → Go to (project) (unsafe). You're approving your own code.
3. Done. The script self-installs an every-minute trigger.

Test: label any email with an attachment using `DriveUpload`. Within ~60s it appears in the auto-created `EmailAttachments` folder as `gmsg-{threadId}__{originalFilename}`.

