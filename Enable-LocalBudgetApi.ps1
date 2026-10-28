# Run in an Administrator PowerShell window on the dev/local IIS server.
[CmdletBinding()]
param(
    [string]$ApiPath = 'C:\xampp\htdocs\api-nmu',
    [string]$WebRoot = 'C:\inetpub\wwwroot',
    [string]$ApiRootUrl = 'https://dev-eis.nmu.ac.th/api-nmu/'
)
$ErrorActionPreference = 'Stop'
$identity = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identity)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Open PowerShell as Administrator, then run this script again.'
}
if (-not (Test-Path -LiteralPath (Join-Path $ApiPath 'index.php') -PathType Leaf)) {
    throw "API index.php not found in $ApiPath"
}
$target = (Resolve-Path -LiteralPath $ApiPath).Path
$root = (Resolve-Path -LiteralPath $WebRoot).Path
$link = Join-Path $root 'api-nmu'
if (Test-Path -LiteralPath $link) {
    $existing = Get-Item -LiteralPath $link
    if ($existing.LinkType -ne 'Junction' -or $existing.Target -notcontains $target) {
        throw "$link already exists. No files were replaced. Check the IIS API mapping."
    }
} else {
    New-Item -ItemType Junction -Path $link -Target $target | Out-Null
}
# Only request the API root. Do not invoke any money reservation endpoint.
$response = Invoke-WebRequest -Uri $ApiRootUrl -UseBasicParsing
if ($response.StatusCode -ne 200) {
    throw "API root returned HTTP $($response.StatusCode)"
}
Write-Host "API mapping ready: $link -> $target (HTTP 200)"
