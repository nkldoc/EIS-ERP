# Machine-specific presence configuration

`public/procure/conf/presence/presence.config.php` and
`public/supplies/conf/presence/presence.config.php` are no longer tracked.
Their example files remain tracked. Existing local files are preserved by
`git rm --cached` on the development checkout.

IMPORTANT: the first pull of the commit removing these files can delete the
previously tracked files on other checkouts. Back up BOTH production files
outside the repository before that pull, and restore them immediately after
the pull, including on failure. Perform that one-time migration from the
production console, during a maintenance window. Subsequent pulls leave the
ignored files alone. Never replace production configuration with the dev copy.

PowerShell on production, after the removal commit has been pushed:

```powershell
Set-Location D:\EIS-ERP
$files = @(
    'public/procure/conf/presence/presence.config.php',
    'public/supplies/conf/presence/presence.config.php'
)
$backup = "D:\EIS-ERP-presence-backup-$(Get-Date -Format yyyyMMdd-HHmmssfff)"
New-Item -ItemType Directory -Path $backup -ErrorAction Stop | Out-Null
Copy-Item -LiteralPath $files[0] -Destination "$backup\procure.php" -ErrorAction Stop
Copy-Item -LiteralPath $files[1] -Destination "$backup\supplies.php" -ErrorAction Stop
try {
    git pull --ff-only origin master
    if ($LASTEXITCODE -ne 0) { throw 'Git pull failed; review the Git error before retrying.' }
} finally {
    Copy-Item -LiteralPath "$backup\procure.php" -Destination $files[0] -Force -ErrorAction Stop
    Copy-Item -LiteralPath "$backup\supplies.php" -Destination $files[1] -Force -ErrorAction Stop
}
git status --short
```

If Git reports local modifications and refuses to pull, this procedure restores
the files and leaves the changes intact; inspect the differences separately.
After migration, confirm the two applications still have their production
presence settings and that Git status does not list either configuration file.
