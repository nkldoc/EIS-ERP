[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [string] $HostName = 'eis.nmu.ac.th',
    [string] $SourceRoot = (Split-Path -Parent $PSScriptRoot),
    [string] $BackupRoot = (Join-Path $env:ProgramData 'EIS-ERP\deploy-backups')
)

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

Import-Module WebAdministration

function Wait-WebAppPoolState {
    param(
        [Parameter(Mandatory = $true)][string] $Name,
        [Parameter(Mandatory = $true)][string[]] $AllowedStates,
        [int] $TimeoutSeconds = 60
    )
    $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
    do {
        $state = (Get-WebAppPoolState -Name $Name -ErrorAction Stop).Value
        if ($AllowedStates -contains $state) { return $state }
        Start-Sleep -Milliseconds 500
    } while ([DateTime]::UtcNow -lt $deadline)
    throw "Timed out waiting for app pool '$Name'. Current state: '$state'. Expected: $($AllowedStates -join ' or ')."
}

$sites = @(Get-Website | Where-Object {
    @($_.Bindings.Collection | ForEach-Object { ([string]$_.bindingInformation).Split(':')[-1] }) -contains $HostName
})
if ($sites.Count -ne 1) {
    throw "Expected one IIS site bound to '$HostName'; found $($sites.Count). Check the host binding before deployment."
}
$site = $sites[0]

# Prefer an IIS application at /supplies. If there is no application, use the
# supplies folder under the site's physical root.
$suppliesApp = @(Get-WebApplication -Site $site.Name | Where-Object { $_.Path.TrimEnd('/') -ieq '/supplies' }) | Select-Object -First 1
if ($suppliesApp) {
    $targetRoot = [Environment]::ExpandEnvironmentVariables([string]$suppliesApp.PhysicalPath)
    $appPoolName = [string]$suppliesApp.applicationPool
    $layout = 'ApplicationRoot'
} else {
    $siteRoot = [Environment]::ExpandEnvironmentVariables([string]$site.PhysicalPath)
    $targetRoot = Join-Path $siteRoot 'supplies'
    $appPoolName = [string]$site.applicationPool
    $layout = 'SiteRootWithSuppliesFolder'
}

if ([string]::IsNullOrWhiteSpace($appPoolName)) { throw "Could not determine the app pool for '$HostName/supplies'." }
if (-not (Test-Path -LiteralPath $targetRoot -PathType Container)) { throw "Supplies application directory not found: $targetRoot" }
if (-not (Test-Path -LiteralPath "IIS:\AppPools\$appPoolName")) { throw "IIS app pool not found: $appPoolName" }

$resolvedSourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
$files = @(
    'public\supplies\access\confirm-login.php',
    'public\supplies\conf\presence\SuppliesLogin.php',
    'public\supplies\assets\js\login-confirmation.js'
)
$targets = foreach ($relativePath in $files) {
    $appRelativePath = $relativePath.Substring('public\supplies\'.Length)
    $source = Join-Path $resolvedSourceRoot $relativePath
    $destination = Join-Path $targetRoot $appRelativePath
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing source file: $source" }
    if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) { throw "Missing IIS target file: $destination" }
    [pscustomobject]@{ RelativePath = $appRelativePath; Source = $source; Destination = $destination }
}

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDirectory = Join-Path $BackupRoot "supplies-login-fix-$timestamp"
Write-Host "IIS site: $($site.Name)"
Write-Host "Binding: $HostName"
Write-Host "Supplies layout: $layout"
Write-Host "Target: $targetRoot"
Write-Host "App pool: $appPoolName"
Write-Host "Backup: $backupDirectory"

if (-not $PSCmdlet.ShouldProcess("$HostName/supplies ($targetRoot)", "Back up and deploy 3 files; recycle app pool '$appPoolName'")) {
    return
}

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$poolWasStarted = (Get-WebAppPoolState -Name $appPoolName).Value -eq 'Started'
$deploymentStarted = $false
try {
    if ($poolWasStarted) {
        Stop-WebAppPool -Name $appPoolName
        [void](Wait-WebAppPoolState -Name $appPoolName -AllowedStates @('Stopped'))
    }

    foreach ($target in $targets) {
        $backupFile = Join-Path $backupDirectory $target.RelativePath
        New-Item -ItemType Directory -Path (Split-Path -Parent $backupFile) -Force | Out-Null
        Copy-Item -LiteralPath $target.Destination -Destination $backupFile -Force
    }

    $deploymentStarted = $true
    foreach ($target in $targets) {
        Copy-Item -LiteralPath $target.Source -Destination $target.Destination -Force
    }

    # Stop/start clears the worker process and PHP OPcache for this app pool.
    if ($poolWasStarted) {
        Start-WebAppPool -Name $appPoolName
        [void](Wait-WebAppPoolState -Name $appPoolName -AllowedStates @('Started'))
    }
} catch {
    $deploymentError = $_
    $recoveryError = $null
    try {
        if ($poolWasStarted) {
            $state = Wait-WebAppPoolState -Name $appPoolName -AllowedStates @('Started', 'Stopped')
            if ($state -eq 'Started' -and $deploymentStarted) {
                Stop-WebAppPool -Name $appPoolName
                [void](Wait-WebAppPoolState -Name $appPoolName -AllowedStates @('Stopped'))
            }
        }
        if ($deploymentStarted) {
            foreach ($target in $targets) {
                $backupFile = Join-Path $backupDirectory $target.RelativePath
                if (Test-Path -LiteralPath $backupFile -PathType Leaf) {
                    Copy-Item -LiteralPath $backupFile -Destination $target.Destination -Force
                }
            }
        }
        if ($poolWasStarted -and (Get-WebAppPoolState -Name $appPoolName).Value -eq 'Stopped') {
            Start-WebAppPool -Name $appPoolName
            [void](Wait-WebAppPoolState -Name $appPoolName -AllowedStates @('Started'))
        }
    } catch {
        $recoveryError = $_
    }
    if ($recoveryError) { throw "Deployment failed: $($deploymentError.Exception.Message) Recovery also failed: $($recoveryError.Exception.Message)" }
    throw $deploymentError
}

Write-Host "Deployment completed for $HostName/supplies."
Write-Host "Backup saved at: $backupDirectory"
