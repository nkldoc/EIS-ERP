[CmdletBinding()]
param(
    [int]$Hours = 6,
    [string]$OutputRoot = "$env:SystemDrive\IIS-Incident-Logs"
)

$ErrorActionPreference = 'Continue'
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$outputDirectory = Join-Path $OutputRoot "EIS-Supplies-Messenger-$timestamp"
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null

$transcriptPath = Join-Path $outputDirectory 'incident-summary.txt'
$eventCsvPath = Join-Path $outputDirectory 'iis-events.csv'
$eventTextPath = Join-Path $outputDirectory 'iis-events.txt'
$appCmd = Join-Path $env:windir 'System32\inetsrv\appcmd.exe'
$startTime = (Get-Date).AddHours(-1 * [Math]::Abs($Hours))

Start-Transcript -Path $transcriptPath -Force | Out-Null
try {
    Write-Output 'EIS production IIS incident diagnostic log'
    Write-Output "Collected: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz')"
    Write-Output "Computer: $env:COMPUTERNAME"
    Write-Output "User: $env:USERDOMAIN\$env:USERNAME"
    Write-Output "Window start: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))"

    Write-Output "`n=== Operating system ==="
    Get-CimInstance Win32_OperatingSystem |
        Select-Object Caption, Version, LastBootUpTime, LocalDateTime |
        Format-List

    Write-Output "`n=== Required services ==="
    Get-Service RpcSs, RpcEptMapper, DcomLaunch, BFE, MpsSvc, AppHostSvc, WAS, W3SVC |
        Select-Object Name, Status, StartType, DisplayName |
        Format-Table -AutoSize

    Write-Output "`n=== Application pool state ==="
    if (Test-Path -LiteralPath $appCmd) {
        & $appCmd list apppool 'EIS-Supplies-Messenger' /text:state

        Write-Output "`n=== Application pool identity (password is never collected) ==="
        & $appCmd list apppool 'EIS-Supplies-Messenger' /text:processModel.identityType
        & $appCmd list apppool 'EIS-Supplies-Messenger' /text:processModel.userName

        Write-Output "`n=== IIS worker processes ==="
        & $appCmd list wp
    }
    else {
        Write-Warning "appcmd.exe was not found at $appCmd"
    }

    Write-Output "`n=== EISMessenger local account (no secret data) ==="
    Get-LocalUser -Name EISMessenger |
        Select-Object Name, Enabled, PasswordLastSet, PasswordExpires, UserMayChangePassword |
        Format-List

    Write-Output "`n=== Services using EISMessenger ==="
    Get-CimInstance Win32_Service |
        Where-Object { $_.StartName -ieq "$env:COMPUTERNAME\EISMessenger" } |
        Select-Object Name, DisplayName, State, StartMode, StartName |
        Format-Table -AutoSize

    Write-Output "`n=== Scheduled tasks using EISMessenger ==="
    Get-ScheduledTask |
        Where-Object { $_.Principal.UserId -ieq "$env:COMPUTERNAME\EISMessenger" } |
        Select-Object TaskPath, TaskName, State |
        Format-Table -AutoSize

    Write-Output "`n=== Logged-on sessions ==="
    & quser.exe 2>&1

    Write-Output "`n=== Production HTTP checks ==="
    $urls = @(
        'https://eis.nmu.ac.th/',
        'https://eis.nmu.ac.th/procure/',
        'https://eis.nmu.ac.th/supplies/'
    )
    foreach ($url in $urls) {
        try {
            $request = [System.Net.HttpWebRequest]::Create($url)
            $request.Method = 'HEAD'
            $request.AllowAutoRedirect = $false
            $request.Timeout = 15000
            $response = $request.GetResponse()
            Write-Output ("{0} -> {1} {2}; Server={3}" -f $url, [int]$response.StatusCode, $response.StatusDescription, $response.Headers['Server'])
            $response.Close()
        }
        catch [System.Net.WebException] {
            $response = $_.Exception.Response
            if ($null -ne $response) {
                Write-Output ("{0} -> {1} {2}; Server={3}" -f $url, [int]$response.StatusCode, $response.StatusDescription, $response.Headers['Server'])
                $response.Close()
            }
            else {
                Write-Output "$url -> ERROR: $($_.Exception.Message)"
            }
        }
    }

    Write-Output "`n=== Relevant Windows events ==="
    $events = Get-WinEvent -FilterHashtable @{ StartTime = $startTime; LogName = 'System' } |
        Where-Object {
            $_.Id -in 5021, 5057, 5059, 7031, 7034, 7036 -or
            $_.ProviderName -match 'Microsoft-Windows-WAS|Microsoft-Windows-IIS|Service Control Manager'
        } |
        Select-Object TimeCreated, LogName, ProviderName, Id, LevelDisplayName, Message

    $events | Export-Csv -LiteralPath $eventCsvPath -NoTypeInformation -Encoding UTF8
    $events | Format-List | Out-File -LiteralPath $eventTextPath -Encoding UTF8
    $events | Format-Table TimeCreated, Id, LevelDisplayName, ProviderName -AutoSize
}
finally {
    Stop-Transcript | Out-Null
}

Write-Output "Incident log created at: $outputDirectory"
