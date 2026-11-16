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

Write-Output 'Current account settings:'
$account |
    Select-Object Name, Enabled, PasswordLastSet, PasswordExpires, PasswordNeverExpires |
    Format-List

if ($account.PasswordNeverExpires) {
    Write-Output "$expectedComputerName\$accountName already has PasswordNeverExpires enabled. No change was required."
    exit 0
}

if ($PSCmdlet.ShouldProcess("$expectedComputerName\$accountName", 'Set PasswordNeverExpires to True')) {
    Set-LocalUser -Name $accountName -PasswordNeverExpires $true
}

$updatedAccount = Get-LocalUser -Name $accountName -ErrorAction Stop

Write-Output 'Updated account settings:'
$updatedAccount |
    Select-Object Name, Enabled, PasswordLastSet, PasswordExpires, PasswordNeverExpires |
    Format-List

if (-not $updatedAccount.PasswordNeverExpires) {
    throw "Verification failed: PasswordNeverExpires is not enabled for $expectedComputerName\$accountName."
}

Write-Output "Success: $expectedComputerName\$accountName now has PasswordNeverExpires enabled."
