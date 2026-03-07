param(
    [Parameter(Mandatory = $true)]
    [string]$Version
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
$pattern = "(?m)^## \[$([regex]::Escape($normalized))\](?:\s+-\s+\d{4}-\d{2}-\d{2})?$"

if (-not [regex]::IsMatch($content, $pattern)) {
    throw "CHANGELOG.md nao contem uma secao para [$normalized]."
}

Write-Output "Changelog validado para a versao $normalized."
