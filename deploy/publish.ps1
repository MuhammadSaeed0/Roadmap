<#
.SYNOPSIS
  Builds DevPath for production (API + Angular app in one site) and, with -Deploy, publishes it to
  MonsterASP.NET (or any IIS host) with Web Deploy, then smoke-tests the live site.

.DESCRIPTION
  1. Reads deploy/production.env (copy production.env.example and fill it in; it is git-ignored).
  2. Optionally runs the backend and frontend tests.
  3. Builds the Angular app and publishes the API with the app in wwwroot.
  4. Checks the production settings with the published app (`--check-config`).
  5. Writes the app settings into the published web.config as environment variables (never into the repo).
  6. Writes an idempotent SQL migration script to deploy/out/migrations.sql (the app also migrates on start-up).
  7. With -Deploy: syncs deploy/out/publish to the site with msdeploy and checks /api/health and the home page.

  Secrets are never printed. The publish folder contains them in web.config, so don't share deploy/out.

.EXAMPLE
  ./deploy/publish.ps1                 # build and check only
  ./deploy/publish.ps1 -Deploy         # build, check and publish to the live site
#>
[CmdletBinding()]
param(
    [string]$EnvFile = (Join-Path $PSScriptRoot 'production.env'),
    [switch]$Deploy,
    [switch]$SkipTests,
    # Default: framework-dependent, using the host's .NET 10 runtime; works whether the IIS app pool is 32- or 64-bit
    # (MonsterASP.NET's free sites run 32-bit). -SelfContained bundles a 64-bit runtime for hosts without .NET 10.
    [switch]$SelfContained
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$api = Join-Path $root 'backend\DevPath.Api'
$frontend = Join-Path $root 'frontend'
$out = Join-Path $PSScriptRoot 'out'
$publishDir = Join-Path $out 'publish'

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }

function Invoke-Checked([string]$what, [scriptblock]$command) {
    # Native tools (npm, dotnet, msdeploy) write progress to stderr; only their exit code decides success.
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & $command } finally { $ErrorActionPreference = $previous }
    if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)." }
}

function Read-EnvFile([string]$path) {
    $values = [ordered]@{}
    foreach ($line in Get-Content -LiteralPath $path -Encoding UTF8) {
        $trimmed = $line.Trim()
        if ($trimmed -eq '' -or $trimmed.StartsWith('#')) { continue }
        $eq = $trimmed.IndexOf('=')
        if ($eq -lt 1) { throw "Invalid line in $(Split-Path $path -Leaf): expected NAME=value." }
        $name = $trimmed.Substring(0, $eq).Trim()
        $value = $trimmed.Substring($eq + 1).Trim()
        if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) {
            $value = $value.Substring(1, $value.Length - 2)
        }
        $values[$name] = $value
    }
    return $values
}

# ---------- 1. Settings ----------
Step 'Reading production settings'
if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "Missing $EnvFile. Copy deploy/production.env.example to deploy/production.env and fill it in."
}
$all = Read-EnvFile $EnvFile
$appSettings = [ordered]@{}
foreach ($key in $all.Keys) { if (-not $key.StartsWith('DEPLOY_') -and $all[$key] -ne '') { $appSettings[$key] = $all[$key] } }
foreach ($key in $all.Keys) {
    # Web Deploy details are only needed with -Deploy, so "build and check" works before you have them.
    if ($key.StartsWith('DEPLOY_') -and -not $Deploy) { continue }
    if ($all[$key] -match 'CHANGE_ME') { throw "$key in $(Split-Path $EnvFile -Leaf) still contains a placeholder." }
}
Write-Host "Loaded $($appSettings.Count) app settings (values not shown)."

# ---------- 2. Tests ----------
if (-not $SkipTests) {
    Step 'Running backend tests'
    Invoke-Checked 'Backend tests' { dotnet test (Join-Path $root 'backend\DevPath.Api.Tests') --nologo --verbosity quiet }
    Step 'Running frontend tests'
    Push-Location $frontend
    try {
        Invoke-Checked 'Frontend tests' { npx ng test --watch=false }
        Invoke-Checked 'Practice Lab exercises' { npm run verify:exercises }
    } finally { Pop-Location }
}

# ---------- 3. Build ----------
Step 'Building the Angular app'
Push-Location $frontend
try {
    if (-not (Test-Path 'node_modules')) { Invoke-Checked 'npm ci' { npm ci --no-audit --no-fund } }
    # The in-browser code runners (C# on WebAssembly, the Angular preview's packages) are generated, not committed.
    Invoke-Checked 'Code runners' { npm run build:runners }
    Invoke-Checked 'Angular build' { npx ng build --configuration production }
    Invoke-Checked 'Brotli copies' { npm run precompress }
} finally { Pop-Location }
$browserDir = Join-Path $frontend 'dist\frontend\browser'
if (-not (Test-Path (Join-Path $browserDir 'index.html'))) { throw "The Angular build output wasn't found in $browserDir." }

Step 'Publishing the API'
if (Test-Path $publishDir) { Get-ChildItem -LiteralPath $publishDir -Force | Remove-Item -Recurse -Force }
$publishArgs = @('publish', $api, '-c', 'Release', '-o', $publishDir, '--nologo')
if ($SelfContained) { $publishArgs += @('-r', 'win-x64', '--self-contained', 'true') } else { $publishArgs += @('--no-self-contained') }
Invoke-Checked 'dotnet publish' { dotnet @publishArgs }

$wwwroot = Join-Path $publishDir 'wwwroot'
New-Item -ItemType Directory -Force $wwwroot | Out-Null
Copy-Item -Path (Join-Path $browserDir '*') -Destination $wwwroot -Recurse -Force
# Netlify-only file from an earlier hosting setup; IIS doesn't use it.
Remove-Item -Force -ErrorAction SilentlyContinue (Join-Path $wwwroot '_redirects')

# ---------- 4. Configuration check ----------
Step 'Checking the production configuration'
$previous = @{}
foreach ($key in @($appSettings.Keys) + 'ASPNETCORE_ENVIRONMENT') { $previous[$key] = [Environment]::GetEnvironmentVariable($key, 'Process') }
try {
    foreach ($key in $appSettings.Keys) { [Environment]::SetEnvironmentVariable($key, $appSettings[$key], 'Process') }
    [Environment]::SetEnvironmentVariable('ASPNETCORE_ENVIRONMENT', 'Production', 'Process')
    Push-Location $publishDir
    try {
        Invoke-Checked 'The configuration check (fix the settings listed above in production.env)' {
            if ($SelfContained) { & '.\DevPath.Api.exe' --check-config } else { & dotnet '.\DevPath.Api.dll' --check-config }
        }
    } finally { Pop-Location }
} finally {
    foreach ($key in $previous.Keys) { [Environment]::SetEnvironmentVariable($key, $previous[$key], 'Process') }
}

# ---------- 5. Secrets into the published web.config ----------
Step 'Writing settings into the published web.config'
$webConfigPath = Join-Path $publishDir 'web.config'
[xml]$webConfig = Get-Content -LiteralPath $webConfigPath -Raw
$aspNetCore = $webConfig.SelectSingleNode('//aspNetCore')
# A self-contained app starts from DevPath.Api.exe directly and takes no DLL argument.
if ($SelfContained) { $aspNetCore.SetAttribute('arguments', '') }
$variables = $aspNetCore.SelectSingleNode('environmentVariables')
if (-not $variables) { $variables = $aspNetCore.AppendChild($webConfig.CreateElement('environmentVariables')) }
foreach ($key in $appSettings.Keys) {
    foreach ($existing in @($variables.SelectNodes("environmentVariable[@name='$key']"))) { [void]$variables.RemoveChild($existing) }
    $element = $webConfig.CreateElement('environmentVariable')
    $element.SetAttribute('name', $key)
    $element.SetAttribute('value', $appSettings[$key])
    [void]$variables.AppendChild($element)
}
$webConfig.Save($webConfigPath)
Write-Host "web.config now sets ASPNETCORE_ENVIRONMENT=Production and $($appSettings.Count) settings."

# ---------- 6. Migration script ----------
Step 'Writing the idempotent migration script'
Invoke-Checked 'Migration script' { dotnet ef migrations script --idempotent --configuration Release --project $api --output (Join-Path $out 'migrations.sql') }
Write-Host "deploy/out/migrations.sql (the app also applies pending migrations when it starts)."

if (-not $Deploy) {
    Step 'Done'
    Write-Host "Built and checked: $publishDir"
    Write-Host 'Run again with -Deploy to publish it to the live site.'
    return
}

# ---------- 7. Deploy with Web Deploy ----------
Step 'Deploying with Web Deploy'
foreach ($key in 'DEPLOY_SITE', 'DEPLOY_SERVER', 'DEPLOY_USERNAME', 'DEPLOY_PASSWORD') {
    if (-not $all[$key]) { throw "$key is missing from $(Split-Path $EnvFile -Leaf)." }
}
$msdeploy = @(
    "$env:ProgramFiles\IIS\Microsoft Web Deploy V3\msdeploy.exe",
    "${env:ProgramFiles(x86)}\IIS\Microsoft Web Deploy V3\msdeploy.exe"
) | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
if (-not $msdeploy) { throw 'Web Deploy (msdeploy.exe) is not installed. Install "Web Deploy 4.0" from Microsoft, or run: choco install webdeploy' }

$site = $all['DEPLOY_SITE']
$dest = "contentPath=$site,computerName=https://$($all['DEPLOY_SERVER']):8172/msdeploy.axd?site=$site," +
        "userName=$($all['DEPLOY_USERNAME']),password=$($all['DEPLOY_PASSWORD']),authtype=Basic,includeAcls=False"
$msArgs = @(
    '-verb:sync', "-source:contentPath=$publishDir", "-dest:$dest",
    '-allowUntrusted', '-enableRule:AppOffline',
    '-disableLink:AppPoolExtension', '-disableLink:ContentExtension', '-disableLink:CertificateExtension',
    '-skip:objectName=dirPath,absolutePath=\\logs$'
)
# The command line contains the deployment password, so it is never echoed.
Invoke-Checked 'Web Deploy (check the site name, server and credentials)' { & $msdeploy @msArgs }

# ---------- 8. Smoke test ----------
Step 'Checking the live site'
$baseUrl = $appSettings['Frontend__BaseUrl'].TrimEnd('/')
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$healthy = $false
for ($attempt = 1; $attempt -le 10 -and -not $healthy; $attempt++) {
    try {
        $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -TimeoutSec 60
        $healthy = $health.status -eq 'ok'
    } catch {
        Write-Host "Waiting for the site to start (attempt $attempt)..."
        Start-Sleep -Seconds 6
    }
}
if (-not $healthy) { throw "$baseUrl/api/health did not report ok. Check the site's logs in the control panel." }
$page = Invoke-WebRequest -Uri "$baseUrl/sign-in" -UseBasicParsing -TimeoutSec 60
if ($page.Content -notmatch '<app-root') { throw "$baseUrl/sign-in did not return the Angular app." }
Write-Host "Live: $baseUrl (health ok, app served)." -ForegroundColor Green
