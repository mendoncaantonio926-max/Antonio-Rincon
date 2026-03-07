param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [switch]$RequireCurrentVersion,

    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$changelogPath = Join-Path $repoRoot "CHANGELOG.md"
$resolvedVersion = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version

if ([string]::IsNullOrWhiteSpace($resolvedVersion)) {
    throw "Falha ao resolver a versao alvo."
}

$currentVersion = (Get-Content $versionFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($currentVersion)) {
    throw "Arquivo VERSION vazio."
}

$changelogContent = if (Test-Path $changelogPath) { Get-Content $changelogPath -Raw } else { "" }
$versionSectionExists = [regex]::IsMatch($changelogContent, "(?m)^## \[$([regex]::Escape($resolvedVersion))\](?:\s+-\s+\d{4}-\d{2}-\d{2})?$")

if ($resolvedVersion -eq $currentVersion) {
    if ($Json) {
        & "$PSScriptRoot\check-version.ps1" -Version $resolvedVersion | Out-Null
        & "$PSScriptRoot\check-changelog-version.ps1" -Version $resolvedVersion | Out-Null
    }
    else {
        & "$PSScriptRoot\check-version.ps1" -Version $resolvedVersion
        & "$PSScriptRoot\check-changelog-version.ps1" -Version $resolvedVersion
    }
    $result = [ordered]@{
        versao_alvo = "v$resolvedVersion"
        resolvida_de = $Version
        estado = "executavel"
        require_current_version = $(if ($RequireCurrentVersion) { 'sim' } else { 'nao' })
    }

    if ($Json) {
        $result | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "Release pronta para a versao v$resolvedVersion."
    return
}

if ($RequireCurrentVersion) {
    throw "A release v$resolvedVersion ainda nao esta executavel neste branch. Rode scripts\\prepare-release.cmd $resolvedVersion primeiro."
}

if ($versionSectionExists) {
    throw "CHANGELOG.md ja contem uma secao para [$resolvedVersion], mas VERSION ainda esta em $currentVersion."
}

$unreleasedMatch = [regex]::Match($changelogContent, '(?ms)^## \[Unreleased\]\s*\r?\n(.*?)(?=^## \[|\z)')
$unreleasedBody = if ($unreleasedMatch.Success) { $unreleasedMatch.Groups[1].Value } else { "" }
$unreleasedCount = ([regex]::Matches($unreleasedBody, '(?m)^\s*-\s+\S+')).Count

if ($unreleasedCount -le 0) {
    throw "A secao [Unreleased] nao contem itens para preparar a release v$resolvedVersion."
}

$result = [ordered]@{
    versao_alvo = "v$resolvedVersion"
    resolvida_de = $Version
    estado = "preparavel"
    require_current_version = $(if ($RequireCurrentVersion) { 'sim' } else { 'nao' })
    changelog_itens_unreleased = $unreleasedCount
}

if ($Json) {
    $result | ConvertTo-Json -Depth 4
    return
}

Write-Output "Release preparavel para a versao v$resolvedVersion."
