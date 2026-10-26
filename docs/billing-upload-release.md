# Billing PDF upload: dev validation and production release

## Current implementation: PHP upload endpoint

The live servlet URL was verified to return IIS 404.0 even for GET with no
request body. The local Tomcat webapps directory has no procure deployment.
The billing page now posts to `/procure/api/billingUpload.php` instead. The PHP
handler requires a procure login, validates filename and PDF signature, enforces
1 GiB and writes only to `D:/php_supplies/api/upload_ap`; client `dir` is ignored.
The existing separate billing-status update remains in place after successful
storage. The Java changes described below are no longer required for this page.

Deploy `api/billingUpload.php`, `api/.user.ini`, `web.config` and the changed JS
together. IIS limit now targets `api/billingUpload.php`, not the servlet URL.
PHP configuration sets upload_max_filesize=1024M, post_max_size=1025M and input/
execution timeouts=3600. PHP may cache .user.ini for five minutes; recycle the
affected application pool if immediate activation is required. Confirm the IIS
FastCGI activity/request timeout also permits the intended upload duration.
The IIS identity needs write permission on the fixed destination and PHP temp
directory. Preserve existing permissions; do not grant general public access.

For the administrative commands below, substitute
`ActualSiteName/procure/api/billingUpload.php` for the old servlet endpoint.
Test POST rather than GET: an inherited rule redirects GET URLs ending in .php.
An unauthenticated POST must return JSON HTTP 401. Then test with a logged-in
session using the original PDF, verify saved bytes and persisted billing status,
and test the 1 GiB boundary before approving production.

The following servlet investigation is retained as release context; the current
PHP implementation and settings above supersede its deployment instructions.

## Scope and current limits

Page: `/procure/#sp/spBillingApproved`.
Upload endpoint: `/procure/FileUploadServletJson`.

The reported request returned HTTP 413, followed by a JSON parse exception
because the client decoded the HTML error page before checking HTTP status.
The code now checks status first, handles invalid JSON, explicit server failure,
network errors, aborts and a one-hour timeout. These failures close the waiting
dialog and do not call the billing-status update. The existing successful JSON
response contract accepts `success:true` or `status:"success"`; confirm the actual servlet response on dev.

The form is located through its Ext component instead of a generated DOM ID.
Empty files are rejected. The billing ID is captured before uploading. An absent
attachment opens `about:blank` instead of requesting a URL ending in `null`.

The file limit is 1 GiB (1,073,741,824 bytes). The IIS endpoint configuration in
`public/procure/web.config` allows 1,074,790,400 bytes including multipart overhead.
The servlet source was found in the separate project
`D:/ERP/eis_procure/src/main/java/util/upload/FileUploadServletJson.java` and
updated to the same file/request limits. It returns explicit JSON success and
HTTP errors instead of swallowing exceptions. Maven compile passed. Build and
deploy this Java change through that project's release process as well.
Local IIS applicationHost.config could not be read due to access restrictions.
Effective IIS settings, live servlet deployment and any upstream proxy limit
still require verification. No production configuration or database schema was changed.

## Applying the 1 GiB server limit

Deploy the endpoint web.config with the PHP frontend. It only applies to
`FileUploadServletJson`. If a server-level rewrite sends the request to Tomcat
before this directory's configuration applies, an administrator must apply the
same request limit to the actual IIS site/endpoint using an elevated shell:

```powershell
$appcmd = "$env:windir\System32\inetsrv\appcmd.exe"
# Replace ActualSiteName with the IIS site serving dev-eis.nmu.ac.th.
& $appcmd add backup BeforeProcure1GiB
& $appcmd set config "ActualSiteName/procure/FileUploadServletJson" -section:system.webServer/security/requestFiltering /requestLimits.maxAllowedContentLength:1074790400 /commit:apphost
& $appcmd list config "ActualSiteName/procure/FileUploadServletJson" -section:system.webServer/security/requestFiltering
```

If the rejection persists, inspect IIS status/substatus and failed-request logs
before changing buffering. Do not allocate a 1 GiB read-ahead buffer by default.
Check ARR/proxy timeout and any proxy body cap on the actual route. Allow up to
3600 seconds for this operation; review the scope before changing a shared proxy.
For the HTTP Tomcat connector actually receiving these requests, use
`disableUploadTimeout="false" connectionUploadTimeout="3600000"` if its current
upload timeout is too short. Back up server.xml and restart the affected Tomcat
service through the normal release process. These live changes were not applied
because administrative configuration access is unavailable in this session.

Boundary tests must accept a file of exactly 1,073,741,824 bytes and reject a
larger file. Validate the servlet limit independently of browser validation.
Also retest the original approximately 37 MB PDF. Use designated test records
and check free space in both the Tomcat multipart temp directory and destination.

## Dev gate

1. Deploy this revision to dev using the normal Git deployment procedure.
2. Hard refresh the page and confirm the new JavaScript is loaded.
3. Upload a small valid PDF to a designated test billing record. In Network,
   inspect the upload response JSON, then verify exactly one status update,
   reload the record and open/download the PDF to verify its contents.
4. Test a record with no attachment: no `/null` preview request should occur.
5. Test replacement of an existing attachment, including cancelling confirmation.
   Keep a copy of the original test PDF before replacement.
6. Test an empty file and a non-PDF: no upload should be sent.
7. Repeat with the PDF that originally failed. Record file size, response status,
   response headers/body and which infrastructure layer returned the 413.
8. Exercise HTTP 413/500, HTML instead of JSON, explicit `success:false`, offline
   and timeout failures in a controlled dev setup. Confirm a readable error,
   no stuck progress dialog and no billing-status update after failure.

For the original 413, have the server administrator inspect the actual route:
IIS request filtering (`maxAllowedContentLength`), SSL/request buffering
(`uploadReadAheadSize`) if applicable, any upstream proxy body-size restriction,
and the servlet multipart file/request limits. Change only the rejecting layer
after agreeing the allowed PDF size. Allow multipart overhead in request limits.
Do not assume PHP upload settings govern this servlet endpoint. Validate files
below, at and above the agreed limit and retain the rejected-size behavior.

Run local checks:

```powershell
node --check public/procure/sp/tor/spBillingApproved.js
node tests/billing-upload-test.cjs
git diff --check
```

## Production gate and rollback

Record the passing dev revision, actual servlet JSON response, approved upload
limit, configuration changes and test evidence before release. Release code
through `docs/git-deployment.md`; apply any verified server change separately
with a configuration backup and the required service reload procedure.

On production, hard refresh and perform one approved test-record upload, reopen
the PDF and verify persisted billing status. Monitor upload errors. A timeout
can occur after the server has stored the file: inspect the record/file before
retrying to avoid an unintended overwrite.

Rollback by deploying the previous known-good revision through the normal
release process and restoring any changed server configuration from its backup.
Code rollback does not restore overwritten PDF files or reverse billing updates;
recover test data separately from the saved originals when necessary.
