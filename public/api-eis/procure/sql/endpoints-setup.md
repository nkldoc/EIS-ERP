# Endpoint management setup

1. Use the existing `php_auth_api.sp_api_endpoint` table through `classes/Database.php`. For a new installation only, apply `endpoints.sql`; it does not modify an existing table.
2. Configure these environment variables for the PHP web worker, then restart/recycle it:
   - `ERPSEND_BASE_URL`: trusted HTTPS base URL (without the endpoint path).
   - `ERPSEND_PASSWORD`: destination password for `erpsendapi`.
   - `ERPSEND_SOURCE_DSN`: optional MSSQL PDO override, e.g. `sqlsrv:Server=HOST;Database=DATABASE;LoginTimeout=5`. When absent, the existing `conf/config.php` DB_SERVER, DB_NAME, DB_USER and DB_PASS settings are used.
   - `ERPSEND_SOURCE_USER`: dedicated SELECT-only account for the override (recommended).
   - `ERPSEND_SOURCE_PASSWORD`: password for that account.
3. Enable Apache rewrite or IIS URL Rewrite with the supplied rules. IIS must allow PUT and DELETE (WebDAV can intercept them).
4. Log in as superadmin, create an endpoint with one SELECT statement, then test against a designated test destination.

The query validator deliberately permits only SELECT, with no semicolons, SQL comments or INTO. Database permissions are the security boundary, including restrictions on executable functions. Test sends are limited to 1,000 rows / 5 MB. SQL Server queries time out after 30 seconds; for other drivers configure statement limits on the database account/server. HTTPS certificate checks stay enabled and redirects are not followed. GET also sends the documented JSON body; destination support for GET bodies must be verified.

GET /endpoints returns a JSON array. POST and PUT require `{name,uri,method,query,active}` with active as a JSON boolean. Only active endpoints can be tested. Test results contain request metadata, masked password, row count and upstream HTTP status/response byte count. Arbitrary upstream response bodies are intentionally omitted because they may echo passwords or tokens. HTTP 2xx means transport-level success, not business-level acceptance. `last_sent_at` records successful test delivery in UTC. A timeout can occur after delivery; check the destination before retrying.

This module provides configuration CRUD and manual test sending. Existing scheduled senders are not automatically connected to this table; they must explicitly load active rows and call the sender. No scheduled sender was identified in this directory.

## MSSQL field selection and preview

For existing installations run `php sql/endpoints-source-migration.php` once on the application host. It adds nullable `c_database` and `c_field_map` columns without changing endpoint rows. This migration has been applied to the local configured MySQL database during implementation.

`GET /endpoints/databases` lists accessible online user databases from the MSSQL connection. `POST /endpoints/preview` takes `{database,query,fields}` and returns source column names, up to 10 sample rows, mapped data, and a truncation flag. Both require superadmin authentication. Preview does not send HTTP to a destination or update the last-send timestamp.

In the editor choose a database, enter `SELECT * FROM sp_tor_contract`, and click อ่านฟิลด์และดูตัวอย่าง. Check only the fields to send, then rename `tor_id` to `pr_id`. Confirm saving after reviewing the masked JSON example. The original SELECT is retained; the field mapping is applied to its result for both preview and delivery, equivalent to selecting aliases such as `tor_id AS pr_id`. SQL aliases written directly in the query are also supported. Duplicate output names are rejected. Changing the database or query invalidates the preview and requires another read. Saving leaves the example visible; sending remains a separate action and reruns the saved query, so data can change after the preview.

API `fields` is an ordered array such as `[{"source":"tor_id","target":"pr_id"}]`. Legacy endpoints with no mapping retain all query fields and use the connection's default database. The UI requires at least one selected field for new saves. The query filter conservatively rejects mutation/control keywords, including when present inside literals; use a SELECT-only source account as an additional protection. Actual delivery still has the existing 1,000-row/5-MB cap.
