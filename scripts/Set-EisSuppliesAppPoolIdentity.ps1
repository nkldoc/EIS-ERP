[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
    [string] $AppPoolName = 'EIS-Supplies-Messenger',
    [string] $UserName = '.\EISMessenger',
    [System.Management.Automation.PSCredential] $Credential
)

#Requires -RunAsAdministrator
$ErrorActionPreference = 'Stop'
Import-Module WebAdministration

function Resolve-AccountName {
    param([Parameter(Mandatory = $true)][string] $Name)
    if ($Name.StartsWith('.\')) { return "$env:COMPUTERNAME\$($Name.Substring(2))" }
    return $Name
}

function Add-BatchLogonRight {
    param([Parameter(Mandatory = $true)][System.Security.Principal.SecurityIdentifier] $Sid)
    $policyFile = Join-Path $env:TEMP ('eis-user-rights-' + [guid]::NewGuid().ToString() + '.inf')
    $databaseFile = Join-Path $env:TEMP ('eis-user-rights-' + [guid]::NewGuid().ToString() + '.sdb')
    try {
        & secedit.exe /export /cfg $policyFile /areas USER_RIGHTS | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "secedit export failed with exit code $LASTEXITCODE" }
        $content = Get-Content -LiteralPath $policyFile -Raw -Encoding Unicode
        $sidEntry = "*$($Sid.Value)"
        $denyMatch = [regex]::Match($content, '(?m)^SeDenyBatchLogonRight\s*=\s*(.*)$')
        if ($denyMatch.Success -and (@($denyMatch.Groups[1].Value.Split(',') | ForEach-Object { $_.Trim() }) -contains $sidEntry)) {
            throw "The account is explicitly denied 'Log on as a batch job'. Remove that deny policy before continuing."
        }
        $match = [regex]::Match($content, '(?m)^SeBatchLogonRight\s*=\s*(.*)$')
        if ($match.Success) {
            $entries = @($match.Groups[1].Value.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
            if ($entries -notcontains $sidEntry) { $entries += $sidEntry }
            $replacement = 'SeBatchLogonRight = ' + ($entries -join ',')
            $content = $content.Substring(0, $match.Index) + $replacement + $content.Substring($match.Index + $match.Length)
        } else {
            $content = $content -replace '(?m)^\[Privilege Rights\]\s*$', "[Privilege Rights]`r`nSeBatchLogonRight = $sidEntry"
        }
        Set-Content -LiteralPath $policyFile -Value $content -Encoding Unicode
        & secedit.exe /configure /db $databaseFile /cfg $policyFile /areas USER_RIGHTS | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "secedit configure failed with exit code $LASTEXITCODE" }
    } finally {
        Remove-Item -LiteralPath $policyFile,$databaseFile -Force -ErrorAction SilentlyContinue
    }
}

function Test-BatchCredential {
    param(
        [Parameter(Mandatory = $true)][string] $QualifiedUserName,
        [Parameter(Mandatory = $true)][string] $Password
    )
    if (-not ('EisNativeLogon' -as [type])) {
        Add-Type @'
using System;
using System.Runtime.InteropServices;
public static class EisNativeLogon {
  [DllImport("advapi32.dll", SetLastError=true, CharSet=CharSet.Unicode)]
  public static extern bool LogonUser(string user, string domain, string password, int logonType, int provider, out IntPtr token);
  [DllImport("kernel32.dll", SetLastError=true)]
  public static extern bool CloseHandle(IntPtr handle);
}
'@
    }
    $parts = $QualifiedUserName.Split('\', 2)
    if ($parts.Count -ne 2) { throw "Expected a qualified user name, got '$QualifiedUserName'." }
    $token = [IntPtr]::Zero
    $ok = [EisNativeLogon]::LogonUser($parts[1], $parts[0], $Password, 4, 0, [ref]$token)
    if ($ok) { [void][EisNativeLogon]::CloseHandle($token); return }
    $code = [Runtime.InteropServices.Marshal]::GetLastWin32Error()
    throw "Windows rejected the account credentials or Batch Logon right (Win32 error $code)."
}

if (-not (Test-Path -LiteralPath "IIS:\AppPools\$AppPoolName")) { throw "App pool not found: $AppPoolName" }
$resolvedUserName = Resolve-AccountName $UserName
$account = [System.Security.Principal.NTAccount]::new($resolvedUserName)
try { $sid = $account.Translate([System.Security.Principal.SecurityIdentifier]) }
catch { throw "Windows cannot resolve '$resolvedUserName'. Verify the account exists on this server or in its domain." }

if (-not $Credential) {
    $Credential = Get-Credential -UserName $resolvedUserName -Message "Enter the current password for $resolvedUserName"
}
if ($Credential.UserName -ine $resolvedUserName) { throw "Credential user must be '$resolvedUserName'." }

Write-Host "App pool: $AppPoolName"
Write-Host "Identity: $resolvedUserName"
Write-Host "SID: $($sid.Value)"
if (-not $PSCmdlet.ShouldProcess($AppPoolName, "Grant Batch Logon to $resolvedUserName, update the app-pool password, and recycle the pool")) { return }

Add-BatchLogonRight -Sid $sid
$password = $Credential.GetNetworkCredential().Password
try {
    Test-BatchCredential -QualifiedUserName $resolvedUserName -Password $password
    Set-ItemProperty -LiteralPath "IIS:\AppPools\$AppPoolName" -Name processModel -Value @{
        identityType = 'SpecificUser'
        userName = $resolvedUserName
        password = $password
    }
} finally {
    $password = $null
}

Restart-WebAppPool -Name $AppPoolName
$state = (Get-WebAppPoolState -Name $AppPoolName).Value
if ($state -ne 'Started') { throw "App pool did not start. Current state: $state" }
Write-Host "Updated '$AppPoolName' and confirmed it is Started."
