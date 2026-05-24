---
name: movie-tickets-to-calendar
description: Use this skill whenever the user wants to turn cinema booking emails into calendar events. Phrases like "process my cinema bookings", "add my movie tickets to calendar", "put my BFI/PCC/Odeon bookings on my calendar". Handles both PDF e-ticket cinemas (BFI Southbank, etc.) and inline-QR-code cinemas (Prince Charles Cinema, etc.).
---

# Movie tickets to calendar

Converts cinema booking confirmation emails into Google Calendar events with a one-tap link to the ticket in each description.

## Requires

The Apps Script at [github.com/LSRCT/Gmail-MCP-Attachments](https://github.com/LSRCT/Gmail-MCP-Attachments) installed on the user's account. It uploads Gmail attachments to a Drive folder when their thread is labeled `DriveUpload`, naming files `gmsg-{threadId}__{originalFilename}`. Within ~60s the file is in Drive and the label is removed. If a Drive search for `title contains 'gmsg-'` returns nothing across multiple threads, the script isn't installed — point the user to the repo for setup.

## Workflow

1. **Find bookings.** Search Gmail with cinema/film/ticket/booking keywords plus cinema names (BFI, Prince Charles, Odeon, Vue, Picturehouse, Curzon, Everyman, Cineworld). Filter to actual confirmations vs marketing by snippet keywords like "order number", "booking code", "confirmation", or seat references.

2. **Parse each.** Read with FULL_CONTENT for movie, datetime, cinema, screen, seat. Known cinema patterns:
   - **BFI**: PDF attached. Order Number in subject.
   - **Prince Charles Cinema (PCC)**: No PDF, QR code as inline image. 8-digit Booking Collection Code in body.

3. **Label PDF-bearing threads only.** Get the `DriveUpload` label ID once via `Gmail:list_labels`, then `Gmail:label_thread` for each thread with PDF attachments. Skip inline-only threads — nothing to upload.

4. **Create calendar events.** One per booking. End time = start + runtime + ~30 min buffer. Look up runtimes via web search when not in the email. Default 2.5h for undisclosed runtimes (e.g., PCC's "Mystery Movie"). Flag any runtime assumptions to the user briefly.

5. **Add ticket link to descriptions.** Resolve per cinema:
   - **BFI (PDF)**: search Drive for `title contains 'gmsg-{threadId}'`, use the file's `viewUrl`. If empty immediately, retry once after ~30s.
   - **PCC (QR)**: construct the TaPoS QR URL directly from the booking code: `https://eu.internet-ticketing.com/websales/sales/prilon/qrcodegen?value={bookingCode}`. Clicking opens a full-screen QR ready to scan. No Drive lookup needed.
   - **Unknown QR-only cinema**: fall back to the Gmail message URL `https://mail.google.com/mail/u/0/#inbox/{threadId}`.

## Description format

Calendar descriptions render `<a>`, `<b>`, `<i>`, `<u>`, `<br>`, `<ul>/<li>` — images and iframes get stripped. Ticket link goes first, with an emoji marker for visibility on mobile.

BFI (PDF):
```html
<a href="https://drive.google.com/file/d/.../view">📎 E-ticket (PDF)</a><br><br><b>{Movie}</b> — BFI Southbank<br>{Screen}, Row {R} Seat {S}<br>Order #{N}
```

PCC (QR):
```html
<a href="https://eu.internet-ticketing.com/websales/sales/prilon/qrcodegen?value={code}">📱 QR ticket</a><br><br><b>{Movie}</b> — Prince Charles Cinema<br>{Screen}, Seat {S}<br>Booking Code: {code}
```

Unknown QR-only cinema:
```html
<a href="https://mail.google.com/mail/u/0/#inbox/{threadId}">📱 QR ticket (open email)</a><br><br><b>{Movie}</b> — {Cinema}<br>{Seat}<br>Booking Code: {N}
```

## Don't duplicate

Check the calendar at the booking time before creating. If an event already exists, update its description rather than adding a duplicate. Google sometimes auto-creates "from Gmail" events for bookings — these are usable as-is or replaceable.
