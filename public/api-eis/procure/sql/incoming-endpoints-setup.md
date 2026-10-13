# Incoming JSON endpoints

Run `php sql/incoming-endpoints-migration.php` once on each deployment. This creates two tables without changing existing users or incoming service accounts.

Sign in as Superadmin and open **API ENDPOINTS · ขาเข้า** in the account page. Add a name, a Production URL under `/procure/incoming/`, POST / PUT / PATCH, and an existing system user. URL + Method must be unique. The sender first obtains a token from the normal Login API for the selected user, then sends that token as `Authorization: Bearer <token>`. The token must still be valid, its version must be current, and its user must match the configured user. A disabled or deleted user cannot send requests. Service accounts in `sp_api_account` remain separate.

For example, configure `/procure/incoming/irV1` with POST, then send these HTTP headers:

```text
Content-Type: application/json
Authorization: Bearer <TOKEN_FROM_LOGIN>
```

Send this body without username or password:

```json
{"data":[{"pr_id":1768,"c_doc_ref":false,"line_ids":[{"chk_line_id":2652}]}]}
```

The sender sends the body only. The receiver builds `{ "headers": {...}, "body": {...} }` from the actual request and saves it in `sp_api_incoming_log.payload`. The response contains `success`, `received` and `request_id`. HTTP 200 guarantees the JSON log was persisted; this receiver records incoming data and does not invoke legacy IR business processing.

The account page can filter history, page through 50 entries at a time, inspect the JSON and download its headers/body envelope. Logs remain available under “ทุก URL” after deleting an endpoint. All log APIs require a valid Superadmin token, including current account status and token version checks.

Authorization, passwords, cookies, token/API-key/secret fields are recursively replaced with `***HIDDEN***`. Query strings are omitted from URL headers. Invalid or oversized JSON is recorded as an omission marker rather than unsafe raw text. The body limit is 2 MB. Requests to configured routes are logged even when rejected; unknown routes return 404 without writing a log. Failed log writes return 503 rather than acknowledging receipt.

The added IIS and Apache rewrite rules under `public/procure/incoming` route `/procure/incoming/*` to the shared `incomingReceiver.php`; management requests remain under `/api-eis/procure/incomingEndpoints`. Existing `/api-eis/procure/ir` and `/procure/ir` routes remain independent. Use HTTPS on the deployed site. Log retention should follow the deployment's database backup and retention procedures.

Run `php test/incoming-endpoints-test.php` for the CLI integration test. It starts a temporary loopback PHP server and removes all fixture users, endpoints and logs in `finally`.
