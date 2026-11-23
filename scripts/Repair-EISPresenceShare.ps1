[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [string] $ShareName = 'EIS-Presence$',
    [string] $IdentityName = 'NMU-EIS\EISMessenger',

    # Required only if the share is missing. Must be the existing data folder,
    # not a newly created empty directory.
    [string] $PresencePath
)

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'

if ($env:COMPUTERNAME -ine 'NMU-EIS-DOC') {
    throw "Run this script on NMU-EIS-DOC. Current computer: $env:COMPUTERNAME"
}

Import-Module SmbShare
$share = Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue

if ($share) {
    $targetPath = [IO.Path]::GetFullPath([string]$share.Path)
    if ($PresencePath) {
        $requestedPath = [IO.Path]::GetFullPath($PresencePath)
        if ($requestedPath.TrimEnd('\') -ine $targetPath.TrimEnd('\')) {
            throw "Share '$ShareName' already points to '$targetPath', not '$requestedPath'. Verify the existing data location before changing anything."
        }
    }
} else {
    if ([string]::IsNullOrWhiteSpace($PresencePath)) {
        throw "Share '$ShareName' is missing. Find the existing presence data folder, then rerun with -PresencePath '<existing folder>'. Do not use a new empty folder."
    }
    if (-not (Test-Path -LiteralPath $PresencePath -PathType Container)) {
        throw "Presence data folder does not exist: $PresencePath"
    }
    $targetPath = [IO.Path]::GetFullPath($PresencePath)
}

Write-Host "File server: $env:COMPUTERNAME"
Write-Host "Share: $ShareName"
Write-Host "Data path: $targetPath"
Write-Host "IIS identity: $IdentityName"

if (-not $PSCmdlet.ShouldProcess("$ShareName ($targetPath)", "Ensure share and NTFS Modify access for '$IdentityName'")) {
    return
}

if (-not $share) {
    New-SmbShare -Name $ShareName -Path $targetPath -Description 'Shared EIS presence data' `
        -FullAccess 'BUILTIN\Administrators' -ChangeAccess $IdentityName | Out-Null
} else {
    Grant-SmbShareAccess -Name $ShareName -AccountName $IdentityName -AccessRight Change -Force | Out-Null
}

foreach ($directory in @('logins', 'revoked')) {
    New-Item -ItemType Directory -Path (Join-Path $targetPath $directory) -Force | Out-Null
}

# Add Modify permission on this data folder and its contents while preserving
# existing ACL entries. Do not grant broad access such as Everyone.
$aclGrant = "${IdentityName}:(OI)(CI)M"
& icacls.exe $targetPath /grant $aclGrant /T /C | Out-Host
if ($LASTEXITCODE -ne 0) { throw "icacls failed with exit code $LASTEXITCODE" }

Write-Host "Presence share is ready. Verify access from the IIS app pool before retrying login."
