param(
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$changelogPath = Join-Path $repoRoot "CHANGELOG.md"

function Get-ReleaseState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TargetVersion
    )

    try {
        & "$PSScriptRoot\check-release-readiness.ps1" -Version $TargetVersion -RequireCurrentVersion 2>$null | Out-Null
        return "executavel"
    }
    catch {
        try {
            & "$PSScriptRoot\check-release-readiness.ps1" -Version $TargetVersion 2>$null | Out-Null
            return "preparavel"
        }
        catch {
            return "bloqueada"
        }
    }
}

function Get-ArtifactCollisionState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TargetVersion
    )

    $releaseDir = Join-Path $repoRoot "release"
    $zipPath = Join-Path $releaseDir "web-dist-v$TargetVersion.zip"
    $manifestPath = Join-Path $releaseDir "release-v$TargetVersion.json"
    $notesPath = Join-Path $releaseDir "release-v$TargetVersion.md"

    if ((Test-Path $zipPath) -or (Test-Path $manifestPath) -or (Test-Path $notesPath)) {
        return "sim"
    }

    return "nao"
}

if (-not (Test-Path $versionFile)) {
    throw "Arquivo VERSION nao encontrado."
}

$version = (Get-Content $versionFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Arquivo VERSION vazio."
}

$nextPatch = & "$PSScriptRoot\resolve-version-target.ps1" -Version "patch"
$nextMinor = & "$PSScriptRoot\resolve-version-target.ps1" -Version "minor"
$nextMajor = & "$PSScriptRoot\resolve-version-target.ps1" -Version "major"
$nextPatchState = Get-ReleaseState -TargetVersion $nextPatch
$nextMinorState = Get-ReleaseState -TargetVersion $nextMinor
$nextMajorState = Get-ReleaseState -TargetVersion $nextMajor
$nextPatchArtifacts = Get-ArtifactCollisionState -TargetVersion $nextPatch
$nextMinorArtifacts = Get-ArtifactCollisionState -TargetVersion $nextMinor
$nextMajorArtifacts = Get-ArtifactCollisionState -TargetVersion $nextMajor

$content = if (Test-Path $changelogPath) { Get-Content $changelogPath -Raw } else { "" }
$unreleasedMatch = [regex]::Match($content, '(?ms)^## \[Unreleased\]\s*\r?\n(.*?)(?=^## \[|\z)')
$unreleasedBody = if ($unreleasedMatch.Success) { $unreleasedMatch.Groups[1].Value } else { "" }
$unreleasedCount = ([regex]::Matches($unreleasedBody, '(?m)^\s*-\s+\S+')).Count
$versionSectionPresent = [regex]::IsMatch($content, "(?m)^## \[$([regex]::Escape($version))\](?:\s+-\s+\d{4}-\d{2}-\d{2})?$")

$releaseDir = Join-Path $repoRoot "release"
$zipPath = Join-Path $releaseDir "web-dist-v$version.zip"
$manifestPath = Join-Path $releaseDir "release-v$version.json"
$notesPath = Join-Path $releaseDir "release-v$version.md"

$status = [ordered]@{
    versao_atual = $version
    proximo_patch = $nextPatch
    proximo_patch_status = $nextPatchState
    proximo_patch_artefatos_existentes = $nextPatchArtifacts
    proximo_minor = $nextMinor
    proximo_minor_status = $nextMinorState
    proximo_minor_artefatos_existentes = $nextMinorArtifacts
    proximo_major = $nextMajor
    proximo_major_status = $nextMajorState
    proximo_major_artefatos_existentes = $nextMajorArtifacts
    changelog_secao_versao = $(if ($versionSectionPresent) { 'sim' } else { 'nao' })
    changelog_itens_unreleased = $unreleasedCount
    artefato_zip = $(if (Test-Path $zipPath) { 'sim' } else { 'nao' })
    artefato_manifesto = $(if (Test-Path $manifestPath) { 'sim' } else { 'nao' })
    artefato_notas = $(if (Test-Path $notesPath) { 'sim' } else { 'nao' })
}

if ($Json) {
    $status | ConvertTo-Json -Depth 3
    return
}

foreach ($item in $status.GetEnumerator()) {
    Write-Output "$($item.Key)=$($item.Value)"
}
