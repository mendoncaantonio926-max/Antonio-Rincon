$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"

if (-not (Test-Path $versionFile)) {
    throw "Arquivo VERSION nao encontrado."
}

$version = (Get-Content $versionFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "Arquivo VERSION vazio."
}

Write-Output $version

