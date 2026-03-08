param(
    [string]$Version,
    [switch]$DryRun,
    [switch]$Json,
    [switch]$WithBrowserAudit
)

$ErrorActionPreference = "Stop"

if (-not $Version) {
    $versionFile = Join-Path (Split-Path -Parent $PSScriptRoot) "VERSION"
    if (-not (Test-Path $versionFile)) {
        throw "Arquivo VERSION nao encontrado."
    }
    $currentVersion = (Get-Content $versionFile -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($currentVersion)) {
        throw "Arquivo VERSION vazio."
    }
    $Version = "v$currentVersion"
}

$Version = & "$PSScriptRoot\normalize-release-version.ps1" -Version $Version

$repoRoot = Split-Path -Parent $PSScriptRoot
$versionFile = Join-Path $repoRoot "VERSION"
$releaseDir = Join-Path $repoRoot "release"
$zipPath = Join-Path $releaseDir "web-dist-$Version.zip"
$manifestPath = Join-Path $releaseDir "release-$Version.json"
$notesPath = Join-Path $releaseDir "release-$Version.md"
$currentVersionRaw = if (Test-Path $versionFile) { (Get-Content $versionFile -Raw).Trim() } else { "" }
$targetVersionRaw = & "$PSScriptRoot\resolve-version-target.ps1" -Version $Version

Push-Location $repoRoot
try {
    $readinessMessage = ""
    $isReady = $true
    try {
        if ($DryRun) {
            & "$PSScriptRoot\check-release-readiness.ps1" -Version $Version 2>$null | Out-Null
        }
        else {
            & "$PSScriptRoot\check-release-readiness.ps1" -Version $Version -RequireCurrentVersion | Out-Null
        }
    }
    catch {
        $isReady = $false
        $readinessMessage = $_.Exception.Message
        if (-not $DryRun) {
            throw
        }
    }

    if ($DryRun) {
        $status = if ($isReady) {
            if ($targetVersionRaw -eq $currentVersionRaw) { 'sim' } else { 'preparavel' }
        }
        else {
            'nao'
        }

        $result = [ordered]@{
            dry_run = 'sim'
            versao = $Version
            release_pronta = $status
            motivo_prontidao = $(if (-not $isReady) { $readinessMessage } else { "" })
            browser_audit = $(if ($WithBrowserAudit) { 'sim' } else { 'nao' })
            zip_path = $zipPath
            zip_existente = $(if (Test-Path $zipPath) { 'sim' } else { 'nao' })
            manifesto_path = $manifestPath
            manifesto_existente = $(if (Test-Path $manifestPath) { 'sim' } else { 'nao' })
            notas_path = $notesPath
            notas_existentes = $(if (Test-Path $notesPath) { 'sim' } else { 'nao' })
        }

        if ($Json) {
            $result | ConvertTo-Json -Depth 4
            return
        }

        Write-Output "dry_run=sim"
        Write-Output "versao=$Version"
        if ($isReady) {
            Write-Output "release_pronta=$status"
        }
        else {
            Write-Output "release_pronta=nao"
        }
        if (-not $isReady) {
            Write-Output "motivo_prontidao=$readinessMessage"
        }
        Write-Output "browser_audit=$(if ($WithBrowserAudit) { 'sim' } else { 'nao' })"
        Write-Output "zip_path=$zipPath"
        Write-Output "zip_existente=$(if (Test-Path $zipPath) { 'sim' } else { 'nao' })"
        Write-Output "manifesto_path=$manifestPath"
        Write-Output "manifesto_existente=$(if (Test-Path $manifestPath) { 'sim' } else { 'nao' })"
        Write-Output "notas_path=$notesPath"
        Write-Output "notas_existentes=$(if (Test-Path $notesPath) { 'sim' } else { 'nao' })"
        return
    }

    if (-not (Test-Path $releaseDir)) {
        New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
    }

    if (Test-Path $zipPath) {
        throw "O artefato $zipPath ja existe."
    }
    if (Test-Path $manifestPath) {
        throw "O manifesto $manifestPath ja existe."
    }
    if (Test-Path $notesPath) {
        throw "As notas de release $notesPath ja existem."
    }

    cmd /c scripts\rebuild.cmd --keep-release
    if ($LASTEXITCODE -ne 0) {
        throw "Falha no rebuild completo."
    }

    if ($WithBrowserAudit) {
        cmd /c scripts\browser-audit.cmd --skip-build
        if ($LASTEXITCODE -ne 0) {
            throw "Falha na auditoria real de navegador."
        }
    }

    if (-not (Test-Path $releaseDir)) {
        New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
    }

    Compress-Archive -Path "apps/web/dist/*" -DestinationPath $zipPath
    & "$PSScriptRoot\write-release-notes.ps1" -Version $Version -OutputPath $notesPath
    & "$PSScriptRoot\write-release-manifest.ps1" -Version $Version -ArtifactPath $zipPath -ManifestPath $manifestPath -NotesPath $notesPath
    & "$PSScriptRoot\verify-release.ps1" -Version $Version

    if ($Json) {
        [ordered]@{
            dry_run = 'nao'
            versao = $Version
            browser_audit = $(if ($WithBrowserAudit) { 'sim' } else { 'nao' })
            zip_path = $zipPath
            manifesto_path = $manifestPath
            notas_path = $notesPath
        } | ConvertTo-Json -Depth 4
        return
    }

    Write-Output "Artefato gerado: $zipPath"
}
finally {
    Pop-Location
}
