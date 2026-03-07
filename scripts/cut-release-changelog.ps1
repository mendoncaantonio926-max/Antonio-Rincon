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
$unreleasedPattern = '(?ms)^## \[Unreleased\]\s*\r?\n(.*?)(?=^## \[|\z)'
$unreleasedMatch = [regex]::Match($content, $unreleasedPattern)

if (-not $unreleasedMatch.Success) {
    throw "Nao foi possivel localizar a secao [Unreleased] em CHANGELOG.md."
}

$versionHeaderPattern = "(?m)^## \[$([regex]::Escape($normalized))\](?:\s+-\s+\d{4}-\d{2}-\d{2})?$"
if ([regex]::IsMatch($content, $versionHeaderPattern)) {
    throw "CHANGELOG.md ja contem uma secao para [$normalized]."
}

$unreleasedBody = $unreleasedMatch.Groups[1].Value.Trim()
if ([string]::IsNullOrWhiteSpace($unreleasedBody)) {
    throw "A secao [Unreleased] esta vazia."
}

$hasBullet = $unreleasedBody -match '(?m)^\s*-\s+\S+'
if (-not $hasBullet) {
    throw "A secao [Unreleased] nao contem itens de changelog para versionar."
}

$emptyUnreleased = @"
## [Unreleased]

### Added

### Changed

### Fixed

### Docs

### Ops
"@

$releaseSection = @"
## [$normalized] - $((Get-Date).ToString("yyyy-MM-dd"))

$unreleasedBody
"@

$updated = [regex]::Replace(
    $content,
    $unreleasedPattern,
    "$emptyUnreleased`r`n`r`n$releaseSection`r`n`r`n",
    1
)

Set-Content -Path $changelogPath -Value $updated
Write-Output "CHANGELOG.md atualizado com a release $normalized."
