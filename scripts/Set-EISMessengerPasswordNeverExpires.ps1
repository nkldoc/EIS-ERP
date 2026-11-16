[CmdletBinding(SupportsShouldProcess, ConfirmImpact = 'Medium')]
param()

$ErrorActionPreference = 'Stop'
$expectedComputerName = 'NMU-EIS'
$accountName = 'EISMessenger'

$currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = [Security.Principal.WindowsPrincipal]::new($currentIdentity)
$administratorRole = [Security.Principal.WindowsBuiltInRole]::Administrator

if (-not $principal.IsInRole($administratorRole)) {
    throw 'Run this script from Windows PowerShell as Administrator.'
}

if ($env:COMPUTERNAME -ine $expectedComputerName) {
    throw "Safety check failed: this script must run on $expectedComputerName, not $env:COMPUTERNAME."
}

$account = Get-LocalUser -Name $accountName -ErrorAction Stop
$adsiAccount = [ADSI]"WinNT://$expectedComputerName/$accountName,user"
$passwordNeverExpiresFlag = 0x10000
$currentUserFlags = [int]$adsiAccount.UserFlags.Value
$currentPasswordNeverExpires = ($currentUserFlags -band $passwordNeverExpiresFlag) -ne 0

Write-Output 'Current account settings:'
[pscustomobject]@{
    Name                 = $account.Name
    Enabled              = $account.Enabled
    PasswordLastSet      = $account.PasswordLastSet
    PasswordExpires      = $account.PasswordExpires
    PasswordNeverExpires = $currentPasswordNeverExpires
} | Format-List

if ($currentPasswordNeverExpires) {
    Write-Output "$expectedComputerName\$accountName already has PasswordNeverExpires enabled. No change was required."
    exit 0
}

if ($PSCmdlet.ShouldProcess("$expectedComputerName\$accountName", 'Set PasswordNeverExpires to True')) {
    Set-LocalUser -Name $accountName -PasswordNeverExpires $true
}

$updatedAccount = Get-LocalUser -Name $accountName -ErrorAction Stop
$adsiAccount.RefreshCache()
$updatedUserFlags = [int]$adsiAccount.UserFlags.Value
$updatedPasswordNeverExpires = ($updatedUserFlags -band $passwordNeverExpiresFlag) -ne 0

Write-Output 'Updated account settings:'
[pscustomobject]@{
    Name                 = $updatedAccount.Name
    Enabled              = $updatedAccount.Enabled
    PasswordLastSet      = $updatedAccount.PasswordLastSet
    PasswordExpires      = $updatedAccount.PasswordExpires
    PasswordNeverExpires = $updatedPasswordNeverExpires
} | Format-List

if (-not $updatedPasswordNeverExpires) {
    throw "Verification failed: PasswordNeverExpires is not enabled for $expectedComputerName\$accountName."
}

Write-Output "Success: $expectedComputerName\$accountName now has PasswordNeverExpires enabled."
