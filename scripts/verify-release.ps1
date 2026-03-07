param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [switch]$Json
)

$ErrorActionPreference = "Stop"

$Version = & "$PSScriptRoot\normalize-release-version.ps1" -Version $Version

$repoRoot = Split-Path -Parent $PSScriptRoot
$releaseDir = Join-Path $repoRoot "release"
$zipPath = Join-Path $releaseDir "web-dist-$Version.zip"
$manifestPath = Join-Path $releaseDir "release-$Version.json"
$notesPath = Join-Path $releaseDir "release-$Version.md"

if (-not (Test-Path $zipPath)) {
    throw "Artefato nao encontrado: $zipPath"
}

if (-not (Test-Path $manifestPath)) {
    throw "Manifesto nao encontrado: $manifestPath"
}

if (-not (Test-Path $notesPath)) {
    throw "Notas de release nao encontradas: $notesPath"
}

$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
if ($manifest.version -ne $Version) {
    throw "Manifesto com versao divergente: $($manifest.version)"
}

$actualHash = (Get-FileHash -Algorithm SHA256 $zipPath).Hash
if ($manifest.artifact.sha256 -ne $actualHash) {
    throw "Checksum divergente para $zipPath"
}

$zipLeaf = Split-Path -Leaf $zipPath
if ($manifest.artifact.path -ne "release/$zipLeaf") {
    throw "Caminho do artefato no manifesto esta incorreto: $($manifest.artifact.path)"
}

$notesLeaf = Split-Path -Leaf $notesPath
if ($manifest.release_notes.path -ne "release/$notesLeaf") {
    throw "Caminho das notas no manifesto esta incorreto: $($manifest.release_notes.path)"
}

$notesContent = Get-Content $notesPath -Raw
if ($notesContent -notmatch "^# Release $([regex]::Escape($Version))") {
    throw "Notas de release com cabecalho divergente em $notesPath"
}

if ($Json) {
    [ordered]@{
        versao = $Version
        zip_path = $zipPath
        manifesto_path = $manifestPath
        notas_path = $notesPath
        sha256 = $actualHash
        valido = "sim"
    } | ConvertTo-Json -Depth 4
    return
}

Write-Output "Release validada: $Version"
