[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $SiteName,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $AppPoolName,

    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string] $SiteRoot,

    [string] $SourceRoot = (Split-Path -Parent $PSScriptRoot),

    [string] $BackupRoot = (Join-Path $env:ProgramData 'EIS-ERP\deploy-backups'),

    [switch] $SkipRecycle
)

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

$files = @(
    'public\supplies\access\confirm-login.php',
    'public\supplies\conf\presence\SuppliesLogin.php',
    'public\supplies\assets\js\login-confirmation.js'
)

Import-Module WebAdministration

$site = Get-Website -Name $SiteName -ErrorAction Stop
$pool = Get-Item "IIS:\AppPools\$AppPoolName" -ErrorAction Stop
$sitePhysicalPath = [Environment]::ExpandEnvironmentVariables([string]$site.PhysicalPath)
$resolvedSiteRoot = [IO.Path]::GetFullPath($SiteRoot).TrimEnd('\')
$resolvedPhysicalPath = [IO.Path]::GetFullPath($sitePhysicalPath).TrimEnd('\')
if ($resolvedSiteRoot -ine $resolvedPhysicalPath) {
    throw "SiteRoot '$resolvedSiteRoot' does not match IIS site '$SiteName' physical path '$resolvedPhysicalPath'."
}

$resolvedSourceRoot = (Resolve-Path -LiteralPath $SourceRoot).Path
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupDirectory = Join-Path $BackupRoot "supplies-login-fix-$timestamp"
$targets = foreach ($relativePath in $files) {
    $source = Join-Path $resolvedSourceRoot $relativePath
    $destination = Join-Path $resolvedSiteRoot ($relativePath.Substring('public\'.Length))
    if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing source file: $source" }
    if (-not (Test-Path -LiteralPath $destination -PathType Leaf)) { throw "Missing IIS target file: $destination" }
    [pscustomobject]@{ RelativePath = $relativePath; Source = $source; Destination = $destination }
}

if (-not (Test-Path -LiteralPath $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

if (-not $PSCmdlet.ShouldProcess("IIS site '$SiteName' at '$resolvedSiteRoot'", 'Back up, deploy three Supplies login files, and recycle the application pool')) {
    return
}

New-Item -ItemType Directory -Path $backupDirectory -Force | Out-Null
$poolWasStarted = (Get-WebAppPoolState -Name $AppPoolName).Value -eq 'Started'
$deploymentStarted = $false
try {
    if ($poolWasStarted -and -not $SkipRecycle) { Stop-WebAppPool -Name $AppPoolName }
    foreach ($target in $targets) {
        $backupFile = Join-Path $backupDirectory ($target.RelativePath.Substring('public\'.Length))
        $backupParent = Split-Path -Parent $backupFile
        New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
        Copy-Item -LiteralPath $target.Destination -Destination $backupFile -Force
    }

    $deploymentStarted = $true
    foreach ($target in $targets) {
        Copy-Item -LiteralPath $target.Source -Destination $target.Destination -Force
    }

    if ($poolWasStarted -and -not $SkipRecycle) { Start-WebAppPool -Name $AppPoolName }
}
catch {
    $deploymentError = $_
    if ($deploymentStarted -and (Test-Path -LiteralPath $backupDirectory)) {
        foreach ($target in $targets) {
            $backupFile = Join-Path $backupDirectory ($target.RelativePath.Substring('public\'.Length))
            if (Test-Path -LiteralPath $backupFile -PathType Leaf) {
                Copy-Item -LiteralPath $backupFile -Destination $target.Destination -Force
            }
        }
    }
    if ($poolWasStarted -and -not $SkipRecycle -and (Get-WebAppPoolState -Name $AppPoolName).Value -ne 'Started') {
        Start-WebAppPool -Name $AppPoolName
    }
    throw $deploymentError
}

Write-Host "Deployed Supplies login fix to IIS site '$SiteName'."
Write-Host "Backup: $backupDirectory"
if ($SkipRecycle) { Write-Warning 'App pool recycle was skipped; PHP OPcache may still serve older code.' }
