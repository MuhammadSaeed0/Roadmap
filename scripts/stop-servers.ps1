<#
.SYNOPSIS
  Stops the local DevPath servers: whatever listens on the API port (5080) and the Angular port (4200),
  together with the processes they started.

.DESCRIPTION
  Only the processes that own those two ports are stopped, so other Node or .NET programs keep running.
  SQL Server is a Windows service and is not touched.

.EXAMPLE
  ./scripts/stop-servers.ps1
#>
[CmdletBinding()]
param(
    [int]$ApiPort = 5080,
    [int]$WebPort = 4200
)

$ErrorActionPreference = 'Stop'

foreach ($server in @(@{ Name = 'API'; Port = $ApiPort }, @{ Name = 'Frontend'; Port = $WebPort })) {
    $owners = @(Get-NetTCPConnection -LocalPort $server.Port -State Listen -ErrorAction SilentlyContinue |
        Select-Object -ExpandProperty OwningProcess -Unique)
    if ($owners.Count -eq 0) {
        Write-Host "$($server.Name) (port $($server.Port)): not running."
        continue
    }
    foreach ($id in $owners) {
        $name = (Get-Process -Id $id -ErrorAction SilentlyContinue).ProcessName
        # /T also ends the child processes, /F forces it (dev servers don't need a graceful shutdown).
        & taskkill.exe /PID $id /T /F | Out-Null
        Write-Host "$($server.Name) (port $($server.Port)): stopped $name (PID $id)." -ForegroundColor Green
    }
}

Start-Sleep -Seconds 1
$still = @($ApiPort, $WebPort | Where-Object { Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue })
if ($still.Count -gt 0) {
    Write-Host "Still listening on: $($still -join ', ')" -ForegroundColor Red
    exit 1
}
