<#
.SYNOPSIS
  Merges a feature branch into main and pushes both to GitHub. Pushing main DEPLOYS TO THE LIVE SITE
  (the "Deploy to MonsterASP.NET" workflow runs on every push to main).

.DESCRIPTION
  1. Refuses to run on main, with staged-but-uncommitted changes, or when main on GitHub has moved on in a
     way that can't be fast-forwarded.
  2. Optionally runs the backend tests, the frontend tests and a production build first (-RunTests).
  3. Asks for confirmation (skip with -Yes).
  4. Merges the branch into main with a merge commit, pushes main and the branch, and switches to main.
  5. If the GitHub CLI (gh) is installed, waits for the CI and deploy runs and prints their real results.

  Changes you haven't committed stay in your working tree and are not part of the merge.

.EXAMPLE
  ./scripts/merge-and-push.ps1                          # merge the current branch
  ./scripts/merge-and-push.ps1 -RunTests                # test first
  ./scripts/merge-and-push.ps1 -Branch feature/x -Yes   # no prompt
#>
[CmdletBinding()]
param(
    [string]$Branch,
    [string]$Message,
    [switch]$RunTests,
    [switch]$Yes,
    [switch]$NoWait
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root

function Step($text) { Write-Host "`n==> $text" -ForegroundColor Cyan }

function Invoke-Checked([string]$what, [scriptblock]$command) {
    # git, dotnet and npm write progress to stderr; only their exit code decides success.
    $previous = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try { & $command } finally { $ErrorActionPreference = $previous }
    if ($LASTEXITCODE -ne 0) { throw "$what failed (exit code $LASTEXITCODE)." }
}

if (-not $Branch) { $Branch = (git rev-parse --abbrev-ref HEAD).Trim() }
if ($Branch -eq 'main' -or $Branch -eq 'HEAD') { throw "Switch to the feature branch to merge (current: $Branch), or pass -Branch." }
git rev-parse --verify --quiet $Branch | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Branch '$Branch' doesn't exist." }
if (-not $Message) { $Message = "Merge $Branch" }

git diff --cached --quiet
if ($LASTEXITCODE -ne 0) { throw 'There are staged changes that are not committed. Commit or unstage them first.' }
$dirty = @(git status --porcelain --untracked-files=no)
if ($dirty.Count -gt 0) {
    Write-Host "Uncommitted changes stay in your working tree and are NOT merged:" -ForegroundColor Yellow
    $dirty | ForEach-Object { Write-Host "  $_" }
}

Step 'Fetching GitHub'
Invoke-Checked 'git fetch' { git fetch origin }
$ahead = (git rev-list --count "$Branch..origin/main").Trim()
if ($ahead -ne '0') { Write-Host "main on GitHub has $ahead commit(s) not in $Branch; they will be pulled into main first." -ForegroundColor Yellow }
$commits = @(git log --oneline "origin/main..$Branch")
if ($commits.Count -eq 0) { Write-Host "Nothing to merge: $Branch has no commits that main doesn't have."; exit 0 }
Write-Host "Commits to merge into main:"
$commits | ForEach-Object { Write-Host "  $_" }

if ($RunTests) {
    Step 'Backend tests'
    Invoke-Checked 'Backend tests' { dotnet test (Join-Path $root 'backend\DevPath.Api.Tests') }
    Step 'Frontend tests and production build'
    Push-Location (Join-Path $root 'frontend')
    try {
        Invoke-Checked 'Frontend tests' { npx ng test --watch=false }
        Invoke-Checked 'Frontend build' { npx ng build }
    } finally { Pop-Location }
}

if (-not $Yes) {
    $answer = Read-Host "`nMerge '$Branch' into main and push? This deploys to the live site. (y/N)"
    if ($answer -notmatch '^(y|yes)$') { Write-Host 'Cancelled.'; exit 1 }
}

Step "Merging $Branch into main"
Invoke-Checked 'git switch main' { git switch main }
Invoke-Checked 'git pull' { git pull --ff-only origin main }
$ErrorActionPreference = 'Continue'
git merge --no-ff $Branch -m $Message
$merged = $LASTEXITCODE -eq 0
if (-not $merged) {
    git merge --abort
    git switch $Branch
}
$ErrorActionPreference = 'Stop'
if (-not $merged) {
    throw "The merge had conflicts and was cancelled. Merge main into $Branch, resolve the conflicts, then run this again."
}

Step 'Pushing to GitHub'
Invoke-Checked 'git push main' { git push origin main }
Invoke-Checked "git push $Branch" { git push -u origin $Branch }
$head = (git rev-parse HEAD).Trim()
Write-Host "Pushed main at $($head.Substring(0, 7))." -ForegroundColor Green

if ($NoWait -or -not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host 'Follow the deploy on GitHub, in the Actions tab.'
    exit 0
}

Step 'Waiting for CI and the deploy (Ctrl+C stops waiting; the deploy keeps running)'
$runs = @()
for ($i = 0; $i -lt 20 -and $runs.Count -lt 2; $i++) {
    Start-Sleep -Seconds 6
    $runs = @(gh run list --commit $head --json databaseId,workflowName | ConvertFrom-Json)
}
if ($runs.Count -eq 0) { Write-Host 'No workflow runs found yet; check the Actions tab.'; exit 0 }

$failed = $false
foreach ($run in $runs) {
    # 'gh run watch' can exit 0 even when the run failed, so read the conclusion explicitly.
    do {
        Start-Sleep -Seconds 20
        $state = gh run view $run.databaseId --json status,conclusion | ConvertFrom-Json
    } while ($state.status -ne 'completed')
    $color = if ($state.conclusion -eq 'success') { 'Green' } else { 'Red' }
    Write-Host "$($run.workflowName): $($state.conclusion)" -ForegroundColor $color
    if ($state.conclusion -ne 'success') { $failed = $true }
}

if ($failed) {
    Write-Host "A run failed. See the log with: gh run view <id> --log-failed" -ForegroundColor Red
    Write-Host "If only the known flaky async test failed, rerun it with: gh run rerun <id> --failed"
    exit 1
}
Write-Host 'Deployed.' -ForegroundColor Green
