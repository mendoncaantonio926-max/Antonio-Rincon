param(
    [Parameter(Mandatory = $true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$setPackageVersionScript = Join-Path $PSScriptRoot "set-package-version.mjs"
$resolvedVersion = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version

if ([string]::IsNullOrWhiteSpace($resolvedVersion)) {
    throw "Falha ao resolver a versao alvo."
}

node $setPackageVersionScript $resolvedVersion
if ($LASTEXITCODE -ne 0) {
    throw "Falha ao atualizar os manifests de versao do monorepo."
}

Set-Content -Path $versionFile -Value $resolvedVersion

Write-Output "Versao atualizada para $resolvedVersion em VERSION, workspaces npm e pyproject da API."
