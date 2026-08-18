param(
  [string]$LabPath
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($LabPath)) {
  $projectsRoot = Split-Path $repoRoot -Parent
  $LabPath = Join-Path $projectsRoot 'split3-local\immigratiimprenditori'
}

$lab = (Resolve-Path $LabPath).Path
$normalizedLab = $lab.Replace('/', '\').ToLowerInvariant()
if (-not $normalizedLab.EndsWith('\split3-local\immigratiimprenditori')) {
  throw "Refusing to run outside the isolated Immigrati lab: $lab"
}

$configPath = Join-Path $lab 'supabase\config.toml'
$migrationsPath = Join-Path $lab 'supabase\migrations'
$baselinePath = Join-Path $repoRoot 'supabase\baseline'
$validatorPath = Join-Path $repoRoot 'scripts\split3\validate-immigrati-local-baseline.sql'
$runtimeGuardPath = Join-Path $repoRoot 'scripts\split3\validate-runtime-boundary.mjs'

if (-not (Test-Path $configPath)) { throw "Missing local Supabase config: $configPath" }
if (-not (Test-Path $migrationsPath)) { throw "Missing local migrations directory: $migrationsPath" }
if (-not (Test-Path $validatorPath)) { throw "Missing validator: $validatorPath" }
if (-not (Test-Path $runtimeGuardPath)) { throw "Missing runtime boundary guard: $runtimeGuardPath" }

$branch = (& git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'split-3b-executable-baseline') {
  throw "Refusing to run from branch '$branch'. Expected split-3b-executable-baseline."
}

Write-Host 'Checking Immigrati application runtime boundary...'
Push-Location $repoRoot
try {
  & node .\scripts\split3\validate-runtime-boundary.mjs
  if ($LASTEXITCODE -ne 0) { throw "Immigrati runtime boundary guard failed with exit code $LASTEXITCODE" }

  Write-Host 'Running Immigrati TypeScript typecheck...'
  & npm run typecheck
  if ($LASTEXITCODE -ne 0) { throw "Immigrati typecheck failed with exit code $LASTEXITCODE" }
}
finally {
  Pop-Location
}

$baselineFiles = @(Get-ChildItem $baselinePath -File -Filter '000000000000*.sql' | Sort-Object Name)
if ($baselineFiles.Count -ne 4) {
  throw "Expected exactly 4 Immigrati baseline migrations (00..03), found $($baselineFiles.Count)"
}
if ($baselineFiles[0].Name -notlike '00000000000000_*' -or $baselineFiles[-1].Name -notlike '00000000000003_*') {
  throw 'Immigrati baseline migration range is not exactly 00..03'
}

Write-Host "Immigrati SPLIT-3 isolated lab: $lab"
Write-Host 'Refreshing local migration copies from the real repository baseline...'
Get-ChildItem $migrationsPath -File -Filter '000000000000*.sql' -ErrorAction SilentlyContinue | Remove-Item -Force
Copy-Item $baselineFiles.FullName -Destination $migrationsPath -Force

$copied = @(Get-ChildItem $migrationsPath -File -Filter '000000000000*.sql' | Sort-Object Name)
if ($copied.Count -ne 4) { throw "Expected 4 copied migrations, found $($copied.Count)" }

Push-Location $lab
try {
  Write-Host 'Running local-only cold start 00..03...'
  & supabase db reset --local --no-seed
  if ($LASTEXITCODE -ne 0) { throw "supabase db reset failed with exit code $LASTEXITCODE" }
}
finally {
  Pop-Location
}

$container = docker ps --format '{{.Names}}' | Where-Object { $_ -eq 'supabase_db_immigratiimprenditori' } | Select-Object -First 1
if (-not $container) {
  throw 'Local container supabase_db_immigratiimprenditori is not running after reset.'
}

Write-Host 'Running deterministic read-only database validation...'
Get-Content $validatorPath -Raw | docker exec -i $container psql -U postgres -d postgres -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw "Immigrati validator failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host 'SPLIT3_IMMIGRATI_RUNTIME_BOUNDARY = PASS'
Write-Host 'SPLIT3_IMMIGRATI_TYPECHECK = PASS'
Write-Host 'SPLIT3_IMMIGRATI_LOCAL_00_03 = PASS'
Write-Host 'SPLIT3_IMMIGRATI_ANON_PUBLIC_READS = PASS'
