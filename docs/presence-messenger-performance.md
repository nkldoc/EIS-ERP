# Supplies Messenger performance update — 2026-10-12

Changes are limited to the Supplies client and PHP integration in this repository.

- PHP emits a preconnect hint for the configured WebSocket origin, allowing the browser to prepare the connection while requesting a fresh token. Tokens stay short-lived and are never stored in browser storage.
- Removed the extra `chat-sync` immediately after authentication. The shared server in `D:/EIS-DOCS/app/services/presence/server.js` already sends `chat-ready` and replays the latest 40 messages after `authenticated`. Previously that history was requested twice.
- Render messages only while the chat is open. Batch room options and message changes per animation frame, retain unchanged message nodes, and decode attached images asynchronously with lazy loading.
- Retain visible messages during reconnect. Update from the server on recovery; stop displaying chat data when authentication ends.
- Preserve scroll position while reading. Job/private-room history uses the existing `chat-job-detail` protocol (`before`, `more`) to load older messages on demand. One detail request per room can be active at a time, and opening an already loaded room does not refetch its history.
- Retry a broken connection after 500–600 ms initially, with exponential backoff and jitter for repeated failures. An online event retries immediately. Guard against parallel connections and stale socket callbacks; bound token requests to 8 seconds and connection/authentication to 10 seconds. Token renewal remains every 20 seconds and cannot overlap.
- Release the PHP session lock after validation, before token signing accesses shared storage. Login replacement, logout, session expiry and revocation remain enforced.

## Validation

Run `node --test tests/presence-messenger.test.cjs`. The tests cover reconnect races, offline recovery, token/authentication timeouts, 401 responses, renewal, send failure, duplicate replay, rendering while closed, scroll preservation, pagination, retractions and clearing the UI on session termination. They use simulated WebSocket, timers and DOM; they do not measure production latency or verify browser layout.

PHP lint: `C:/php/php.exe -l public/supplies/conf/presence/Presence.php` and `C:/php/php.exe -l public/supplies/access/presence-token.php`.

## Production rollout

Deploy these five files together through the existing Supplies deployment process:

1. `public/supplies/assets/js/presence-client.js`
2. `public/supplies/assets/js/presence-chat.js`
3. `public/supplies/assets/css/presence-chat.css`
4. `public/supplies/access/presence-token.php`
5. `public/supplies/conf/presence/Presence.php`

Connection/image-viewer asset version is `20261012-fast`. Chat JS/CSS now use `20261012-channels` for the subsequent separation of Tickets and general conversations; see `D:/EIS-DOCS/docs/messenger-channels.md` for that release's service deployment requirements. The performance changes themselves require no database change. The shared WebSocket service sends history automatically after authentication.

After deployment, check an authenticated Supplies session: initial connection, private/job chat, older history, image preview, reconnect, read receipts and logout. Compare browser Network/WebSocket frames and time to `authenticated` against the previous version. The code removes duplicate work, but a production speedup in milliseconds has not yet been measured. These local changes have not been deployed to the production server.
