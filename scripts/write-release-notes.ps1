param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [Parameter(Mandatory = $true)]
    [string]$OutputPath
)

$ErrorActionPreference = "Stop"

if ($Version -notmatch '^v?\d+\.\d+\.\d+$') {
    throw "Use uma versao no formato vX.Y.Z ou X.Y.Z."
}

$normalized = $Version
if ($normalized.StartsWith("v")) {
    $normalized = $normalized.Substring(1)
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$changelogPath = Join-Path $repoRoot "CHANGELOG.md"

if (-not (Test-Path $changelogPath)) {
    throw "Arquivo CHANGELOG.md nao encontrado."
}

$content = Get-Content $changelogPath -Raw
$escapedVersion = [regex]::Escape($normalized)
$pattern = "(?ms)^## \[$escapedVersion\](?:\s+-\s+\d{4}-\d{2}-\d{2})?\s*\r?\n(.*?)(?=^## \[|\z)"
$match = [regex]::Match($content, $pattern)

if (-not $match.Success) {
    throw "CHANGELOG.md nao contem uma secao extraivel para [$normalized]."
}

$sectionBody = $match.Groups[1].Value.Trim()
if ([string]::IsNullOrWhiteSpace($sectionBody)) {
    throw "A secao [$normalized] em CHANGELOG.md esta vazia."
}

$notes = @"
# Release v$normalized

$sectionBody
"@

$outputDir = Split-Path -Parent $OutputPath
if ($outputDir -and -not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

Set-Content -Path $OutputPath -Value $notes
Write-Output "Notas de release geradas: $OutputPath"
