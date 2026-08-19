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

$authValidator = Join-Path $repoRoot 'scripts\split3\validate-immigrati-local-auth.sql'
if (-not (Test-Path $authValidator)) { throw "Missing Immigrati Auth validator: $authValidator" }

$branch = (& git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -ne 'split-3b-executable-baseline') {
  throw "Refusing to run from branch '$branch'. Expected split-3b-executable-baseline."
}

Push-Location $lab
try {
  Write-Host 'Ensuring the isolated Immigrati Supabase stack is running...'
  & supabase start
  if ($LASTEXITCODE -ne 0) { throw "supabase start failed with exit code $LASTEXITCODE" }
}
finally {
  Pop-Location
}

$container = docker ps --format '{{.Names}}' | Where-Object { $_ -eq 'supabase_db_immigratiimprenditori' } | Select-Object -First 1
if (-not $container) {
  throw 'Local container supabase_db_immigratiimprenditori is not running.'
}

Write-Host 'Running transactional Immigrati Auth identity smoke...'
Get-Content $authValidator -Raw | docker exec -i $container psql -U postgres -d postgres -v ON_ERROR_STOP=1
if ($LASTEXITCODE -ne 0) { throw "Immigrati Auth smoke failed with exit code $LASTEXITCODE" }

Write-Host ''
Write-Host 'SPLIT3_IMMIGRATI_AUTH_IDENTITY_FLOW = PASS'
Write-Host 'SPLIT3_IMMIGRATI_AUTH_ROLLBACK = PASS'
