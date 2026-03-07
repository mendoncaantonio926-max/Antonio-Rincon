param(
    [string]$Version
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"

if ([string]::IsNullOrWhiteSpace($Version)) {
    if (-not (Test-Path $versionFile)) {
        throw "Arquivo VERSION nao encontrado."
    }

    $currentVersion = (Get-Content $versionFile -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($currentVersion)) {
        throw "Arquivo VERSION vazio."
    }

    $Version = "v$currentVersion"
}
elseif ($Version -match '^(patch|minor|major)$') {
    $resolved = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version
    if ([string]::IsNullOrWhiteSpace($resolved)) {
        throw "Falha ao resolver a versao alvo."
    }
    $Version = $resolved
}

$Version = & "$PSScriptRoot\normalize-release-version.ps1" -Version $Version

Write-Output $Version
