param(
    [string]$Version = "patch",
    [switch]$Json
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedTarget = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version

if ([string]::IsNullOrWhiteSpace($resolvedTarget)) {
    throw "Falha ao resolver a versao alvo."
}

Push-Location $repoRoot
try {
    $releaseDir = Join-Path $repoRoot "release"
    $zipPath = Join-Path $releaseDir "web-dist-v$resolvedTarget.zip"
    $manifestPath = Join-Path $releaseDir "release-v$resolvedTarget.json"
    $notesPath = Join-Path $releaseDir "release-v$resolvedTarget.md"
    $zipExists = if (Test-Path $zipPath) { 'sim' } else { 'nao' }
    $manifestExists = if (Test-Path $manifestPath) { 'sim' } else { 'nao' }
    $notesExists = if (Test-Path $notesPath) { 'sim' } else { 'nao' }

    $readinessOutput = & "$PSScriptRoot\check-release-readiness.ps1" -Version $resolvedTarget
    $readinessJsonRaw = & "$PSScriptRoot\check-release-readiness.ps1" -Version $resolvedTarget -Json
    $readinessJson = $null
    if ($readinessJsonRaw) {
        $readinessJson = $readinessJsonRaw | ConvertFrom-Json
    }
    $dryRunOutput = & "$PSScriptRoot\release-local.ps1" -Version $resolvedTarget -DryRun

    $dryRunMap = [ordered]@{}
    foreach ($line in $dryRunOutput) {
        if ($line -match '=') {
            $key, $value = $line -split '=', 2
            $dryRunMap[$key] = $value
        }
    }

    if ($Json) {
        [ordered]@{
            entrada = $Version
            alvo = $resolvedTarget
            zip_existente = $zipExists
            manifesto_existente = $manifestExists
            notas_existentes = $notesExists
            prontidao = $(if ($readinessJson) { $readinessJson.estado } else { "" })
            prontidao_detalhes = $readinessJson
            dry_run = $dryRunMap
        } | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "[release-plan]"
    Write-Output "entrada=$Version"
    Write-Output "alvo=$resolvedTarget"
    Write-Output "zip_existente=$zipExists"
    Write-Output "manifesto_existente=$manifestExists"
    Write-Output "notas_existentes=$notesExists"
    Write-Output ""

    $readinessOutput
    Write-Output ""
    $dryRunOutput
}
finally {
    Pop-Location
}
