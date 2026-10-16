# EIS-ERP Git Deployment

The administrator menu in NMU_permission links to `git-deploy.php`. Each host
operates only on its own repository. Development and production links open
their respective portals and require an administrator session there.

Install the EIS-ERP service and the NMU_permission page/menu together.
Copy `NMU_permission/docs/git-deploy-config.example.php` to
`NMU_permission/conf/git-deploy.local.php` on each host. Set `environment`
to `development` or `production`, and set the absolute repository path, Git
executable and deployment branch. Configuration is deliberately outside Git.
Do not select the environment from the HTTP hostname or request parameters.

The web server account needs Git installed, read access to the origin, and
write permission on the repository including `.git`. Provision a read-only
deploy credential for that account using SSH or Git Credential Manager;
never embed credentials in the remote URL. Interactive prompts are disabled.
The repository must already be on the configured branch tracking origin.

Review status, type the environment name, then submit. A POST and session CSRF
token are required. Git refuses local changes, branch mismatches and divergent
history. No reset, clean, stash, merge commit, or automatic branch switch runs.
The repository lock serializes requests through this service. External CLI Git
operations must be coordinated separately. Audit records are stored in
`.git/eis-deploy-audit.jsonl` outside the public directory.

The old `/supplies/gitpull.php` now redirects without changing files.
This updates code only; database migrations and service restarts require their
normal release procedures. Configure PHP/web server request timeouts above
120 seconds. A Git command has a 90 second timeout; inspect repository status
before retrying a timeout. Production installation and credentials must be
configured on the actual production machine before it can be used.
