# Session lifetime audit (2026-10-26)

Both modules enforce a 7,200-second idle timeout in their local
`public/<module>/conf/config.php`. C:\PHP\php.ini has a file handler and
28,800-second GC lifetime; the application overrides it to 7,200 seconds.
The CLI loads C:\PHP\php.ini; the live FastCGI environment has not been verified.

The persistent session cookie previously expired two hours after issue even
when last_activity advanced. Both local configs now require
`app/session-lifetime.php` and call `eisRenewSessionCookie($timeout)` after
the idle check. Passive supplies presence requests retain the existing idle
deadline. These config files are gitignored: preserve these edits during deployment.

The procure renewal endpoint previously started a default PHPSESSID session
and used a separate 1,800-second timer. Both renewal endpoints now use their
module config and return HTTP 401 for an expired/anonymous session. The main
page timers now renew on keyboard, touch, click or scroll activity, throttled
to approximately once a minute, including while editing without saving.
An unattended tab does not send renewals from this timer.

## IIS verification still required

Reading applicationHost.config and appcmd on this machine was denied by
Windows permissions. No App Pool or FastCGI values have been changed or
inferred from defaults. Run these read-only commands in an elevated PowerShell:

```powershell
& "$env:windir\System32\inetsrv\appcmd.exe" list app /text:*
& "$env:windir\System32\inetsrv\appcmd.exe" list apppool /text:*
& "$env:windir\System32\inetsrv\appcmd.exe" list config /section:system.webServer/fastCgi
```

Review the mapped pool's idleTimeout, recycling and FastCGI PHPRC setting.
ASP/ASP.NET session timeout does not configure PHP file sessions. A pool
restart does not by itself remove the application's on-disk session files.
Verify the pool identity has Modify access to the configured session directory.
Do not disable recycling or extend request timeouts just to change session age.

Validation: PHP lint on both local configs, both renewal endpoints and the
cookie helper; JavaScript syntax and simulated user-input/idle/throttle checks.
Live authenticated IIS testing and a real two-hour soak remain outstanding.
