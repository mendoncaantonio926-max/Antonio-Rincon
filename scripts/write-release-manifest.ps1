param(
    [Parameter(Mandatory = $true)]
    [string]$Version,

    [Parameter(Mandatory = $true)]
    [string]$ArtifactPath,

    [Parameter(Mandatory = $true)]
    [string]$ManifestPath,

    [string]$NotesPath
)

$ErrorActionPreference = "Stop"

$Version = & "$PSScriptRoot\normalize-release-version.ps1" -Version $Version

if (-not (Test-Path $ArtifactPath)) {
    throw "Artefato nao encontrado: $ArtifactPath"
}

$artifactHash = (Get-FileHash -Algorithm SHA256 $ArtifactPath).Hash
$artifactLeaf = Split-Path -Leaf $ArtifactPath
$manifest = [ordered]@{
    version = $Version
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    artifact = @{
        path = "release/$artifactLeaf"
        sha256 = $artifactHash
    }
    frontend_dist = @{
        path = "apps/web/dist"
    }
}

if ($NotesPath) {
    if (-not (Test-Path $NotesPath)) {
        throw "Notas de release nao encontradas: $NotesPath"
    }

    $notesLeaf = Split-Path -Leaf $NotesPath
    $manifest.release_notes = @{
        path = "release/$notesLeaf"
    }
}

$manifest = $manifest | ConvertTo-Json -Depth 4

Set-Content -Path $ManifestPath -Value $manifest
Write-Output "Manifesto gerado: $ManifestPath"
