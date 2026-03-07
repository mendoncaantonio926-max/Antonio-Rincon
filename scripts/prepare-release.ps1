param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [switch]$DryRun,
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$resolvedVersion = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version

if ([string]::IsNullOrWhiteSpace($resolvedVersion)) {
    throw "Falha ao resolver a versao alvo."
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$changelogPath = Join-Path $repoRoot "CHANGELOG.md"
$currentVersion = if (Test-Path $versionFile) { (Get-Content $versionFile -Raw).Trim() } else { "" }
$changelogContent = if (Test-Path $changelogPath) { Get-Content $changelogPath -Raw } else { "" }
$unreleasedMatch = [regex]::Match($changelogContent, '(?ms)^## \[Unreleased\]\s*\r?\n(.*?)(?=^## \[|\z)')
$unreleasedBody = if ($unreleasedMatch.Success) { $unreleasedMatch.Groups[1].Value } else { "" }
$unreleasedCount = ([regex]::Matches($unreleasedBody, '(?m)^\s*-\s+\S+')).Count
$versionSectionExists = [regex]::IsMatch($changelogContent, "(?m)^## \[$([regex]::Escape($resolvedVersion))\](?:\s+-\s+\d{4}-\d{2}-\d{2})?$")

if ($DryRun) {
    $result = [ordered]@{
        dry_run = 'sim'
        versao_atual = $currentVersion
        versao_alvo = $resolvedVersion
        troca_versao_necessaria = $(if ($currentVersion -ne $resolvedVersion) { 'sim' } else { 'nao' })
        changelog_itens_unreleased = $unreleasedCount
        secao_alvo_ja_existe = $(if ($versionSectionExists) { 'sim' } else { 'nao' })
    }

    if ($Json) {
        $result | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "dry_run=sim"
    Write-Output "versao_atual=$currentVersion"
    Write-Output "versao_alvo=$resolvedVersion"
    Write-Output "troca_versao_necessaria=$(if ($currentVersion -ne $resolvedVersion) { 'sim' } else { 'nao' })"
    Write-Output "changelog_itens_unreleased=$unreleasedCount"
    Write-Output "secao_alvo_ja_existe=$(if ($versionSectionExists) { 'sim' } else { 'nao' })"
    return
}

cmd /c "scripts\bump-version.cmd $resolvedVersion"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao atualizar a versao do monorepo."
}

cmd /c "scripts\cut-release-changelog.cmd v$resolvedVersion"
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao preparar CHANGELOG.md para a release."
}

cmd /c scripts\verify-release-readiness.cmd
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao validar a prontidao da release."
}

if ($Json) {
    [ordered]@{
        dry_run = 'nao'
        versao_alvo = $resolvedVersion
        versao_atualizada = 'sim'
        changelog_cortado = 'sim'
    } | ConvertTo-Json -Depth 4
    return
}

Write-Output "Release preparada para a versao $resolvedVersion."
