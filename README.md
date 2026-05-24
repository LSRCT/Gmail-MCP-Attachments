# Gmail-MCP-Attachments

Workaround to enable AI agents to interact with gmail attachements.

## Problem

Claude.ai, ChatGPT, etc. can search gmail and write to google drive, but have no way download an attachment — the one operation that connects them.

Same gap in the stock gmail MCP (hopefully soon: modelcontextprotocol/servers#4122). 

Note: Coding agents sidestep all this by calling the gmail api directly, but that's not an option on web/mobile.


## Workaround
- Agent labels mail with new "DriveUpload" label
- New google script uploads all attachments from labeled mails
- Agent can interact with file on drive

## Requirements

Google account. To drive the workflow from an agent: gmail + drive integrations on your LLM client (Claude.ai web/mobile, similar).

## Setup

1. New Apps Script project at [script.google.com](https://script.google.com), paste `syncLabeledEmailsToDrive.gs`.
2. Run `syncLabeledEmailsToDrive` once. Authorize.
   - The "Google hasn't verified this app" warning is unavoidable for personal scripts touching Gmail. Advanced → Go to (project) (unsafe). You're approving your own code.
3. Done. The script self-installs an every-minute trigger.

Test: label any email with an attachment using `DriveUpload`. Within ~60s it appears in the auto-created `EmailAttachments` folder as `gmsg-{threadId}__{originalFilename}`.

