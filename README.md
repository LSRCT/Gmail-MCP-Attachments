# Gmail-MCP-Attachments

Workaround to enable AI agents to interact with gmail attachements.

## Problem
Stock gmail MCP has no way for llms to look at attachment data. (hopefully soon: https://github.com/modelcontextprotocol/servers/issues/4122)


## Workaround
- Agent labels mail with new "DriveUpload" label
- New google script uploads all attachments from labeled mails
- Agent can interact with file on drive

