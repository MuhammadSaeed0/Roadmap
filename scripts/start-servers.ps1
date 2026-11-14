<#
.SYNOPSIS
  Starts the DevPath API (http://localhost:5080) and the Angular dev server (http://localhost:4200) in the
  background, then waits until both answer.

.DESCRIPTION
  appsettings.json points the API at LocalDB, which this machine doesn't have, so the API is started with a
  connection string to the local SQL Server instance instead (passed as an environment variable, never saved).
  The API applies pending migrations and seeds content when it starts.

  Logs: .run-api.log and .run-web.log in the repository root (git-ignored).
  A server that is already listening on its port is left as it is.

.EXAMPLE
  ./scripts/start-servers.ps1
  ./scripts/start-servers.ps1 -ConnectionString 'Server=.\SQLEXPRESS;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True'
#>
[CmdletBinding()]
param(
    [string]$ConnectionString = 'Server=localhost;Database=DevPath;Trusted_Connection=True;TrustServerCertificate=True',
    [int]$ApiPort = 5080,
    [int]$WebPort = 4200,
    [int]$TimeoutSeconds = 240
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$api = Join-Path $root 'backend\DevPath.Api'
$frontend = Join-Path $root 'frontend'

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }
function Test-Listening([int]$port) { [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) }

function Test-Url([string]$url) {
    try { (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3).StatusCode -eq 200 } catch { $false }
}

Step "API on port $ApiPort"
if (Test-Listening $ApiPort) {
    Write-Host "Already running."
} else {
    # The child process inherits the variable; restore the shell's own value afterwards.
    $previous = $env:ConnectionStrings__DevPath
    $env:ConnectionStrings__DevPath = $ConnectionString
    try {
        Start-Process -FilePath 'dotnet' -ArgumentList 'run', '--urls', "http://localhost:$ApiPort" -WorkingDirectory $api `
            -RedirectStandardOutput (Join-Path $root '.run-api.log') -RedirectStandardError (Join-Path $root '.run-api.err.log') -WindowStyle Hidden
    } finally {
        $env:ConnectionStrings__DevPath = $previous
    }
    Write-Host "Starting (build, migrations and seeding can take a minute)..."
}

Step "Angular dev server on port $WebPort"
if (Test-Listening $WebPort) {
    Write-Host "Already running."
} else {
    $log = Join-Path $root '.run-web.log'
    Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', "npx ng serve --port $WebPort > `"$log`" 2>&1" -WorkingDirectory $frontend -WindowStyle Hidden
    Write-Host "Starting..."
}

Step "Waiting for both servers (up to $TimeoutSeconds s)"
$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$apiUp = $false
$webUp = $false
while ((Get-Date) -lt $deadline -and -not ($apiUp -and $webUp)) {
    if (-not $apiUp) { $apiUp = Test-Url "http://localhost:$ApiPort/api/health" }
    if (-not $webUp) { $webUp = Test-Url "http://localhost:$WebPort" }
    if (-not ($apiUp -and $webUp)) { Start-Sleep -Seconds 3 }
}

if ($apiUp) { Write-Host "API:      http://localhost:$ApiPort  (up)" -ForegroundColor Green }
else { Write-Host "API:      not answering. See .run-api.log and .run-api.err.log" -ForegroundColor Red }
if ($webUp) { Write-Host "Frontend: http://localhost:$WebPort  (up)" -ForegroundColor Green }
else { Write-Host "Frontend: not answering. See .run-web.log" -ForegroundColor Red }

if (-not ($apiUp -and $webUp)) { exit 1 }
